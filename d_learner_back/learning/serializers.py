# language: python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Lesson, Progress

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model.
    """
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user', 'language_level', 'progress', 'errors']

class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson model.
    """
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'created_at']

class ProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for Progress model.
    """
    lesson = LessonSerializer(read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'user', 'lesson', 'completed', 'errors_count', 'updated_at']