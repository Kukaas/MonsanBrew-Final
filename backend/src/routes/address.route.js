import express from 'express';
import {
    createAddress,
    getAllAddresses,
    getDefaultAddress,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/address.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create new address
router.post('/', createAddress);

// Get all addresses for current user
router.get('/', getAllAddresses);

// Get default address
router.get('/default', getDefaultAddress);

// Get address by ID
router.get('/:id', getAddressById);

// Update address
router.put('/:id', updateAddress);

// Delete address
router.delete('/:id', deleteAddress);

// Set address as default
router.patch('/:id/set-default', setDefaultAddress);

export default router;
