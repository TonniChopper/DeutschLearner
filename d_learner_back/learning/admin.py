from django.contrib import admin
from .models import UserProfile, Lesson, Progress

admin.site.register(UserProfile)
admin.site.register(Lesson)
admin.site.register(Progress)