# language: python
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """
    Stores additional data like language level, progress and errors.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    language_level = models.CharField(max_length=50, blank=True)
    progress = models.IntegerField(default=0)
    errors = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

class Lesson(models.Model):
    """
    Represents a lesson.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Progress(models.Model):
    """
    Tracks each user\'s progress in a lesson.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="progresses")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progresses")
    completed = models.BooleanField(default=False)
    errors_count = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"