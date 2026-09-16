from datetime import date

from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response

from departments.models import Department
from employees.models import Employee
from leaves.models import LeaveRequest
from leaves.serializers import LeaveRequestSerializer
from attendance.models import Attendance
from .permissions import IsAdmin, IsEmployeeRole


class AdminDashboardView(APIView):
    """
    GET /api/dashboard/admin/  (admin only)

    Returns the summary numbers and chart data shown on the admin dashboard.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        today = date.today()

        employees_by_department = list(
            Department.objects.annotate(count=Count('employees')).values('name', 'count')
        )
        leave_stats = list(
            LeaveRequest.objects.values('status').annotate(count=Count('id'))
        )
        attendance_stats = list(
            Attendance.objects.filter(date=today).values('status').annotate(count=Count('id'))
        )

        data = {
            'total_employees': Employee.objects.count(),
            'total_departments': Department.objects.count(),
            'pending_leaves': LeaveRequest.objects.filter(status=LeaveRequest.Status.PENDING).count(),
            'approved_leaves': LeaveRequest.objects.filter(status=LeaveRequest.Status.APPROVED).count(),
            'rejected_leaves': LeaveRequest.objects.filter(status=LeaveRequest.Status.REJECTED).count(),
            'present_today': Attendance.objects.filter(date=today, status=Attendance.Status.PRESENT).count(),
            'absent_today': Attendance.objects.filter(date=today, status=Attendance.Status.ABSENT).count(),
            'employees_by_department': employees_by_department,
            'leave_stats': leave_stats,
            'attendance_stats': attendance_stats,
        }
        return Response(data)


class EmployeeDashboardView(APIView):
    """
    GET /api/dashboard/employee/  (employee only)

    Returns the logged-in employee's own summary numbers and recent leave requests.
    """
    permission_classes = [IsEmployeeRole]

    def get(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if employee is None:
            return Response({'detail': 'No employee profile found for this account.'}, status=404)

        today = date.today()
        todays_attendance = Attendance.objects.filter(employee=employee, date=today).first()
        leaves_qs = LeaveRequest.objects.filter(employee=employee)

        full_name = f'{employee.user.first_name} {employee.user.last_name}'.strip()

        data = {
            'employee_name': full_name or employee.user.username,
            'employee_id': employee.employee_id,
            'department': employee.department.name if employee.department else None,
            'designation': employee.designation,
            'todays_attendance': todays_attendance.status if todays_attendance else 'NOT_MARKED',
            'total_leave_requests': leaves_qs.count(),
            'pending_leaves': leaves_qs.filter(status=LeaveRequest.Status.PENDING).count(),
            'approved_leaves': leaves_qs.filter(status=LeaveRequest.Status.APPROVED).count(),
            'rejected_leaves': leaves_qs.filter(status=LeaveRequest.Status.REJECTED).count(),
            'recent_leave_requests': LeaveRequestSerializer(
                leaves_qs.order_by('-created_at')[:5], many=True
            ).data,
        }
        return Response(data)