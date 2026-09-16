from rest_framework import serializers

from .models import Attendance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_code', 'date', 'check_in', 'check_out', 'status']
        read_only_fields = ['id']

    def get_employee_name(self, obj):
        full_name = f'{obj.employee.user.first_name} {obj.employee.user.last_name}'.strip()
        return full_name or obj.employee.user.username