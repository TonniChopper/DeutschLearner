from django.http import HttpResponse
from django.contrib import admin
from django.urls import path, include
from learning.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Welcome to the homepage!")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("learning/user/registration/", CreateUserView.as_view(), name="register"),
    path("learning/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("learning/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("learning-auth/", include("rest_framework.urls")),
    path("learning/", include("learning.urls")),
    path("core/", include("core.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
