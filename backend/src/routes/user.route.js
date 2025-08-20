import express from 'express';
import { getAddress, updateAddress, updateProfile, getAllUsers, getUserById, createUser, updateUser, deleteUser, activateUser, deactivateUser, verifyUser } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = express.Router();

// Get current user's address
router.get('/address', protect, getAddress);
// Update current user's address
router.put('/address', protect, updateAddress);
// Update current user's profile
router.put('/profile', protect, updateProfile);

// Admin user management routes
router.get('/', protect, adminOnly, getAllUsers);
router.post('/', protect, adminOnly, createUser);

// New activation/deactivation routes (must come before /:userId routes)
router.post('/:userId/activate', protect, adminOnly, activateUser);
router.post('/:userId/deactivate', protect, adminOnly, deactivateUser);
router.post('/:userId/verify', protect, adminOnly, verifyUser);

// User CRUD routes (must come after specific routes)
router.get('/:userId', protect, adminOnly, getUserById);
router.put('/:userId', protect, adminOnly, updateUser);
router.delete('/:userId', protect, adminOnly, deleteUser);

export default router;
