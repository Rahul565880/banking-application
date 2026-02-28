import axios from 'axios';

const API_URL = 'https://banking-application-mjsa.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  checkAuth: () => api.get('/auth/check-auth')
};

export const bankAPI = {
  getBalance: () => api.get('/bank/balance'),
  deposit: (amount) => api.post('/bank/deposit', { amount }),
  withdraw: (amount) => api.post('/bank/withdraw', { amount }),
  getTransactions: () => api.get('/bank/transactions')
};

export default api;
