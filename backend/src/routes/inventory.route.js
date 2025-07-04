import express from 'express';
import {
    createInventory,
    getInventories,
    getInventoryById,
    updateInventory,
    deleteInventory
} from '../controllers/inventory.controller.js';

const router = express.Router();

// Create a new inventory item
router.post('/', createInventory);

// Get all inventory items
router.get('/', getInventories);

// Get a single inventory item by ID
router.get('/:id', getInventoryById);

// Update an inventory item
router.put('/:id', updateInventory);

// Delete an inventory item
router.delete('/:id', deleteInventory);

export default router;
