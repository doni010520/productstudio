import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const auth = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// User endpoints
export const user = {
    getProfile: () => api.get('/user/profile'),
    getHistory: (page = 1, limit = 20) => api.get(`/user/history?page=${page}&limit=${limit}`),
    getCreditHistory: () => api.get('/user/credits/history'),
    addCredits: (amount, description) => api.post('/user/credits/add', { amount, description }),
};

// Styles endpoints
export const styles = {
    getAll: () => api.get('/styles'),
    getBySlug: (slug) => api.get(`/styles/${slug}`),
};

// Generation endpoints
export const generation = {
    create: (formData) => api.post('/generate', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getStatus: (generationId) => api.get(`/generate/${generationId}`),
    delete: (generationId) => api.delete(`/generate/${generationId}`),
};

export default api;
