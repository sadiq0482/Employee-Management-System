"""
Root URL configuration.

All API endpoints are namespaced under /api/. Each Django app owns its own
urls.py, which is included here. Media files are served by Django itself
only during local development (DEBUG=True); in production the web server
or cloud storage serves them instead.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.profile_views import ProfileView



from accounts.dashboard_views import AdminDashboardView, EmployeeDashboardView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/profile/', ProfileView.as_view(), name='profile'),


    # Authentication (login, refresh, register)
    path('api/auth/', include('accounts.urls')),

    # Dashboard statistics
    path('api/dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('api/dashboard/employee/', EmployeeDashboardView.as_view(), name='employee-dashboard'),

    # Feature apps
    path('api/', include('employees.urls')),
    path('api/', include('departments.urls')),
    path('api/', include('leaves.urls')),
    path('api/', include('attendance.urls')),
]

# Serve uploaded media files locally when DEBUG=True.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)