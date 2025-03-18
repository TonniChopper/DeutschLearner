# language: python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LessonListCreate, AssignmentAPIView, LessonDetail, CreateUserView, ProfileAPIView

router = DefaultRouter()


urlpatterns = [
    path('registration/', CreateUserView.as_view(), name='create-user'),
    path('assignment/', AssignmentAPIView.as_view(), name='assignment'),
    path('lesson/', LessonListCreate.as_view(), name='lesson-list-create'),
    path('lesson/detail/<int:pk>/', LessonDetail.as_view(), name='lesson-detail'),
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('', include(router.urls)),
]