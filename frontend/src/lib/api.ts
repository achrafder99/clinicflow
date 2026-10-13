import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e: unknown): string => {
  if (!axios.isAxiosError(e)) return 'Unexpected error';
  const d = e.response?.data;
  const fields = d?.details && typeof d.details === 'object' ? Object.values(d.details).flat().join(', ') : '';
  return [d?.message ?? e.message, fields].filter(Boolean).join(': ');
};