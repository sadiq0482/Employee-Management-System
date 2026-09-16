import api from './api';

export const getLeaveTypes = () => api.get('/leave-types/');
export const getLeaves = (params = {}) => api.get('/leaves/', { params });
export const applyLeave = (data) => api.post('/leaves/', data);
export const cancelLeave = (id) => api.patch(`/leaves/${id}/cancel/`);
export const approveLeave = (id, admin_comment = '') => api.patch(`/leaves/${id}/approve/`, { admin_comment });
export const rejectLeave = (id, admin_comment = '') => api.patch(`/leaves/${id}/reject/`, { admin_comment });