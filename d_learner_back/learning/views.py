# language: python
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .models import UserProfile, Lesson
from .serializers import UserSerializer, UserProfileSerializer, LessonSerializer
from .deepseek_service import generate_assignment

class RegistrationAPIView(APIView):
    """
    API endpoint for registration.
    """
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        if not username or not password:
            return Response({'error': 'Username and password are required.'},
                            status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists.'},
                            status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password, email=email)
        UserProfile.objects.create(user=user)
        token = Token.objects.create(user=user)
        return Response({'token': token.key}, status=status.HTTP_201_CREATED)

class LoginAPIView(APIView):
    """
    API endpoint for user login.
    """
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid credentials.'},
                        status=status.HTTP_400_BAD_REQUEST)

class ProfileAPIView(APIView):
    """
    Retrieves the authenticated user\'s profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        profile = request.user.profile
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Provides a read-only API view for lessons.
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

class AssignmentAPIView(APIView):
    """
    Generates an assignment using DeepSeek API.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        profile = request.user.profile
        assignment = generate_assignment(profile)
        return Response(assignment)