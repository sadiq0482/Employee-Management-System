from django.core.exceptions import ValidationError as DjangoValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsEmployeeRole
from .models import LeaveType, LeaveRequest
from .serializers import LeaveTypeSerializer, LeaveRequestSerializer, LeaveRequestCreateSerializer


class LeaveTypeViewSet(viewsets.ModelViewSet):
    """
    GET  /api/leave-types/       - any logged-in user can view
    POST/PUT/PATCH/DELETE        - admin only
    """
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]


class LeaveRequestViewSet(viewsets.ModelViewSet):
    """
    Admins see and manage ALL leave requests.
    Employees see and manage only THEIR OWN leave requests.

    GET    /api/leaves/               - list (own for employee, all for admin); filter with ?status=PENDING
    POST   /api/leaves/               - apply for leave (employee only)
    GET    /api/leaves/<id>/          - view one
    PATCH  /api/leaves/<id>/approve/  - admin only
    PATCH  /api/leaves/<id>/reject/   - admin only
    PATCH  /api/leaves/<id>/cancel/   - employee only, own request, only while PENDING
    """
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        user = self.request.user
        qs = LeaveRequest.objects.select_related('employee__user', 'leave_type')
        if user.role == 'ADMIN':
            return qs
        return qs.filter(employee__user=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return LeaveRequestCreateSerializer
        return LeaveRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsEmployeeRole()]
        if self.action in ('approve', 'reject'):
            return [IsAdmin()]
        if self.action == 'cancel':
            return [IsEmployeeRole()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only pending requests can be approved.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        leave.status = LeaveRequest.Status.APPROVED
        leave.admin_comment = request.data.get('admin_comment', '')
        try:
            leave.save()
        except DjangoValidationError as e:
            detail = e.message_dict if hasattr(e, 'message_dict') else {'non_field_errors': e.messages}
            return Response(detail, status=status.HTTP_400_BAD_REQUEST)
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if leave.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only pending requests can be rejected.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        leave.status = LeaveRequest.Status.REJECTED
        leave.admin_comment = request.data.get('admin_comment', '')
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        leave = self.get_object()
        if leave.employee.user != request.user:
            return Response(
                {'detail': 'You can only cancel your own leave requests.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if leave.status != LeaveRequest.Status.PENDING:
            return Response(
                {'detail': 'Only pending requests can be cancelled.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        leave.status = LeaveRequest.Status.CANCELLED
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)