from django.core.exceptions import ValidationError
from django.db import models

from employees.models import Employee


class Attendance(models.Model):
    """One attendance record per employee per calendar day."""

    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        ABSENT = 'ABSENT', 'Absent'
        HALF_DAY = 'HALF_DAY', 'Half Day'
        LEAVE = 'LEAVE', 'Leave'

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='attendance_records',
    )
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices)

    class Meta:
        db_table = 'attendance'
        ordering = ['-date']
        unique_together = ('employee', 'date')  # one record per employee per day
        indexes = [
            models.Index(fields=['employee', 'date']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.employee.employee_id} | {self.date} | {self.status}'

    def clean(self):
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            raise ValidationError({'check_out': 'Check-out time must be after check-in time.'})

    def save(self, *args, **kwargs):
        self.full_clean(exclude=None)
        super().save(*args, **kwargs)
