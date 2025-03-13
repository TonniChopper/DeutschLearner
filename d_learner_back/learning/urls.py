# language: python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistrationAPIView, LoginAPIView, ProfileAPIView, LessonViewSet, AssignmentAPIView

router = DefaultRouter()
router.register(r'lessons', LessonViewSet, basename='lesson')

urlpatterns = [
    path('auth/register/', RegistrationAPIView.as_view(), name='register'),
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('assignment/', AssignmentAPIView.as_view(), name='assignment'),
    path('', include(router.urls)),
]