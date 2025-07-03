import api from '../lib/axios';

// Auth API functions
export const authAPI = {
    // Login
    login: async (credentials) => {
        return await api.post('/auth/login', credentials);
    },

    // Register
    register: async (registrationData) => {
        return await api.post('/auth/signup', registrationData);
    },

    // Logout
    logout: async () => {
        return await api.post('/auth/logout');
    },

    // Forgot password
    forgotPassword: async (email) => {
        return await api.post('/auth/forgot-password', { email });
    },

    // Verify reset token
    verifyResetToken: async (token) => {
        return await api.get(`/auth/verify-reset-token?token=${token}`);
    },

    // Reset password
    resetPassword: async (resetData) => {
        return await api.post('/auth/reset-password', resetData);
    },

    // Get current user
    me: async () => {
        return await api.get('/auth/me');
    },
};

// Category API functions
export const categoryAPI = {
    // Create category
    create: async (data) => {
        return await api.post('/category', data);
    },
    // Get all categories
    getAll: async () => {
        return await api.get('/category');
    },
    // Get category by ID
    getById: async (id) => {
        return await api.get(`/category/${id}`);
    },
    // Update category
    update: async (id, data) => {
        return await api.put(`/category/${id}`, data);
    },
    // Delete category
    delete: async (id) => {
        return await api.delete(`/category/${id}`);
    },
};
