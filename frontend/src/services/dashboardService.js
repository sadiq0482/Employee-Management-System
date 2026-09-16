import api from './api';

export const getAdminDashboard = () => api.get('/dashboard/admin/');
export const getEmployeeDashboard = () => api.get('/dashboard/employee/');