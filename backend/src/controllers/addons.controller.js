import Addon from '../models/addons.model.js';

// Create a new addon
export const createAddon = async (req, res) => {
    try {
        const { name, price, image, isAvailable } = req.body;
        const addon = new Addon({ name, price, image, isAvailable });
        await addon.save();
        res.status(201).json(addon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all addons
export const getAddons = async (req, res) => {
    try {
        const addons = await Addon.find();
        res.json(addons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single addon by ID
export const getAddonById = async (req, res) => {
    try {
        const addon = await Addon.findById(req.params.id);
        if (!addon) return res.status(404).json({ error: 'Addon not found' });
        res.json(addon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an addon
export const updateAddon = async (req, res) => {
    try {
        const { name, price, image, isAvailable } = req.body;
        const addon = await Addon.findByIdAndUpdate(
            req.params.id,
            { name, price, image, isAvailable },
            { new: true, runValidators: true }
        );
        if (!addon) return res.status(404).json({ error: 'Addon not found' });
        res.json(addon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an addon
export const deleteAddon = async (req, res) => {
    try {
        const addon = await Addon.findByIdAndDelete(req.params.id);
        if (!addon) return res.status(404).json({ error: 'Addon not found' });
        res.json({ message: 'Addon deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Bulk fetch add-ons by IDs
export const getAddonsBulk = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'No IDs provided.' });
        }
        const addons = await Addon.find({ _id: { $in: ids } });
        res.json(addons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
