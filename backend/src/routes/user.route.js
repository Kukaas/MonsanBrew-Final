import express from 'express';
import { getAddress, updateAddress, updateProfile, getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controller.js';
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
router.get('/:userId', protect, adminOnly, getUserById);
router.post('/', protect, adminOnly, createUser);
router.put('/:userId', protect, adminOnly, updateUser);
router.delete('/:userId', protect, adminOnly, deleteUser);

export default router;
