import axios from 'axios';

const api = axios.create({
  baseURL: '/api/codes',
});

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const verifyCode = async (code: string) => {
  const response = await api.get(`/verify/${code}`);
  return response.data;
};

export const generateCode = async (productId: string, retailerInfo: string) => {
  const response = await api.post('/', { productId, retailerInfo }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getAdminCodes = async () => {
  const response = await api.get('/admin', {
    headers: getAuthHeaders(),
  });
  return response.data;
};
