import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Return the data directly since it already contains success and message
        return response.data;
    },
    (error) => {
        const errorMessage = error.response?.data?.message || 'Something went wrong';

        return Promise.reject({
            success: false,
            message: errorMessage,
            status: error.response?.status
        });
    }
);

export default api;
