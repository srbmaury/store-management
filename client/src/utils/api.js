import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

// Request interceptor to inject token
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default API;
