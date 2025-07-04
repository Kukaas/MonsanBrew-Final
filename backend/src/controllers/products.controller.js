import Product from '../models/products.model.js';

// Create a new product
export const createProduct = async (req, res) => {
    try {
        const { category, productName, description, price, addOns, isAvailable, preparationTime, isCustomizable, ingredients, image, size } = req.body;

        // Check for duplicate product name (case-insensitive, not deleted)
        const existing = await Product.findOne({ productName: { $regex: `^${productName}$`, $options: 'i' }, isDeleted: { $ne: true } });
        if (existing) {
            return res.status(400).json({ message: 'Product name already exists.' });
        }

        if (isCustomizable && (!addOns || addOns.length === 0)) {
            return res.status(400).json({ message: 'Add-ons are required when product is customizable.' });
        }

        const product = new Product({
            category,
            productName,
            description,
            price,
            addOns,
            isAvailable,
            preparationTime,
            isCustomizable,
            ingredients,
            image,
            size
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: true } })
            .populate('category', 'category')
            .populate('addOns', 'name price')
            .lean();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
            .populate('category', 'category')
            .populate('addOns', 'name price')
            .lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product
export const updateProduct = async (req, res) => {
    try {
        const { category, productName, description, price, addOns, isAvailable, preparationTime, isCustomizable, ingredients, image, size } = req.body;
        // Check for duplicate product name (case-insensitive, not deleted, different _id)
        const existing = await Product.findOne({ productName: { $regex: `^${productName}$`, $options: 'i' }, isDeleted: { $ne: true }, _id: { $ne: req.params.id } });
        if (existing) {
            return res.status(400).json({ message: 'Product name already exists.' });
        }
        if (isCustomizable && (!addOns || addOns.length === 0)) {
            return res.status(400).json({ message: 'Add-ons are required when product is customizable.' });
        }
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { category, productName, description, price, addOns, isAvailable, preparationTime, isCustomizable, ingredients, image, size },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product (soft delete)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isDeleted: true },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
