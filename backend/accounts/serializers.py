from datetime import date
from decimal import Decimal

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/auth/register/ — the PUBLIC self-signup form.

    Security rule: the public form can only ever create EMPLOYEE accounts.
    'role' is intentionally excluded from writable fields so nobody can
    grant themselves admin access by sending role="ADMIN" in the request.

    When someone registers, a bare-bones Employee profile is created for
    them automatically (with placeholder employee ID, designation, salary,
    etc.) so they immediately show up in the admin's Employee list. An
    admin then edits that record to fill in the real details.
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        # Always EMPLOYEE — admin accounts are never created through public signup.
        validated_data['role'] = User.Role.EMPLOYEE
        user = User.objects.create_user(**validated_data)

        # Imported here (not at module top) to avoid a circular import.
        from employees.models import Employee
        Employee.objects.create(
            user=user,
            employee_id=f'PENDING-{user.id}',
            phone='',
            gender=Employee.Gender.OTHER,
            designation='Not Assigned',
            joining_date=date.today(),
            salary=Decimal('0.00'),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Read-only representation of the logged-in user, used in login response and /api/profile/."""

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
        read_only_fields = fields


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT's default login serializer so:
    1. The JWT itself carries the user's role and username as claims.
    2. The login HTTP response includes the full user object, so the
       React frontend immediately knows the role without a second request.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data