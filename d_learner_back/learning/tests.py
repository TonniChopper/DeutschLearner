# language: python
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

class RegistrationAPITest(APITestCase):
    def setUp(self):
        self.url = reverse('register')

    def test_registration_missing_fields(self):
        data = {"username": "", "password": "", "email": "test@example.com"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_registration_duplicate_username(self):
        User.objects.create_user(username="testuser", password="password123", email="test@example.com")
        data = {"username": "testuser", "password": "newpass123", "email": "new@example.com"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    def test_registration_success(self):
        data = {"username": "newuser", "password": "secretpass", "email": "newuser@example.com"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)