import axios from 'axios';

const api = axios.create({
  baseURL: '/api/auth',
});

export const login = async (formData: any) => {
  const response = await api.post('/login', formData);
  return response.data;
};

export const register = async (formData: any) => {
  const response = await api.post('/register', formData);
  return response.data;
};

export const googleAuth = async (credential: string) => {
  const response = await api.post('/google', { credential });
  return response.data;
};
