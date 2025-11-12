import api from "../lib/axios";

// Auth API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    return await api.post("/auth/login", credentials);
  },

  // Register
  register: async (registrationData) => {
    return await api.post("/auth/signup", registrationData);
  },

  // Logout
  logout: async () => {
    return await api.post("/auth/logout");
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post("/auth/forgot-password", { email });
  },

  // Verify reset token
  verifyResetToken: async (token) => {
    return await api.get(`/auth/verify-reset-token?token=${token}`);
  },

  // Reset password
  resetPassword: async (resetData) => {
    return await api.post("/auth/reset-password", resetData);
  },

  // Get current user
  me: async () => {
    return await api.get("/auth/me");
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.post("/auth/change-password", passwordData);
  },
};

// Category API functions
export const categoryAPI = {
  // Create category
  create: async (data) => {
    return await api.post("/category", data);
  },
  // Get all categories
  getAll: async () => {
    return await api.get("/category");
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
    return await api.post("/addons", data);
  },
  // Get all addons
  getAll: async () => {
    return await api.get("/addons");
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
    return await api.post("/addons/bulk", { ids });
  },
};

// Raw Materials (Inventory) API functions
export const rawMaterialsAPI = {
  // Create raw material
  create: async (data) => {
    return await api.post("/inventory", data);
  },
  // Get all raw materials
  getAll: async () => {
    return await api.get("/inventory");
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

// Ingredients API functions
// Alias Ingredients API to Inventory endpoints to unify source of truth
export const ingredientsAPI = {
  create: async (data) => api.post("/inventory", data),
  getAll: async () => api.get("/inventory"),
  getById: async (id) => api.get(`/inventory/${id}`),
  update: async (id, data) => api.put(`/inventory/${id}`, data),
  delete: async (id) => api.delete(`/inventory/${id}`),
  addStock: async (id, quantity) => api.post(`/inventory/${id}/add-stock`, { quantity }),
};

// Product API functions
export const productAPI = {
  // Create product
  create: async (data) => {
    return await api.post("/products", data);
  },
  // Get all products
  getAll: async () => {
    return await api.get("/products");
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
    return await api.post("/cart", data);
  },
  addCustomDrinkToCart: async (userId, customDrinkData) => {
    return await api.post("/cart", {
      user: userId,
      isCustomDrink: true,
      customIngredients: customDrinkData.ingredients,
      customImage: customDrinkData.previewImage,
      customBlendImage: customDrinkData.blendImage,
      customDrinkName: customDrinkData.name,
      customTotalPrice: customDrinkData.totalPrice,
      customSize: customDrinkData.size,
      quantity: 1
    });
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
    return await api.get("/user/address");
  },
  updateAddress: async (address) => {
    return await api.put("/user/address", address);
  },
  updateProfile: async (profileData) => {
    return await api.put("/user/profile", profileData);
  },
  // Admin user management
  getAllUsers: async () => {
    return await api.get("/user");
  },
  getUserById: async (userId) => {
    return await api.get(`/user/${userId}`);
  },
  createUser: async (userData) => {
    return await api.post("/user", userData);
  },
  updateUser: async (userId, userData) => {
    return await api.put(`/user/${userId}`, userData);
  },
  deleteUser: async (userId) => {
    return await api.delete(`/user/${userId}`);
  },
  // New activation/deactivation endpoints
  activateUser: async (userId) => {
    return await api.post(`/user/${userId}/activate`);
  },
  deactivateUser: async (userId, reason) => {
    return await api.post(`/user/${userId}/deactivate`, { reason });
  },
  verifyUser: async (userId) => {
    return await api.post(`/user/${userId}/verify`);
  },
};

export const orderAPI = {
  placeOrder: async (orderData) => {
    return await api.post("/orders", orderData);
  },
  createWalkInOrder: async (walkInOrderData) => {
    return await api.post("/orders/walk-in", walkInOrderData);
  },
  getAllOrders: async () => {
    return await api.get("/orders");
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
    return await api.get("/orders/waiting-for-rider");
  },
  getOrdersByRider: async (riderId) => {
    return await api.get(`/orders/rider/${riderId}`);
  },
  acceptOrder: async (orderId, riderId) => {
    return await api.patch(`/orders/${orderId}/accept`, { riderId });
  },
  completeOrder: async (orderId, riderId, deliveryProofImage) => {
    return await api.patch(`/orders/${orderId}/complete`, {
      riderId,
      deliveryProofImage,
    });
  },
  // Refund API functions
  requestRefund: async (orderId, refundData) => {
    return await api.post(`/orders/${orderId}/refund/request`, refundData);
  },
  getRefundRequests: async () => {
    return await api.get("/orders/refund/requests");
  },
  approveRefund: async (orderId, refundAmount) => {
    return await api.patch(`/orders/${orderId}/refund/approve`, {
      refundAmount,
    });
  },
  rejectRefund: async (orderId, rejectionMessage) => {
    return await api.patch(`/orders/${orderId}/refund/reject`, {
      rejectionMessage,
    });
  },
  processRefund: async (orderId, refundPaymentProof) => {
    return await api.patch(`/orders/${orderId}/refund/process`, {
      refundPaymentProof,
    });
  },
};

// Notifications API (customers and riders only)
export const notificationAPI = {
  // Fetch notifications for a user (customer) and/or role (rider)
  get: async ({ userId, role } = {}) => {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (role) params.append("role", role);
    return await api.get(`/notifications?${params.toString()}`);
  },
  // Mark single notification as read
  markRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },
  // Mark all as read for a user or role
  markAllRead: async ({ userId, role } = {}) => {
    return await api.patch(`/notifications/read-all`, { userId, role });
  },
};

// Review API functions
export const reviewAPI = {
  // Create a review
  createReview: async (reviewData) => {
    return await api.post("/reviews", reviewData);
  },
  // Get reviews for a product
  getProductReviews: async (productId, page = 1, limit = 10) => {
    return await api.get(
      `/reviews/product/${productId}?page=${page}&limit=${limit}`
    );
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
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);

    return await api.get(`/dashboard/summary?${params.toString()}`);
  },

  // Get sales data for charts
  getSalesData: async (startDate, endDate, groupBy = "day") => {
    const params = new URLSearchParams({
      startDate,
      endDate,
      groupBy,
    });

    return await api.get(`/dashboard/sales?${params.toString()}`);
  },
  // New: Get sales data by week
  getSalesDataWeekly: async (startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return await api.get(`/dashboard/sales/weekly?${params.toString()}`);
  },
  // New: Get sales data by month
  getSalesDataMonthly: async (year) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    return await api.get(`/dashboard/sales/monthly?${params.toString()}`);
  },

  // Get recent orders
  getRecentOrders: async (limit = 10) => {
    return await api.get(`/dashboard/recent-orders?limit=${limit}`);
  },

  // Get low stock items
  getLowStockItems: async () => {
    return await api.get("/dashboard/low-stock");
  },
};

