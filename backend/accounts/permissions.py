from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to users with role=ADMIN."""

    message = 'Only administrators can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsEmployeeRole(BasePermission):
    """Allows access only to users with role=EMPLOYEE."""

    message = 'This action is only available to employees.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'EMPLOYEE'
        )


class IsOwnerEmployeeOrAdmin(BasePermission):
    """
    Object-level permission: admins can access anything; an employee can
    only access their own Employee record (obj must have an `.employee`
    or be an Employee instance with `.user`).
    """

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'ADMIN':
            return True

        owner_user = getattr(getattr(obj, 'employee', obj), 'user', None)
        return owner_user == request.user