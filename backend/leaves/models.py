from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models

from employees.models import Employee


class LeaveType(models.Model):
    """e.g. Sick Leave, Casual Leave, Earned Leave — each with a yearly cap."""

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, default='')
    maximum_days = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        db_table = 'leave_types'
        ordering = ['name']

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    """A single leave application submitted by an employee."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CANCELLED = 'CANCELLED', 'Cancelled'

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='leave_requests',
    )
    leave_type = models.ForeignKey(
        LeaveType,
        on_delete=models.PROTECT,
        related_name='leave_requests',
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    admin_comment = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leave_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['employee', 'status']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f'{self.employee.employee_id} | {self.leave_type} | {self.start_date} - {self.end_date}'

    def clean(self):
        errors = {}

        # End date cannot be before start date.
        if self.start_date and self.end_date and self.end_date < self.start_date:
            errors['end_date'] = 'End date cannot be before start date.'

        # A leave request cannot overlap an already-approved leave for the
        # same employee (excluding itself, so edits don't clash with themselves).
        if self.employee_id and self.start_date and self.end_date:
            overlapping = LeaveRequest.objects.filter(
                employee_id=self.employee_id,
                status=self.Status.APPROVED,
                start_date__lte=self.end_date,
                end_date__gte=self.start_date,
            ).exclude(pk=self.pk)

            if overlapping.exists():
                errors['non_field_errors'] = (
                    'This leave request overlaps with an already approved leave.'
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean(exclude=None)
        super().save(*args, **kwargs)
