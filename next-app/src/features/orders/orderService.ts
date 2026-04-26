import axios from 'axios';

const api = axios.create({
  baseURL: '/api/orders',
});

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createOrder = async (productId: string) => {
  const response = await api.post('/', { productId }, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get('/myorders', {
    headers: getAuthHeaders(),
  });
  return response.data;
};
