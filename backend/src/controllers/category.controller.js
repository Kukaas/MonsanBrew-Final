import Category from '../models/category.model.js';

// Create a new category
export const createCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const newCategory = new Category({ category });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a category
export const updateCategory = async (req, res) => {
    try {
        const { category } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { category },
            { new: true, runValidators: true }
        );
        if (!updatedCategory) return res.status(404).json({ error: 'Category not found' });
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a category
export const deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) return res.status(404).json({ error: 'Category not found' });
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
