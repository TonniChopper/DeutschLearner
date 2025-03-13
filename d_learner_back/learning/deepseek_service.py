import requests
from django.conf import settings

def generate_assignment(user_profile):
    payload = {
        'language_level': user_profile.language_level,
        'errors': user_profile.errors,
        'progress': user_profile.progress,
    }
    deepseek_url = 'https://api.deepseek.example.com/generate'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {settings.DEEPSEEK_API_KEY}'
    }
    try:
        response = requests.post(deepseek_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        return {'error': 'Failed to generate assignment', 'details': str(e)}