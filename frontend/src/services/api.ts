import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('f2v_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
