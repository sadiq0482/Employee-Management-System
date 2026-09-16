from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model extending Django's built-in AbstractUser.

    We keep all of Django's default fields (username, email, password,
    first_name, last_name, is_active, date_joined) and add a `role` field
    that drives role-based access control throughout the whole system.

    Passwords are NEVER stored in plain text — AbstractUser already hashes
    them using Django's PBKDF2 hasher whenever you call set_password() /
    create_user() / create_superuser().
    """

    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        EMPLOYEE = 'EMPLOYEE', 'Employee'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.EMPLOYEE,
        help_text='Determines what the user is allowed to see and do.',
    )

    # Avoid reverse-accessor clashes with Django's default auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='ems_user_set',
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='ems_user_permissions_set',
        blank=True,
    )

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f'{self.username} ({self.role})'

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_employee_role(self):
        return self.role == self.Role.EMPLOYEE
