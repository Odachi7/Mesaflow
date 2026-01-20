import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        const tenantSubdomain = window.location.hostname.split('.')[0]; // basic subdomain logic

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (tenantId) {
            config.headers['x-tenant-id'] = tenantId;
        }
    }
    return config;
});

// Interceptor para erros (ex: 401 logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                // localStorage.removeItem('token');
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
