
from django.contrib.auth.models import User
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import logging
from django.contrib.contenttypes.models import ContentType
from rest_framework.throttling import ScopedRateThrottle

from .models import (
    Lesson, LessonStatus, UserProfile, Assignment,
    ExerciseHistory, Recommendation, Rating, ExperienceSummary,
    TaskType, CompletionStatus, LevelTest
)
from .serializers import (
    UserSerializer, LessonSerializer, UserProfileSerializer, AssignmentSerializer,
    ExerciseHistorySerializer, RecommendationSerializer, RatingSerializer,
    ExperienceSummarySerializer, LevelTestSerializer
)
from .user_context import build_user_context
from . import ai_service, xml_parsers
from .audit import log_audit
from .monitoring import MonitoringMetrics, monitor_endpoint

logger = logging.getLogger('learning')

class CreateUserView(generics.CreateAPIView):
    """Create user with automatic JWT token generation."""
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        logger.info(f'User created: {user.username}')
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)

class LessonListCreateView(generics.ListCreateAPIView):
    """List and create user lessons."""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(user=self.request.user).select_related('user').prefetch_related('assignments').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        logger.info(f'Lesson created by {self.request.user.username}')

class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detailed view, update and delete lesson."""
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(user=self.request.user).select_related('user')

    def perform_update(self, serializer):
        if self.request.data.get("mark_completed"):
            serializer.save(status=LessonStatus.COMPLETED)
            logger.info(f'Lesson {serializer.instance.id} marked completed by {self.request.user.username}')
        else:
            serializer.save()

class ProfileView(generics.RetrieveUpdateAPIView):
    """Current user profile."""
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user.profile

class ExerciseHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for user exercise history."""
    serializer_class = ExerciseHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseHistory.objects.filter(user=self.request.user).order_by('-attempt_timestamp')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        logger.info(f'ExerciseHistory created for {self.request.user.username}')

class RecommendationViewSet(viewsets.ModelViewSet):
    """ViewSet for user recommendations."""
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Recommendation.objects.filter(user=self.request.user).order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RatingViewSet(viewsets.ModelViewSet):
    """ViewSet for user ratings."""
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rating.objects.filter(user=self.request.user).select_related('content_type').order_by('-timestamp')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExperienceSummaryView(generics.RetrieveUpdateAPIView):
    """View and update user experience."""
    serializer_class = ExperienceSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.experience

