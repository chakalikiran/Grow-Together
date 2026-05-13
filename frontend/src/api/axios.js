import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // using IPv4 exclusively to prevent Node 18+ CORS/resolution mismatches
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
