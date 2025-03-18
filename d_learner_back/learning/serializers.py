# language: python
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Lesson, Progress, Assignment
from django.contrib.auth import authenticate

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
    """
    Serializer for User model.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        """ Проверка на уникальность имени пользователя """
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile.
    Allows updating email and password for the nested user,
    while preventing updates to progress, language_level, and errors.
    """
    user = UserSerializer()

    class Meta:
        model = UserProfile
        fields = ['user', 'name', 'email', 'surname', 'age', 'language_level', 'progress', 'errors']
        extra_kwargs = {'id': {'read_only': True}}

    def update(self, instance, validated_data):
        # Pop nested user data from validated_data
        user_data = validated_data.pop('user', {})

        # Prevent updates to fields that should not be changed by the user
        validated_data.pop('progress', None)
        validated_data.pop('language_level', None)
        validated_data.pop('errors', None)

        user = instance.user
        if 'email' in user_data:
            user.email = user_data['email']
        if 'password' in user_data:
            # Change the user's password securely
            user.set_password(user_data['password'])
        user.save()

        instance = super().update(instance, validated_data)
        return instance

class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson model.
    """
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'created_at']
        extra_kwargs = {'created_at': {'read_only': True}}

    def create(self, validated_data):
        return Lesson.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()
        return instance

    def validate(self, data):
        if 'title' in data:
            if Lesson.objects.filter(title=data['title']).exists():
                raise serializers.ValidationError('Lesson with this title already exists.')
        return data

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'lesson', 'content', 'created_at']

class ProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for Progress model.
    """
    lesson = LessonSerializer(read_only=True)

    class Meta:
        model = Progress
        fields = ['id', 'user', 'lesson', 'completed', 'errors_count', 'updated_at']

    def create(self, validated_data):
        return Progress.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.user = validated_data.get('user', instance.user)
        instance.lesson = validated_data.get('lesson', instance.lesson)
        instance.completed = validated_data.get('completed', instance.completed)
        instance.errors_count = validated_data.get('errors_count', instance.errors_count)
        instance.save()
        return instance
