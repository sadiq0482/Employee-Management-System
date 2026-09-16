from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, filters

from accounts.permissions import IsAdmin
from .models import Employee
from .serializers import EmployeeSerializer, EmployeeWriteSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    GET    /api/employees/          - list, with search/filter (admin only)
    POST   /api/employees/          - create employee + login account (admin only)
    GET    /api/employees/<id>/     - retrieve one (admin only)
    PUT    /api/employees/<id>/     - full update (admin only)
    PATCH  /api/employees/<id>/     - partial update (admin only)
    DELETE /api/employees/<id>/     - delete (admin only)

    Search:  ?search=john
    Filter:  ?department=2   ?designation=Engineer
    Sort:    ?ordering=-joining_date
    """
    queryset = Employee.objects.select_related('user', 'department').all()
    permission_classes = [IsAdmin]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'designation']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name', 'user__username', 'user__email']
    ordering_fields = ['created_at', 'joining_date', 'salary']

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return EmployeeWriteSerializer
        return EmployeeSerializer