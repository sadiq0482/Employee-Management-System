from django.contrib import admin

from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user', 'department', 'designation', 'joining_date')
    list_filter = ('department', 'designation', 'gender')
    search_fields = ('employee_id', 'user__username', 'user__email', 'user__first_name', 'user__last_name')
