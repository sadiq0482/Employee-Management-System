from rest_framework import viewsets, permissions

from accounts.permissions import IsAdmin
from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    GET  /api/departments/        - any logged-in user can view the list
    GET  /api/departments/<id>/   - any logged-in user can view one
    POST /api/departments/        - admin only
    PUT/PATCH /api/departments/<id>/ - admin only
    DELETE /api/departments/<id>/    - admin only
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]