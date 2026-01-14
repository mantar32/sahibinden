import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Categories
export const getCategories = () => api.get('/categories');
export const getCategory = (slug) => api.get(`/categories/${slug}`);

// Listings
export const getListings = (params) => api.get('/listings', { params });
export const getFeaturedListings = () => api.get('/listings/featured');
export const getListing = (id) => api.get(`/listings/${id}`);
export const incrementView = (id) => api.post(`/listings/${id}/view`);
export const createListing = (data) => api.post('/listings', data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}`);

// Users
export const getUser = (id) => api.get(`/users/${id}`);
export const getUserListings = (id) => api.get(`/users/${id}/listings`);
export const updateProfile = (data) => api.put('/users/profile', data);

// Favorites
export const getFavorites = () => api.get('/favorites');
export const addFavorite = (listingId) => api.post(`/favorites/${listingId}`);
export const removeFavorite = (listingId) => api.delete(`/favorites/${listingId}`);

// Admin
export const getAdminListings = () => api.get('/admin/listings');
export const approveListing = (id) => api.put(`/admin/listings/${id}/approve`);
export const rejectListing = (id) => api.put(`/admin/listings/${id}/reject`);
export const getAdminUsers = () => api.get('/admin/users');
export const banUser = (id) => api.put(`/admin/users/${id}/ban`);
export const unbanUser = (id) => api.put(`/admin/users/${id}/unban`);

// Messages
export const sendMessage = (data) => api.post('/messages', data);
export const getMessages = () => api.get('/messages');
export const getConversation = (userId) => api.get(`/messages/conversation/${userId}`);
export const getUnreadCount = () => api.get('/messages/unread');

// Packages & Payments
export const getPackages = () => api.get('/packages');
export const checkListingEligibility = () => api.get('/listings/check-eligibility');
export const createPayment = (packageId) => api.post('/payments/create', { packageId });
export const completePayment = (paymentId, cardData) => api.post(`/payments/${paymentId}/complete`, cardData);
export const getPaymentHistory = () => api.get('/payments/history');

// Featured Listings (Vitrin)
export const getFeaturedPrices = () => api.get('/featured/prices');
export const promoteListing = (listingId, days) => api.post(`/listings/${listingId}/feature`, { days });
export const completeFeaturedPayment = (paymentId, cardData) => api.post(`/featured/${paymentId}/complete`, cardData);

// Param Güvende (Escrow)
export const getEscrowInfo = () => api.get('/escrow/info');
export const createEscrow = (listingId) => api.post('/escrow/create', { listingId });
export const payEscrow = (escrowId, cardData) => api.post(`/escrow/${escrowId}/pay`, cardData);
export const shipEscrow = (escrowId, data) => api.post(`/escrow/${escrowId}/ship`, data);
export const confirmEscrow = (escrowId) => api.post(`/escrow/${escrowId}/confirm`);
export const cancelEscrow = (escrowId) => api.post(`/escrow/${escrowId}/cancel`);
export const getMyEscrows = () => api.get('/escrow/my-transactions');
export const getEscrow = (escrowId) => api.get(`/escrow/${escrowId}`);

// Wallet
export const getWallet = () => api.get('/wallet');
export const topUpWallet = (data) => api.post('/wallet/topup', data);
export const withdrawWallet = (data) => api.post('/wallet/withdraw', data);
export const addSavedCard = (data) => api.post('/wallet/cards', data);
export const removeSavedCard = (cardId) => api.delete(`/wallet/cards/${cardId}`);

// Admin
export const recalculateBalances = () => api.post('/admin/recalculate-balances');
export const recalculateUserBalance = (userId) => api.post(`/admin/recalculate-balance/${userId}`);

// Utility
export const getCities = () => api.get('/cities');
export const uploadImage = (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;

