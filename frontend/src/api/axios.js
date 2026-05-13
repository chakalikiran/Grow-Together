import axios from 'axios';

const api = axios.create({
  // In production (Vercel), this will use the VITE_API_URL you set in Vercel settings.
  // In development (local), it safely falls back to your local backend server.
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api', 
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const parsed = JSON.parse(userInfo);
    if (parsed.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  }
  return config;
});

export default api;
