# language: python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Lesson, Progress, Assignment,
    ExerciseHistory, Recommendation, Rating, ExperienceSummary, LevelTest
)

# class RegistrationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'password', 'email']
#         extra_kwargs = {'password': {'write_only': True}}
#
#     def create(self, validated_data):
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data.get('email'),
#             password=validated_data['password']
#         )
#         return user
#
# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(max_length=150)
#     password = serializers.CharField(write_only=True)
#
#     def validate(self, data):
#         username = data.get('username')
#         password = data.get('password')
#         if username and password:
#             user = authenticate(username=username, password=password)
#             if user:
#                 data['user'] = user
#                 return data
#             raise serializers.ValidationError("Invalid credentials.")
#         raise serializers.ValidationError("Must include username and password.")

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'min_length': 8},
            'id': {'read_only': True}
        }

    def validate_username(self, value):
        """Check username uniqueness."""
        if self.instance and self.instance.username == value:
            return value
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with read-only computed fields."""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'username', 'email', 'name', 'surname', 'age',
            'language_level', 'progress', 'errors', 'learning_streak',
            'personal_goals', 'last_active', 'preferred_task_types',
            'avatar', 'bio'
        ]
        read_only_fields = ['id', 'progress', 'errors', 'learning_streak', 'last_active']

class LessonSerializer(serializers.ModelSerializer):
    """Serializer for Lesson model with assignment count."""
    assignments_count = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'created_at', 'status', 'assignments_count']
        read_only_fields = ['id', 'created_at']

    def get_assignments_count(self, obj):
        return obj.assignments.count()

    def validate_title(self, value):
        """Check title uniqueness только для текущего пользователя."""
        user = self.context['request'].user
        qs = Lesson.objects.filter(title=value, user=user)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Lesson with this title already exists.')
        return value

class AssignmentSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'lesson', 'lesson_title', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ProgressSerializer(serializers.ModelSerializer):
    """Serializer for Progress model."""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'lesson', 'lesson_title', 'completed', 'errors_count', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class ExerciseHistorySerializer(serializers.ModelSerializer):
    """Serializer for ExerciseHistory with validation."""

    class Meta:
        model = ExerciseHistory
        fields = [
            'id', 'task_type', 'ai_prompt', 'ai_generated_task_xml',
            'user_submission_raw', 'user_submission_parsed', 'ai_feedback_xml',
            'result_score', 'attempt_timestamp', 'completion_status',
            'parsed_task', 'parsed_feedback', 'parse_errors', 'user_feedback_notes'
        ]
        read_only_fields = ['id', 'attempt_timestamp']

    def validate_result_score(self, value):
        if value is not None and not (0 <= value <= 1):
            raise serializers.ValidationError('Score must be between 0 and 1.')
        return value

class RecommendationSerializer(serializers.ModelSerializer):
    """Serializer for Recommendation model."""

    class Meta:
        model = Recommendation
        fields = ['id', 'ai_prompt', 'generated_recommendations_xml', 'rating', 'timestamp']
        read_only_fields = ['id', 'timestamp']

    def validate_rating(self, value):
        if value is not None and not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

class RatingSerializer(serializers.ModelSerializer):
    """Serializer for Rating with GenericForeignKey support."""

    class Meta:
        model = Rating
        fields = ['id', 'content_type', 'object_id', 'rating_type', 'value', 'ai_feedback_xml', 'timestamp']
        read_only_fields = ['id', 'timestamp']

    def validate_value(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating value must be between 1 and 5.')
        return value

class ExperienceSummarySerializer(serializers.ModelSerializer):
    """Serializer for ExperienceSummary."""

    class Meta:
        model = ExperienceSummary
        fields = ['id', 'total_xp', 'completed_exercises', 'session_logs', 'skill_tree_json', 'updated_at']
        read_only_fields = ['id', 'updated_at']

class LevelTestSerializer(serializers.ModelSerializer):
    """Serializer for LevelTest."""

    class Meta:
        model = LevelTest
        fields = [
            'id', 'test_type', 'ai_generated_test_xml', 'user_answers',
            'ai_evaluation_xml', 'determined_level', 'total_score',
            'completed', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'ai_evaluation_xml', 'determined_level', 'total_score']
