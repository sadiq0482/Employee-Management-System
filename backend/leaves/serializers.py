from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import LeaveType, LeaveRequest


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = ['id', 'name', 'description', 'maximum_days']


class LeaveRequestSerializer(serializers.ModelSerializer):
    """Read-only representation used for LIST/RETRIEVE — shown to both admins and employees."""

    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_code', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'reason', 'status', 'admin_comment',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'employee', 'status', 'admin_comment', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        full_name = f'{obj.employee.user.first_name} {obj.employee.user.last_name}'.strip()
        return full_name or obj.employee.user.username


class LeaveRequestCreateSerializer(serializers.ModelSerializer):
    """
    Used by POST /api/leaves/ — an employee applying for leave.
    The `employee` is set automatically from the logged-in user, never from
    the request body, so nobody can apply for leave on someone else's behalf.
    """

    class Meta:
        model = LeaveRequest
        fields = ['id', 'leave_type', 'start_date', 'end_date', 'reason']

    def validate(self, attrs):
        if attrs['end_date'] < attrs['start_date']:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        return attrs

    def create(self, validated_data):
        employee = getattr(self.context['request'].user, 'employee_profile', None)
        if employee is None:
            raise serializers.ValidationError(
                {'non_field_errors': ['Your account has no employee profile yet. Contact an administrator.']}
            )
        try:
            return LeaveRequest.objects.create(employee=employee, **validated_data)
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, 'message_dict') else {'non_field_errors': e.messages}
            raise serializers.ValidationError(detail)