class UserContextView(APIView):
    """Aggregated user context for AI requests."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        n_per_type = int(request.query_params.get('n_per_type', 3))
        context = build_user_context(request.user, n_per_type=n_per_type)
        return Response(context)

class AIGenerateTaskView(APIView):
    """
    POST /api/ai/generate-task/
    Generates new task via AI based on user context.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai-generate'

    @monitor_endpoint('ai_generate_task')
    def post(self, request):
        task_type = request.data.get('task_type')
        desired_difficulty = request.data.get('desired_difficulty')

        if not task_type:
            return Response({'error': 'task_type is required'}, status=status.HTTP_400_BAD_REQUEST)

        if task_type not in [t.value for t in TaskType]:
            return Response({
                'error': f'Invalid task_type. Must be one of: {[t.value for t in TaskType]}'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = ai_service.generate_task_xml(
                user=request.user,
                task_type=task_type,
                desired_difficulty=desired_difficulty
            )
            if 'error' in result:
                MonitoringMetrics.record_ai_failure(
                    'generate_task',
                    result.get('error', 'Unknown error'),
                    request.user.id
                )
                return Response({'error': 'AI task generation failed', 'details': result['error'], 'raw_xml': result.get('raw_xml')}, status=status.HTTP_400_BAD_REQUEST)

            # Parse XML strictly
            parse_errors = []
            try:
                parsed_task = xml_parsers.parse_task_xml(task_type, result['xml'])
            except xml_parsers.ParseError as e:
                parsed_task = {}
                parse_errors.append(str(e))
                MonitoringMetrics.record_xml_parse_error(task_type, result['xml'], str(e))
            exercise = ExerciseHistory.objects.create(
                user=request.user,
                task_type=task_type,
                ai_prompt=result.get('prompt_used', ''),
                ai_generated_task_xml=result['xml'],
                parsed_task=parsed_task,
                parse_errors=parse_errors,
                completion_status=CompletionStatus.IN_PROGRESS
            )
            # Response
            payload = {
                'task_id': exercise.id,
                'task_xml': result['xml'],
                'task_type': task_type,
                'difficulty': desired_difficulty or request.user.profile.language_level,
                'parsed_task': parsed_task,
                'parse_errors': parse_errors,
                'message': 'Task generated successfully' if not parse_errors else 'Task generated with parsing issues'
            }
            status_code = status.HTTP_201_CREATED if not parse_errors else status.HTTP_207_MULTI_STATUS
            log_audit('ai_generate_task', request.user.id, {
                'task_type': task_type,
                'exercise_id': exercise.id,
                'parse_errors': parse_errors,
            })
            return Response(payload, status=status_code)
        except Exception as e:
            MonitoringMetrics.record_ai_failure('generate_task', str(e), request.user.id)
            logger.exception(f'Error generating AI task: {e}')
            return Response({'error': 'Failed to generate task', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AISubmitTaskView(APIView):
    """
    POST /api/ai/submit-task/
    Accepts user solution, evaluates via AI and saves feedback.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai-submit'

    @monitor_endpoint('ai_submit_task')
    def post(self, request):
        task_id = request.data.get('task_id')
        user_solution = request.data.get('user_solution')

        if not task_id or not user_solution:
            return Response({
                'error': 'task_id and user_solution are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get task
            exercise = ExerciseHistory.objects.get(id=task_id, user=request.user)
        except ExerciseHistory.DoesNotExist:
            return Response({
                'error': 'Task not found or does not belong to current user'
            }, status=status.HTTP_404_NOT_FOUND)

        if not exercise.ai_generated_task_xml:
            return Response({
                'error': 'Task does not have AI-generated XML'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Parse user_solution if it's JSON string
            if isinstance(user_solution, str):
                import json
                try:
                    user_solution_parsed = json.loads(user_solution)
                except json.JSONDecodeError:
                    user_solution_parsed = {'raw': user_solution}
            else:
                user_solution_parsed = user_solution

            result = ai_service.grade_submission(
                user=request.user,
                task_xml=exercise.ai_generated_task_xml,
                user_solution=str(user_solution)
            )
            if 'error' in result:
                MonitoringMetrics.record_ai_failure(
                    'grade_submission',
                    result.get('error', 'Unknown error'),
                    request.user.id
                )
                # Save error in history
                exercise.user_submission_raw = str(user_solution)
                exercise.user_submission_parsed = user_solution_parsed
                exercise.parse_errors = exercise.parse_errors + [result['error']]
                exercise.save()
                return Response({'error': 'AI feedback generation failed', 'details': result['error'], 'raw_xml': result.get('raw_xml')}, status=status.HTTP_400_BAD_REQUEST)
            # Strict feedback parsing
            parsed_feedback = {}
            try:
                parsed_feedback = xml_parsers.parse_feedback_xml(result['feedback_xml'])
            except xml_parsers.ParseError as e:
                exercise.parse_errors = exercise.parse_errors + [str(e)]
                MonitoringMetrics.record_xml_parse_error('feedback', result['feedback_xml'], str(e))
            # Update history
            exercise.user_submission_raw = str(user_solution)
            exercise.user_submission_parsed = user_solution_parsed
            exercise.ai_feedback_xml = result['feedback_xml']
            exercise.parsed_feedback = parsed_feedback
            exercise.result_score = result['score']
            exercise.completion_status = (
                CompletionStatus.COMPLETED if result['score'] >= 0.6
                else CompletionStatus.FAILED if result['score'] < 0.4
                else CompletionStatus.PARTIAL
            )
            exercise.save()

            # Update user statistics
            profile = request.user.profile
            if exercise.completion_status == CompletionStatus.COMPLETED:
                profile.progress += 10
            else:
                profile.errors += 1
            profile.save()

            # Update ExperienceSummary
            try:
                exp = request.user.experience
                xp_gain = int(result['score'] * 50)  # Up to 50 XP per task
                exp.total_xp += xp_gain
                exp.completed_exercises += 1
                exp.save()
            except Exception as e:
                logger.warning(f'Could not update experience: {e}')

            logger.info(f'Task {task_id} submitted by {request.user.username}, score: {result["score"]:.2f}')

            # Response
            payload = {
                'task_id': exercise.id,
                'score': result['score'],
                'status': exercise.completion_status,
                'feedback_xml': result['feedback_xml'],
                'parsed_feedback': parsed_feedback,
                'parse_errors': exercise.parse_errors,
                'xp_gained': (int(result['score'] * 50) if 'score' in result else 0),
                'message': 'Submission graded successfully' if parsed_feedback else 'Submission graded with parsing issues'
            }
            log_audit('ai_submit_task', request.user.id, {
                'task_id': exercise.id,
                'score': result['score'],
                'status': exercise.completion_status,
                'parse_errors': exercise.parse_errors,
            })
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            MonitoringMetrics.record_ai_failure('grade_submission', str(e), request.user.id)
            logger.exception(f'Error grading submission: {e}')
            return Response({'error': 'Failed to grade submission', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AIRecommendationsView(APIView):
    """
    POST /api/ai/recommendations/
    Generates personalized recommendations via AI.
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai-recommend'

    def post(self, request):
        current_skill = request.data.get('current_skill')

        try:
            # Generate recommendations via AI
            result = ai_service.generate_recommendations_xml(
                user=request.user,
                current_skill=current_skill
            )

            if 'error' in result:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)

            # Save recommendation
            recommendation = Recommendation.objects.create(
                user=request.user,
                ai_prompt=result.get('prompt_used', ''),
                generated_recommendations_xml=result['recommendations_xml']
            )

            logger.info(f'AI recommendations generated for {request.user.username}, id={recommendation.id}')

            log_audit('ai_recommendations', request.user.id, {
                'recommendation_id': recommendation.id,
            })
            return Response({
                'recommendation_id': recommendation.id,
                'recommendations_xml': result['recommendations_xml'],
                'message': 'Recommendations generated successfully'
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception(f'Error generating recommendations: {e}')
            return Response({
                'error': 'Failed to generate recommendations',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request):
        """Get user's recent recommendations."""
        recommendations = Recommendation.objects.filter(user=request.user).order_by('-timestamp')[:5]
        serializer = RecommendationSerializer(recommendations, many=True)
        return Response(serializer.data)

class LevelTestView(APIView):
    """
    POST /learning/level-test/ - Start or submit test
    GET /learning/level-test/?action=current - Get current incomplete test
    GET /learning/level-test/?action=history - Test history
    GET /learning/level-test/?action=status - User status
    """
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'level-test'

    def post(self, request):
        """Start new level test or submit answers."""
        action = request.data.get('action')

        if action == 'start':
            test_type = request.data.get('test_type', 'initial')

            # Check for incomplete test
            existing = LevelTest.objects.filter(user=request.user, completed=False).first()
            if existing:
                return Response({
                    'error': 'You have an incomplete test',
                    'test_id': existing.id,
                    'message': 'Please complete or cancel the existing test first'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Generate test
            try:
                result = ai_service.generate_level_test_xml(test_type)

                level_test = LevelTest.objects.create(
                    user=request.user,
                    test_type=test_type,
                    ai_generated_test_xml=result['test_xml'],
                    ai_prompt=result.get('prompt_used', '')
                )

                logger.info(f'Level test started for {request.user.username}, id={level_test.id}')

                return Response({
                    'test_id': level_test.id,
                    'test_xml': result['test_xml'],
                    'test_type': test_type,
                    'message': 'Level test generated successfully'
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                logger.exception(f'Error generating level test: {e}')
                return Response({
                    'error': 'Failed to generate level test',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        elif action == 'submit':
            test_id = request.data.get('test_id')
            user_answers = request.data.get('answers')  # {question_id: answer}

            if not test_id or not user_answers:
                return Response({
                    'error': 'test_id and answers are required'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                level_test = LevelTest.objects.get(id=test_id, user=request.user, completed=False)
            except LevelTest.DoesNotExist:
                return Response({
                    'error': 'Test not found or already completed'
                }, status=status.HTTP_404_NOT_FOUND)

            # Evaluate test
            try:
                evaluation = ai_service.evaluate_level_test(
                    level_test.ai_generated_test_xml,
                    user_answers
                )

                # Update test
                level_test.user_answers = user_answers
                level_test.ai_evaluation_xml = evaluation['evaluation_xml']
                level_test.determined_level = evaluation['determined_level']
                level_test.total_score = evaluation['total_score']
                level_test.completed = True
                level_test.completed_at = timezone.now()
                level_test.save()

                # Update user profile
                profile = request.user.profile
                profile.language_level = evaluation['determined_level']
                profile.last_level_test_date = timezone.now()

                # If this is the first test
                if level_test.test_type == 'initial' and not profile.initial_test_completed:
                    profile.initial_test_completed = True

                profile.save()

                logger.info(f'Level test {test_id} completed by {request.user.username}, level: {evaluation["determined_level"]}')

                return Response({
                    'test_id': level_test.id,
                    'determined_level': evaluation['determined_level'],
                    'total_score': evaluation['total_score'],
                    'evaluation_xml': evaluation['evaluation_xml'],
                    'message': 'Test completed successfully'
                }, status=status.HTTP_200_OK)

            except Exception as e:
                logger.exception(f'Error evaluating level test: {e}')
                return Response({
                    'error': 'Failed to evaluate test',
                    'details': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({
                'error': 'Invalid action. Use "start" or "submit"'
            }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Get test information."""
        action = request.query_params.get('action', 'current')

        if action == 'current':
            # Current incomplete test
            test = LevelTest.objects.filter(user=request.user, completed=False).first()
            if test:
                serializer = LevelTestSerializer(test)
                return Response(serializer.data)
            else:
                return Response({
                    'message': 'No active test',
                    'initial_test_completed': request.user.profile.initial_test_completed
                }, status=status.HTTP_404_NOT_FOUND)

        elif action == 'history':
            # All tests history
            tests = LevelTest.objects.filter(user=request.user, completed=True).order_by('-completed_at')[:10]
            serializer = LevelTestSerializer(tests, many=True)
            return Response(serializer.data)

        elif action == 'status':
            # User status
            profile = request.user.profile
            return Response({
                'initial_test_completed': profile.initial_test_completed,
                'current_level': profile.language_level,
                'last_test_date': profile.last_level_test_date.isoformat() if profile.last_level_test_date else None,
                'has_active_test': LevelTest.objects.filter(user=request.user, completed=False).exists()
            })

        else:
            return Response({
                'error': 'Invalid action. Use "current", "history", or "status"'
            }, status=status.HTTP_400_BAD_REQUEST)

class TaskListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'tasks'
    serializer_class = ExerciseHistorySerializer

    def get_queryset(self):
        qs = ExerciseHistory.objects.filter(user=self.request.user)
        task_type = self.request.query_params.get('type')
        status_f = self.request.query_params.get('status')
        since = self.request.query_params.get('since')
        if task_type:
            qs = qs.filter(task_type=task_type)
        if status_f:
            qs = qs.filter(completion_status=status_f)
        if since:
            try:
                from django.utils.dateparse import parse_datetime
                dt = parse_datetime(since)
                if dt:
                    qs = qs.filter(attempt_timestamp__gte=dt)
            except Exception:
                pass
        return qs.order_by('-attempt_timestamp')

class TaskStartView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai-generate'

    def post(self, request):
        task_type = request.data.get('task_type')
        difficulty = request.data.get('difficulty')
        if not task_type:
            return Response({'error': 'task_type is required'}, status=400)
        # Переиспользуем AIGenerateTaskView
        return AIGenerateTaskView().post(request)

class TaskSubmitView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ai-submit'

    def post(self, request):
        # Переиспользуем AISubmitTaskView
        return AISubmitTaskView().post(request)

class TaskDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExerciseHistorySerializer

    def get_queryset(self):
        return ExerciseHistory.objects.filter(user=self.request.user)

class UserProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .user_context import build_user_context
        ctx = build_user_context(request.user, n_per_type=3)
        # Добавим последние рекомендации
        recs = Recommendation.objects.filter(user=request.user).order_by('-timestamp')[:5]
        recs_ser = RecommendationSerializer(recs, many=True).data
        ctx['recommendations']['recent'] = recs_ser
        return Response(ctx)

class RatingsIntakeView(APIView):
    """POST /learning/ratings/ — accept user ratings (task/recommendation/experience)."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ratings'

    def post(self, request):
        rating_type = request.data.get('rating_type')
        value = request.data.get('value')
        object_id = request.data.get('object_id')
        model = request.data.get('model')  # 'ExerciseHistory' | 'Recommendation' | None for EXPERIENCE
        if rating_type is None or value is None:
            return Response({'error': 'rating_type and value are required'}, status=400)
        try:
            value_i = int(value)
            if not (1 <= value_i <= 5):
                return Response({'error': 'value must be between 1 and 5'}, status=400)
        except ValueError:
            return Response({'error': 'value must be integer'}, status=400)

        content_type = None
        if model and object_id:
            try:
                ct = ContentType.objects.get(app_label='learning', model=model.lower())
                # Проверим принадлежность объекта пользователю
                obj = ct.get_object_for_this_type(pk=object_id)
                if hasattr(obj, 'user') and obj.user != request.user:
                    return Response({'error': 'Object does not belong to current user'}, status=403)
                content_type = ct
            except ContentType.DoesNotExist:
                return Response({'error': 'Unsupported model'}, status=400)
            except Exception:
                return Response({'error': 'Object not found'}, status=404)

        rating = Rating.objects.create(
            user=request.user,
            content_type=content_type if content_type else ContentType.objects.get_for_model(User),
            object_id=object_id or request.user.id,
            rating_type=rating_type,
            value=value_i
        )
        logger.info(f'Rating stored: {rating_type}={value_i} by {request.user.username}')
        log_audit('rating_intake', request.user.id, {
            'rating_type': rating_type,
            'value': value_i,
            'object_id': object_id,
            'model': model,
        })
        return Response({'message': 'Rating recorded', 'id': rating.id}, status=201)

class TaskFeedbackView(APIView):
    """POST /learning/tasks/feedback/ — accept arbitrary text feedback по задаче."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'feedback'

    def post(self, request):
        task_id = request.data.get('task_id')
        note = request.data.get('note')
        if not task_id or not note:
            return Response({'error': 'task_id and note are required'}, status=400)
        try:
            ex = ExerciseHistory.objects.get(pk=task_id, user=request.user)
        except ExerciseHistory.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)
        ex.user_feedback_notes = (ex.user_feedback_notes or []) + [str(note)]
        ex.save()
        log_audit('task_feedback', request.user.id, {
            'task_id': ex.id,
            'notes_count': len(ex.user_feedback_notes)
        })
        return Response({'message': 'Feedback saved', 'notes_count': len(ex.user_feedback_notes)}, status=201)

class RecommendationsOverviewView(APIView):
    """GET /learning/recommendations/ — return actual recommendations и недавние источники."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # last 10 recommendations
        recs = Recommendation.objects.filter(user=request.user).order_by('-timestamp')[:10]
        data = RecommendationSerializer(recs, many=True).data
        # effectiveness statistics (простая метрика по оценкам)
        ratings = Rating.objects.filter(user=request.user, rating_type='recommendation')
        avg = None
        if ratings.exists():
            avg = sum(r.value for r in ratings) / ratings.count()
        return Response({'items': data, 'avg_recommendation_rating': avg}, status=200)
