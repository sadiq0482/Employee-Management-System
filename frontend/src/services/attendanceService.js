import api from './api';

export const getAttendance = (params = {}) => api.get('/attendance/', { params });
export const checkIn = () => api.post('/attendance/check_in/');
export const checkOut = () => api.post('/attendance/check_out/');
export const createAttendance = (data) => api.post('/attendance/', data);
export const updateAttendance = (id, data) => api.patch(`/attendance/${id}/`, data);