from datetime import date
from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from accounts.models import User
from accounts.serializers import UserSerializer
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Read-only representation used for LIST and RETRIEVE.
    Shows everything, including the personal fields the employee filled
    in themselves via /api/profile/ (phone, address, gender, etc.) — the
    admin can see these, just not edit them from here.
    """

    user = UserSerializer(read_only=True)
    department_name = serializers.CharField(
        source='department.name', read_only=True, default=None
    )

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_id', 'phone', 'address', 'gender',
            'date_of_birth', 'department', 'department_name', 'designation',
            'joining_date', 'salary', 'profile_image', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EmployeeWriteSerializer(serializers.ModelSerializer):
    """
    Used for CREATE and UPDATE by an ADMIN.

    Admins control the employment/organizational side only: the login
    account itself (username/email/password/name), employee ID,
    department, salary, and joining date.

    Personal details (phone, address, gender, date of birth, designation)
    are filled in by the employee themselves via /api/profile/, not by
    the admin. A newly created employee starts with blank placeholders
    for those fields, which they complete after logging in.
    """

    username = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'employee_id', 'department', 'joining_date', 'salary',
        ]
        extra_kwargs = {
            'joining_date': {'required': False},
            'salary': {'required': False},
        }

    def validate_employee_id(self, value):
        qs = Employee.objects.filter(employee_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This employee ID is already in use.')
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_email(self, value):
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.user.pk)
        if qs.exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        user_fields = ['username', 'email', 'password', 'first_name', 'last_name']
        user_data = {f: validated_data.pop(f) for f in user_fields if f in validated_data}

        required = ['username', 'email', 'password']
        missing = [f for f in required if f not in user_data]
        if missing:
            raise serializers.ValidationError(
                {f: 'This field is required when creating a new employee.' for f in missing}
            )

        joining_date = validated_data.pop('joining_date', None) or date.today()
        salary = validated_data.pop('salary', None)
        if salary is None:
            salary = Decimal('0.00')

        with transaction.atomic():
            user = User.objects.create_user(
                username=user_data['username'],
                email=user_data['email'],
                password=user_data['password'],
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                role=User.Role.EMPLOYEE,
            )
            employee = Employee.objects.create(
                user=user,
                phone='',
                gender=Employee.Gender.OTHER,
                designation='Not Assigned',
                joining_date=joining_date,
                salary=salary,
                **validated_data,
            )
        return employee

    def update(self, instance, validated_data):
        user_fields = ['email', 'first_name', 'last_name']
        user_data = {f: validated_data.pop(f) for f in user_fields if f in validated_data}
        validated_data.pop('username', None)
        validated_data.pop('password', None)

        if user_data:
            for attr, val in user_data.items():
                setattr(instance.user, attr, val)
            instance.user.save()

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        return instance