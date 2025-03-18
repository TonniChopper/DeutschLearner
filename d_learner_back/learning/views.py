# # language: python
# from django.contrib.auth.models import User
# from django.contrib.auth import authenticate
# from rest_framework import status, viewsets
# from rest_framework.response import Response
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from rest_framework.authtoken.models import Token
# from .models import UserProfile, Lesson
# from .serializers import UserSerializer, UserProfileSerializer, LessonSerializer, RegistrationSerializer, \
#     LoginSerializer
# from .deepseek_service import generate_assignment
#
#
# class RegistrationAPIView(APIView):
#     def post(self, request, *args, **kwargs):
#         serializer = RegistrationSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.save()
#             token = Token.objects.create(user=user)
#             return Response({'token': token.key}, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# class LoginAPIView(APIView):
#     permission_classes = [AllowAny]
#
#     def post(self, request, format=None):
#         print("Received data:", request.data)  # Debug print
#         serializer = LoginSerializer(data=request.data)
#         if serializer.is_valid():
#             user = serializer.validated_data['user']
#             token, created = Token.objects.get_or_create(user=user)
#             return Response({'token': token.key}, status=status.HTTP_200_OK)
#         print("Serializer errors:", serializer.errors)  # Debug print
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# class ProfileAPIView(APIView):
#     """
#     Retrieves the authenticated user\'s profile.
#     """
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request, format=None):
#         profile = request.user.profile
#         serializer = UserProfileSerializer(profile)
#         return Response(serializer.data)
#
#     def put(self, request, format=None):
#         profile = request.user.profile
#         serializer = UserProfileSerializer(profile, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#
#
#
# class LessonViewSet(viewsets.ReadOnlyModelViewSet):
#     """
#     Provides a read-only API view for lessons.
#     """
#     queryset = Lesson.objects.all()
#     serializer_class = LessonSerializer
#     permission_classes = [IsAuthenticated]
#
#     def list(self, request):
#         queryset = Lesson.objects.all()
#         serializer = LessonSerializer(queryset, many=True)
#         return Response(serializer.data)
#
#
# class AssignmentAPIView(APIView):
#     """
#     Generates an assignment using DeepSeek API.
#     """
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request, format=None):
#         profile = request.user.profile
#         assignment = generate_assignment(profile)
#         return Response(assignment)

from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.response import Response

from .models import Lesson, LessonStatus, UserProfile, Assignment
from .serializers import UserSerializer, LessonSerializer, UserProfileSerializer, AssignmentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .deepseek_service import generate_assignment

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return User.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        instance.set_password(instance.password)
        instance.save()

class AssignmentAPIView(generics.GenericAPIView):
    """
    Generates an assignment using DeepSeek API and saves it to a Lesson.
    If a lesson id is provided as a query parameter (lesson_id), the new assignment is added to that lesson.
    Otherwise a new lesson is created.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        profile = request.user.profile
        assignment_content = generate_assignment(profile)

        lesson_id = request.query_params.get("lesson_id")
        if lesson_id:
            try:
                lesson = Lesson.objects.get(id=lesson_id, user=request.user)
            except Lesson.DoesNotExist:
                return Response({"error": "Lesson not found."}, status=404)
        else:
            lesson = Lesson.objects.create(
                user=request.user,
                title="New Lesson",
                content=""
            )

        assignment = Assignment.objects.create(
            lesson=lesson,
            content=assignment_content
        )
        # Optionally append the new assignment's content to the lesson content.
        lesson.content += f"\n\nAssignment {assignment.id}:\n{assignment_content}"
        lesson.save()

        serializer = AssignmentSerializer(assignment)
        return Response({"assignment": serializer.data, "lesson_id": lesson.id})

class LessonListCreate(generics.ListCreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if(serializer.is_valid()):
            serializer.save(user=self.request.user)
        else:
            return Response(serializer.errors, status=400)

class LessonDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        if self.request.data.get("mark_completed"):
            serializer.save(user=self.request.user, status=LessonStatus.COMPLETED)
        else:
            serializer.save(user=self.request.user)

class ProfileAPIView(generics.RetrieveUpdateAPIView):
    """
    Retrieves the authenticated user\'s profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save(user=self.request.user)
        new_password = self.request.data.get('password')
        if new_password:
            instance.user.set_password(new_password)
            instance.user.save()
