import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
const apiBaseUrl = rawApiUrl.trim().replace(/\/+$/, '');

const api = axios.create({
    baseURL: apiBaseUrl || undefined,
});

export default api;
