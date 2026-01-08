import axios from 'axios';

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Axios instantiation with our proper headers
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request INTERCEPTOR - will run before each req
api.interceptors.request.use(
    (config) => {
        // Get JWT token from browser storage
        const token = localStorage.getItem('token');

        if (token) {
            // Adding token to auth header
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Reqyest INTERCEPTOR - will run AFTER each response
api.interceptors.response.use(
    (res) => {
        return res;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
)

export default api;