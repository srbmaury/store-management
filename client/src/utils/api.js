import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
  throw new Error('VITE_API_URL is not defined');
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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