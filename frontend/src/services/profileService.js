import api from './api';

export const getProfile = () => api.get('/profile/');
export const updateProfile = (formData) =>
  api.put('/profile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });