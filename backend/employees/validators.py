from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator

# Accepts optional leading + and 7-15 digits (E.164-ish), e.g. +919876543210
phone_validator = RegexValidator(
    regex=r'^\+?\d{7,15}$',
    message='Enter a valid phone number (7 to 15 digits, optional leading +).',
)


def validate_image_size(file):
    """Reject uploaded profile images larger than MAX_UPLOAD_SIZE (5 MB)."""
    max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 5 * 1024 * 1024)
    if file.size > max_size:
        raise ValidationError(
            f'Image file too large. Maximum allowed size is {max_size // (1024 * 1024)} MB.'
        )


def employee_profile_image_path(instance, filename):
    """Store each employee's profile image under media/profile_images/<employee_id>/filename."""
    return f'profile_images/{instance.employee_id}/{filename}'
