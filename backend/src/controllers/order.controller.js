import Order from '../models/order.model.js';
import Product from '../models/products.model.js';
import Inventory from '../models/inventory.model.js';

export const placeOrder = async (req, res) => {
    try {
        const {
            userId,
            items,
            address,
            deliveryInstructions, // optional
            paymentMethod,
            referenceNumber,
            proofImage,
            total
        } = req.body;

        // Validate required fields (do not require deliveryInstructions)
        if (!userId || !items || !Array.isArray(items) || items.length === 0 || !address || !paymentMethod || !total) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // If paymentMethod is gcash, proofImage must be present
        if (paymentMethod === 'gcash' && !proofImage) {
            return res.status(400).json({ error: 'Proof image is required for GCash payments.' });
        }

        const order = new Order({
            userId,
            items,
            address,
            paymentMethod,
            referenceNumber,
            proofImage: paymentMethod === 'gcash' ? proofImage : undefined,
            isReviewed: false,
            status: 'pending',
            total
        });
        // Only add deliveryInstructions if present
        if (deliveryInstructions) order.deliveryInstructions = deliveryInstructions;
        await order.save();
        res.status(201).json({ order });
    } catch (err) {
        console.error('Order placement error:', err);
        res.status(500).json({ error: 'Failed to place order.' });
    }
};

export const getOrdersByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const orders = await Order.find({ userId })
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }

        const order = await Order.findById(orderId)
            .populate('userId', 'name email')
            .populate('items.productId', 'name image');

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        res.status(200).json({ order });
    } catch (err) {
        console.error('Get order by ID error:', err);
        res.status(500).json({ error: 'Failed to fetch order.' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { reason } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }

        if (!reason) {
            return res.status(400).json({ error: 'Cancellation reason is required.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        // Only allow cancellation for pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Order cannot be cancelled. Only pending orders can be cancelled.' });
        }

        // Only allow cancellation for COD payments
        if (order.paymentMethod !== 'cod') {
            return res.status(400).json({ error: 'Only COD orders can be cancelled.' });
        }

        // Update order status and add cancellation reason
        order.status = 'cancelled';
        order.cancellationReason = reason;
        await order.save();

        res.status(200).json({ message: 'Order cancelled successfully.', order });
    } catch (err) {
        console.error('Cancel order error:', err);
        res.status(500).json({ error: 'Failed to cancel order.' });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('userId', 'name email')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Order ID is required.' });
        }

        if (!status) {
            return res.status(400).json({ error: 'Status is required.' });
        }

        // Validate status values
        const validStatuses = ['pending', 'approved', 'preparing', 'out_for_delivery', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value.' });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        // Don't allow updating completed or cancelled orders
        if (order.status === 'completed' || order.status === 'cancelled') {
            return res.status(400).json({ error: 'Cannot update completed or cancelled orders.' });
        }

        // Check if status is changing to "out_for_delivery" and deduct inventory
        if (status === 'out_for_delivery' && order.status !== 'out_for_delivery') {
            try {
                // Get all product details for the order items
                const productIds = order.items.map(item => item.productId);
                const products = await Product.find({ _id: { $in: productIds } });

                let totalIngredientsToDeduct = [];

                // Process each order item
                for (let i = 0; i < order.items.length; i++) {
                    const orderItem = order.items[i];

                    const product = products.find(p => p._id.toString() === orderItem.productId.toString());

                    if (product) {
                        if (product.ingredients && product.ingredients.length > 0) {
                            // Process each ingredient in the product
                            for (let j = 0; j < product.ingredients.length; j++) {
                                const ingredient = product.ingredients[j];
                                const quantityNeeded = ingredient.quantity * orderItem.quantity;

                                // Add to deduction list
                                totalIngredientsToDeduct.push({
                                    productName: orderItem.productName,
                                    ingredientName: ingredient.productName,
                                    quantityNeeded,
                                    unit: ingredient.unit || 'units'
                                });
                            }
                        }
                    }
                }

                // Now validate and deduct inventory
                for (const deductionItem of totalIngredientsToDeduct) {
                    // Find the corresponding inventory item (case-insensitive)
                    const inventoryItem = await Inventory.findOne({
                        productName: { $regex: new RegExp(`^${deductionItem.ingredientName}$`, 'i') }
                    });

                    if (inventoryItem) {
                        // Check if there's enough stock
                        if (inventoryItem.stock < deductionItem.quantityNeeded) {
                            return res.status(400).json({
                                error: `Insufficient stock for ingredient: ${deductionItem.ingredientName}. Required: ${deductionItem.quantityNeeded} ${deductionItem.unit}, Available: ${inventoryItem.stock} ${inventoryItem.unit}`
                            });
                        }

                        // Deduct the quantity from inventory
                        const oldStock = inventoryItem.stock;
                        inventoryItem.stock -= deductionItem.quantityNeeded;

                        // Update status based on remaining stock
                        if (inventoryItem.stock === 0) {
                            inventoryItem.status = 'out_of_stock';
                        } else if (inventoryItem.stock <= 10) { // Assuming 10 is the low stock threshold
                            inventoryItem.status = 'low_stock';
                        } else {
                            inventoryItem.status = 'in_stock';
                        }

                        await inventoryItem.save();

                    } else {
                        return res.status(400).json({
                            error: `Inventory item not found for ingredient: ${deductionItem.ingredientName}. Please add this ingredient to inventory first.`
                        });
                    }
                }

            } catch (inventoryError) {
                console.error('Error deducting inventory:', inventoryError);
                return res.status(500).json({ error: 'Failed to update inventory quantities.' });
            }
        }

        // Update order status
        order.status = status;
        await order.save();

        res.status(200).json({ message: 'Order status updated successfully.', order });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Failed to update order status.' });
    }
};
