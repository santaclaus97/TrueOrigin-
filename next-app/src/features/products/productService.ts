import axios from 'axios';

const api = axios.create({
  baseURL: '/api/products',
});

// Helper to get token
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await api.post('/', productData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await api.delete(`/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};
