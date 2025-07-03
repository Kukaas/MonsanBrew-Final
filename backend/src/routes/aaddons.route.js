import express from 'express';
import {
    createAddon,
    getAddons,
    getAddonById,
    updateAddon,
    deleteAddon
} from '../controllers/addons.controller.js';

const router = express.Router();

// Create a new addon
router.post('/', createAddon);

// Get all addons
router.get('/', getAddons);

// Get a single addon by ID
router.get('/:id', getAddonById);

// Update an addon
router.put('/:id', updateAddon);

// Delete an addon
router.delete('/:id', deleteAddon);

export default router;
