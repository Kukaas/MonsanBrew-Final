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

    // Change password
    changePassword: async (passwordData) => {
        return await api.post('/auth/change-password', passwordData);
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

// AddOns API functions
export const addonsAPI = {
    // Create addon
    create: async (data) => {
        return await api.post('/addons', data);
    },
    // Get all addons
    getAll: async () => {
        return await api.get('/addons');
    },
    // Get addon by ID
    getById: async (id) => {
        return await api.get(`/addons/${id}`);
    },
    // Update addon
    update: async (id, data) => {
        return await api.put(`/addons/${id}`, data);
    },
    // Delete addon
    delete: async (id) => {
        return await api.delete(`/addons/${id}`);
    },
    // Fetch multiple add-ons by IDs
    getMany: async (ids) => {
        return await api.post('/addons/bulk', { ids });
    },
};

// Raw Materials (Inventory) API functions
export const rawMaterialsAPI = {
    // Create raw material
    create: async (data) => {
        return await api.post('/inventory', data);
    },
    // Get all raw materials
    getAll: async () => {
        return await api.get('/inventory');
    },
    // Get raw material by ID
    getById: async (id) => {
        return await api.get(`/inventory/${id}`);
    },
    // Update raw material
    update: async (id, data) => {
        return await api.put(`/inventory/${id}`, data);
    },
    // Delete raw material
    delete: async (id) => {
        return await api.delete(`/inventory/${id}`);
    },
};

// Product API functions
export const productAPI = {
    // Create product
    create: async (data) => {
        return await api.post('/products', data);
    },
    // Get all products
    getAll: async () => {
        return await api.get('/products');
    },
    // Get product by ID
    getById: async (id) => {
        return await api.get(`/products/${id}`);
    },
    // Update product
    update: async (id, data) => {
        return await api.put(`/products/${id}`, data);
    },
    // Delete product
    delete: async (id) => {
        return await api.delete(`/products/${id}`);
    },
    // Favorite a product
    addFavorite: async (productId, userId) => {
        return await api.post(`/products/${productId}/favorite`, { userId });
    },
    // Unfavorite a product
    removeFavorite: async (productId, userId) => {
        return await api.post(`/products/${productId}/unfavorite`, { userId });
    },
    // Get favorite count
    getFavoriteCount: async (productId) => {
        return await api.get(`/products/${productId}/favorites`);
    },
    // Get all favorites for a user
    getFavoritesByUser: async (userId) => {
        return await api.get(`/products/favorites/${userId}`);
    },
};

// Cart API functions
export const cartAPI = {
    addToCart: async (data) => {
        return await api.post('/cart', data);
    },
    getCart: async (userId) => {
        return await api.get(`/cart?user=${userId}`);
    },
    removeFromCart: async (id) => {
        return await api.delete(`/cart/${id}`);
    },
    updateCartItem: async (id, data) => {
        return await api.patch(`/cart/${id}`, data);
    },
};

export const userAPI = {
    getAddress: async () => {
        return await api.get('/user/address');
    },
    updateAddress: async (address) => {
        return await api.put('/user/address', address);
    },
    updateProfile: async (profileData) => {
        return await api.put('/user/profile', profileData);
    },
    // Admin user management
    getAllUsers: async () => {
        return await api.get('/user');
    },
    getUserById: async (userId) => {
        return await api.get(`/user/${userId}`);
    },
    createUser: async (userData) => {
        return await api.post('/user', userData);
    },
    updateUser: async (userId, userData) => {
        return await api.put(`/user/${userId}`, userData);
    },
    deleteUser: async (userId) => {
        return await api.delete(`/user/${userId}`);
    },
};

export const orderAPI = {
    placeOrder: async (orderData) => {
        return await api.post('/orders', orderData);
    },
    getAllOrders: async () => {
        return await api.get('/orders');
    },
    getOrdersByUser: async (userId) => {
        return await api.get(`/orders/user/${userId}`);
    },
    getOrderById: async (orderId) => {
        return await api.get(`/orders/${orderId}`);
    },
    updateOrderStatus: async (orderId, status) => {
        return await api.patch(`/orders/${orderId}/status`, { status });
    },
    cancelOrder: async (orderId, reason) => {
        return await api.patch(`/orders/${orderId}/cancel`, { reason });
    },
    // New rider-specific endpoints
    getOrdersWaitingForRider: async () => {
        return await api.get('/orders/waiting-for-rider');
    },
    getOrdersByRider: async (riderId) => {
        return await api.get(`/orders/rider/${riderId}`);
    },
    acceptOrder: async (orderId, riderId) => {
        return await api.patch(`/orders/${orderId}/accept`, { riderId });
    },
    completeOrder: async (orderId, riderId, deliveryProofImage) => {
        return await api.patch(`/orders/${orderId}/complete`, { riderId, deliveryProofImage });
    },
};

// Review API functions
export const reviewAPI = {
    // Create a review
    createReview: async (reviewData) => {
        return await api.post('/reviews', reviewData);
    },
    // Get reviews for a product
    getProductReviews: async (productId, page = 1, limit = 10) => {
        return await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    },
    // Get reviews by a user
    getUserReviews: async (userId) => {
        return await api.get(`/reviews/user/${userId}`);
    },
    // Get review for a specific order
    getOrderReview: async (orderId) => {
        return await api.get(`/reviews/order/${orderId}`);
    },
};

// Dashboard API functions
export const dashboardAPI = {
    // Get dashboard summary statistics
    getSummary: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.status) params.append('status', filters.status);
        
        return await api.get(`/dashboard/summary?${params.toString()}`);
    },
    
    // Get sales data for charts
    getSalesData: async (startDate, endDate, groupBy = 'day') => {
        const params = new URLSearchParams({
            startDate,
            endDate,
            groupBy
        });
        
        return await api.get(`/dashboard/sales?${params.toString()}`);
    },
    // New: Get sales data by week
    getSalesDataWeekly: async (startDate, endDate) => {
        const params = new URLSearchParams({
            startDate,
            endDate
        });
        return await api.get(`/dashboard/sales/weekly?${params.toString()}`);
    },
    // New: Get sales data by month
    getSalesDataMonthly: async (year) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        return await api.get(`/dashboard/sales/monthly?${params.toString()}`);
    },
    
    // Get recent orders
    getRecentOrders: async (limit = 10) => {
        return await api.get(`/dashboard/recent-orders?limit=${limit}`);
    },
    
    // Get low stock items
    getLowStockItems: async () => {
        return await api.get('/dashboard/low-stock');
    },
};
