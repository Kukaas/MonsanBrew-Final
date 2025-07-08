import express from 'express';
import { getAddress, updateAddress } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get current user's address
router.get('/address', protect, getAddress);
// Update current user's address
router.put('/address', protect, updateAddress);

export default router;
