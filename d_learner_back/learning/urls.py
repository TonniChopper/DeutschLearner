# language: python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CreateUserView, LessonListCreateView, LessonDetailView,
    ProfileView, ExerciseHistoryViewSet, RecommendationViewSet, RatingViewSet,
    ExperienceSummaryView, UserContextView,
    AIGenerateTaskView, AISubmitTaskView, AIRecommendationsView, LevelTestView,
    TaskListView, TaskStartView, TaskSubmitView, TaskDetailView, UserProgressView,
    RatingsIntakeView, TaskFeedbackView, RecommendationsOverviewView
)
from .health_checks import HealthCheckView, ReadinessCheckView, LivenessCheckView

router = DefaultRouter()
router.register(r'exercise-history', ExerciseHistoryViewSet, basename='exercise-history')
router.register(r'recommendations', RecommendationViewSet, basename='recommendations')
router.register(r'ratings', RatingViewSet, basename='ratings')

urlpatterns = [
    # Health checks (for monitoring and orchestration)
    path('health/', HealthCheckView.as_view(), name='health-check'),
    path('ready/', ReadinessCheckView.as_view(), name='readiness-check'),
    path('live/', LivenessCheckView.as_view(), name='liveness-check'),

    # Registration and profile
    path('registration/', CreateUserView.as_view(), name='user-registration'),
    path('profile/', ProfileView.as_view(), name='user-profile'),

    # Lessons and assignments
    path('lessons/', LessonListCreateView.as_view(), name='lesson-list-create'),
    path('lessons/<int:pk>/', LessonDetailView.as_view(), name='lesson-detail'),

    # Experience and context
    path('experience/', ExperienceSummaryView.as_view(), name='experience-summary'),
    path('context/', UserContextView.as_view(), name='user-context'),

    # AI Endpoints
    path('ai/generate-task/', AIGenerateTaskView.as_view(), name='ai-generate-task'),
    path('ai/submit-task/', AISubmitTaskView.as_view(), name='ai-submit-task'),
    path('ai/recommendations/', AIRecommendationsView.as_view(), name='ai-recommendations'),

    # Level Test (NEW!)
    path('level-test/', LevelTestView.as_view(), name='level-test'),

    # RESTful Tasks API
    path('tasks/', TaskListView.as_view(), name='tasks-list'),
    path('tasks/start/', TaskStartView.as_view(), name='tasks-start'),
    path('tasks/submit/', TaskSubmitView.as_view(), name='tasks-submit'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='tasks-detail'),

    # User progress API
    path('user/progress/', UserProgressView.as_view(), name='user-progress'),

    # Ratings intake and task feedback
    path('ratings/', RatingsIntakeView.as_view(), name='ratings-intake'),
    path('tasks/feedback/', TaskFeedbackView.as_view(), name='tasks-feedback'),

    # Recommendations overview
    path('recommendations/', RecommendationsOverviewView.as_view(), name='recommendations-overview'),

    # ViewSets via router
    path('', include(router.urls)),
]
