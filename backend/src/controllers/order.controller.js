import Order from '../models/order.model.js';

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
