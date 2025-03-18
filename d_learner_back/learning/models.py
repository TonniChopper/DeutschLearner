# language: python
from django.db import models
from django.contrib.auth.models import User

class LessonStatus(models.TextChoices):
    COMPLETED = 'completed', 'Completed'
    IN_PROGRESS = 'in_progress', 'In Progress'
    FRESH = 'fresh', 'Fresh'

class UserProfile(models.Model):
    """
    Stores additional data like language level, progress and errors.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    email = models.EmailField(blank=True, null=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    surname = models.CharField(max_length=200, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    language_level = models.CharField(max_length=50, blank=True)
    progress = models.IntegerField(default=0)
    errors = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username

class Lesson(models.Model):
    """
    Represents a lesson.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)  # content will accumulate assignments if needed
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=LessonStatus.choices, default=LessonStatus.FRESH)
def __str__(self):
        return self.title

class Assignment(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="assignments")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Assignment {self.id} for {self.lesson.title}"

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