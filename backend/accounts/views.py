from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public endpoint — anyone can create an account. New accounts default
    to the EMPLOYEE role unless 'role' is explicitly sent as 'ADMIN'
    (locked down further in PHASE 9 — Permissions).
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Accepts { "username": ..., "password": ... }.
    Returns { "access": ..., "refresh": ..., "user": {...} }.
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = CustomTokenObtainPairSerializer