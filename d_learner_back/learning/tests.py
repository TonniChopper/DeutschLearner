from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth.models import User

class RegistrationTest(APITestCase):
    def test_registration(self):
        url = reverse('register')
        data = {
            'username': 'testuser',
            'password': 'testpass123',
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)