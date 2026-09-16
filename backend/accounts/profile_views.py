from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer


class ProfileView(APIView):
    """
    GET /api/profile/  - view your own account (+ employee details, if any)
    PUT /api/profile/  - update your own editable fields

    Security: this endpoint only ever reads/writes request.user's own data.
    There is no way to pass another user's ID — nobody can view or edit
    someone else's profile through this endpoint.

    An employee can update: first_name, last_name, email, phone, address,
    date_of_birth, designation, profile_image.
    An employee CANNOT change: employee_id, department, salary,
    joining_date — those remain admin-controlled (see /api/employees/<id>/).
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _serialize(self, user):
        data = UserSerializer(user).data
        employee = getattr(user, 'employee_profile', None)
        if employee is not None:
            from employees.serializers import EmployeeSerializer
            data['employee'] = EmployeeSerializer(employee).data
        return data

    def get(self, request):
        return Response(self._serialize(request.user))

    def put(self, request):
        user = request.user

        for field in ('first_name', 'last_name', 'email'):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        employee = getattr(user, 'employee_profile', None)
        if employee is not None:
            for field in ('phone', 'address', 'date_of_birth', 'designation', 'gender'):
                if field in request.data:
                    setattr(employee, field, request.data[field])
            if 'profile_image' in request.FILES:
                employee.profile_image = request.FILES['profile_image']
            employee.save()

        return Response(self._serialize(user))