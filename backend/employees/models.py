from decimal import Decimal

from django.conf import settings
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db import models
from departments.models import Department
from .validators import phone_validator, validate_image_size, employee_profile_image_path


class Employee(models.Model):
    """
    Extends a User (one-to-one) with all employment-related details.
    Every Employee has exactly one User account and vice versa.
    """

    class Gender(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employee_profile',
    )
    employee_id = models.CharField(max_length=20, unique=True, db_index=True)
    phone = models.CharField(max_length=15, validators=[phone_validator])
    address = models.TextField(blank=True, default='')
    gender = models.CharField(max_length=10, choices=Gender.choices)
    date_of_birth = models.DateField(null=True, blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees',
    )
    designation = models.CharField(max_length=100)
    joining_date = models.DateField()
    salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
    )

    profile_image = models.ImageField(
        upload_to=employee_profile_image_path,
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
            validate_image_size,
        ],
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'employees'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
            models.Index(fields=['designation']),
        ]

    def __str__(self):
        return f'{self.employee_id} - {self.user.get_full_name() or self.user.username}'