// Reports API functions
export const reportsAPI = {
  getSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.productId) params.append("productId", filters.productId);
    if (filters.riderId) params.append("riderId", filters.riderId);
    return await api.get(`/reports/summary?${params.toString()}`);
  },
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.status) params.append("status", filters.status);
    return await api.get(`/reports/orders?${params.toString()}`);
  },
  getDeliveryPerformance: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.riderId) params.append("riderId", filters.riderId);
    return await api.get(`/reports/delivery-performance?${params.toString()}`);
  },
  getFeedback: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.limit) params.append("limit", String(filters.limit));
    return await api.get(`/reports/feedback?${params.toString()}`);
  },
  getProductFeedback: async (productId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return await api.get(`/reports/feedback/product/${productId}?${params.toString()}`);
  },
  getRiderPerformance: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    return await api.get(`/reports/delivery-performance/riders?${params.toString()}`);
  },
};

// Drink Customization Dnd Items API functions
export const dndItemsAPI = {
  // Get all dnd items
  getAll: async () => {
    return await api.get("/dnd-items");
  },
  // Get dnd item by ID
  getById: async (id) => {
    return await api.get(`/dnd-items/${id}`);
  },
  // Create dnd item (admin only)
  create: async (data) => {
    return await api.post("/dnd-items", data);
  },
  // Update dnd item (admin only)
  update: async (id, data) => {
    return await api.put(`/dnd-items/${id}`, data);
  },
  // Delete dnd item (admin only)
  delete: async (id) => {
    return await api.delete(`/dnd-items/${id}`);
  },
};

// Drag & Drop Builder APIs
export const dndAPI = {
  // Ingredients
  createIngredient: async (data) => api.post("/dnd/ingredients", data),
  getIngredients: async () => api.get("/dnd/ingredients"),
  updateIngredient: async (id, data) => api.put(`/dnd/ingredients/${id}`, data),
  deleteIngredient: async (id) => api.delete(`/dnd/ingredients/${id}`),

  // Previews
  createPreview: async (data) => api.post("/dnd/previews", data),
  getPreviews: async () => api.get("/dnd/previews"),
  updatePreview: async (id, data) => api.put(`/dnd/previews/${id}`, data),
  deletePreview: async (id) => api.delete(`/dnd/previews/${id}`),
};

// Expenses API functions
export const expensesAPI = {
  // Create expense
  create: async (data) => {
    return await api.post("/expenses", data);
  },
  // Get all expenses with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.category) params.append("category", filters.category);
    if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
    if (filters.minAmount) params.append("minAmount", filters.minAmount);
    if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);
    if (filters.page) params.append("page", filters.page);
    if (filters.limit) params.append("limit", filters.limit);

    return await api.get(`/expenses?${params.toString()}`);
  },
  // Get expense by ID
  getById: async (id) => {
    return await api.get(`/expenses/${id}`);
  },
  // Update expense
  update: async (id, data) => {
    return await api.put(`/expenses/${id}`, data);
  },
  // Delete expense
  delete: async (id) => {
    return await api.delete(`/expenses/${id}`);
  },
  // Get expense statistics
  getStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    return await api.get(`/expenses/stats?${params.toString()}`);
  },
};

// Mapbox API functions
export const mapboxAPI = {
  // Geocode address to coordinates
  geocodeAddress: async (address) => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { latitude: lat, longitude: lng };
    }
    throw new Error('Address not found');
  },

  // Get directions between two points
  getDirections: async (startCoords, endCoords) => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
    const start = `${startCoords.longitude},${startCoords.latitude}`;
    const end = `${endCoords.longitude},${endCoords.latitude}`;
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full&steps=true`
    );
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0];
    }
    throw new Error('No route found');
  },

  // Reverse geocode coordinates to address
  reverseGeocode: async (latitude, longitude) => {
    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_API_KEY;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&country=PH&limit=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0];
    }
    throw new Error('Location not found');
  },
};
