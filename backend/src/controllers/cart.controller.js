import CartItem from '../models/cart.model.js';
import Product from '../models/products.model.js';
import Addon from '../models/addons.model.js';

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const {
            user,
            product,
            size,
            quantity,
            addOns,
            // Custom drink fields
            isCustomDrink,
            customIngredients,
            customImage,
            customBlendImage,
            customDrinkName,
            customTotalPrice,
            customSize
        } = req.body;

        // Handle custom drink
        if (isCustomDrink) {
            if (!customIngredients || !Array.isArray(customIngredients) || customIngredients.length === 0) {
                return res.status(400).json({ message: 'Custom drink must have ingredients' });
            }

            const cartItem = new CartItem({
                user,
                isCustomDrink: true,
                productName: customDrinkName || 'Custom Drink',
                image: customImage,
                price: customTotalPrice || 0,
                size: customSize || 'Medium',
                quantity,
                customIngredients,
                customImage,
                customBlendImage,
                customDrinkName,
                customSize
            });
            await cartItem.save();
            return res.status(201).json(cartItem);
        }

        // Handle regular product
        if (!product) {
            return res.status(400).json({ message: 'Product ID is required for regular items' });
        }

        // Get product snapshot
        const prod = await Product.findById(product);
        if (!prod) return res.status(404).json({ message: 'Product not found' });

        // Determine price based on size
        let price = prod.price;
        let sizeLabel = size;
        if (Array.isArray(prod.sizes) && prod.sizes.length > 0 && size) {
            const foundSize = prod.sizes.find(s => s.label === size);
            if (foundSize) price = foundSize.price;
        }

        // Get addOns snapshot
        let addOnsSnapshot = [];
        if (Array.isArray(addOns) && addOns.length > 0) {
            const addonsDocs = await Addon.find({ _id: { $in: addOns } });
            addOnsSnapshot = addonsDocs.map(a => ({
                addonId: a._id,
                name: a.name,
                price: a.price,
                image: a.image
            }));
        }

        const cartItem = new CartItem({
            user,
            product,
            productName: prod.productName,
            image: prod.image,
            price, // snapshot of selected size or base price
            size: sizeLabel, // store the size label
            quantity,
            addOns: addOnsSnapshot
        });
        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all cart items for a user
export const getCart = async (req, res) => {
    try {
        const { user } = req.query;
        if (!user) return res.status(400).json({ message: 'User ID is required' });
        const cart = await CartItem.find({ user }).sort({ createdAt: -1 });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        await CartItem.findByIdAndDelete(id);
        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item (quantity, size, addOns)
export const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;
        const cartItem = await CartItem.findByIdAndUpdate(id, update, { new: true });
        res.json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
