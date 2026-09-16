from datetime import date, datetime

from django.core.exceptions import ValidationError as DjangoValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError as DRFValidationError

from accounts.permissions import IsAdmin, IsEmployeeRole
from .models import Attendance
from .serializers import AttendanceSerializer


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    GET    /api/attendance/             - list (own for employee, all for admin)
                                           filter with ?employee=<id>&date=YYYY-MM-DD&status=PRESENT
    POST   /api/attendance/             - admin only, manually add a record
    PUT    /api/attendance/<id>/        - admin only, edit a record
    DELETE /api/attendance/<id>/        - admin only
    POST   /api/attendance/check_in/    - employee only, checks themself in for today
    POST   /api/attendance/check_out/   - employee only, checks themself out for today
    """
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'date', 'status']

    def get_queryset(self):
        user = self.request.user
        qs = Attendance.objects.select_related('employee__user')
        if user.role == 'ADMIN':
            return qs
        return qs.filter(employee__user=user)

    def get_permissions(self):
        if self.action in ('check_in', 'check_out'):
            return [IsEmployeeRole()]
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def perform_create(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, 'message_dict') else {'non_field_errors': e.messages}
            raise DRFValidationError(detail)

    def perform_update(self, serializer):
        try:
            serializer.save()
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, 'message_dict') else {'non_field_errors': e.messages}
            raise DRFValidationError(detail)

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if employee is None:
            return Response(
                {'detail': 'No employee profile found for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()
        record, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={'check_in': datetime.now().time(), 'status': Attendance.Status.PRESENT},
        )
        if not created:
            if record.check_in:
                return Response(
                    {'detail': 'You have already checked in today.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            record.check_in = datetime.now().time()
            record.status = Attendance.Status.PRESENT
            record.save()

        return Response(AttendanceSerializer(record).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        employee = getattr(request.user, 'employee_profile', None)
        if employee is None:
            return Response(
                {'detail': 'No employee profile found for this account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        today = date.today()
        record = Attendance.objects.filter(employee=employee, date=today).first()
        if record is None or not record.check_in:
            return Response({'detail': 'You need to check in first.'}, status=status.HTTP_400_BAD_REQUEST)
        if record.check_out:
            return Response(
                {'detail': 'You have already checked out today.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        record.check_out = datetime.now().time()
        try:
            record.save()
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, 'message_dict') else {'non_field_errors': e.messages}
            return Response(detail, status=status.HTTP_400_BAD_REQUEST)

        return Response(AttendanceSerializer(record).data)