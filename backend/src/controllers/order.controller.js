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
