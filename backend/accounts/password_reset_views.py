from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User


class PasswordResetRequestView(APIView):
    """
    POST /api/auth/password-reset/
    Body: {"email": "..."}

    Always returns the same generic success message, whether or not the
    email exists — this stops the endpoint being used to discover which
    emails are registered in the system.

    In local development, EMAIL_BACKEND is set to print emails to the
    Django terminal instead of actually sending them (see settings.py).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        user = User.objects.filter(email__iexact=email).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f'http://localhost:5173/reset-password/{uid}/{token}/'

            send_mail(
                subject='Reset your Employee Management password',
                message=(
                    f'Hi {user.username},\n\n'
                    f'Click the link below to reset your password:\n{reset_link}\n\n'
                    f'If you did not request this, you can safely ignore this email.'
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response(
            {'detail': 'If an account with that email exists, a reset link has been sent.'},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset-confirm/
    Body: {"uid": "...", "token": "...", "new_password": "..."}
    """
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password', '')

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response(
                {'detail': 'This reset link is invalid or has expired.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            return Response({'new_password': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password has been reset successfully.'})