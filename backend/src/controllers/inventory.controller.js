import Inventory from '../models/inventory.model.js';

// Create a new inventory item
export const createInventory = async (req, res) => {
    try {
        const { productName, stock, expirationDate, status, image, unit } = req.body;
        const newInventory = new Inventory({
            productName,
            stock,
            expirationDate,
            status,
            image,
            unit
        });
        await newInventory.save();
        res.status(201).json(newInventory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all inventory items
export const getInventories = async (req, res) => {
    try {
        const inventories = await Inventory.find();
        res.status(200).json(inventories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single inventory item by ID
export const getInventoryById = async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) return res.status(404).json({ error: 'Inventory item not found' });
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an inventory item
export const updateInventory = async (req, res) => {
    try {
        const { productName, stock, expirationDate, status, image, unit } = req.body;
        const updatedInventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            { productName, stock, expirationDate, status, image, unit },
            { new: true, runValidators: true }
        );
        if (!updatedInventory) return res.status(404).json({ error: 'Inventory item not found' });
        res.status(200).json(updatedInventory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an inventory item
export const deleteInventory = async (req, res) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);
        if (!deletedInventory) return res.status(404).json({ error: 'Inventory item not found' });
        res.status(200).json({ message: 'Inventory item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
