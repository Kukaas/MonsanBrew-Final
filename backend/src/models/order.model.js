import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            productName: String,
            image: String,
            size: String,
            addOns: [
                {
                    addonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Addon' },
                    name: String,
                    price: Number
                }
            ],
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    address: {
        contactNumber: String,
        lotNo: String,
        purok: String,
        street: String,
        landmark: String,
        barangay: String,
        municipality: String,
        province: String
    },
    deliveryInstructions: { type: String }, // optional
    paymentMethod: { type: String, enum: ['gcash', 'cod'], required: true },
    referenceNumber: { type: String },
    proofImage: { type: String }, // base64 for GCash
    isReviewed: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'approved', 'preparing', 'waiting_for_rider', 'out_for_delivery', 'completed', 'cancelled'], default: 'pending' },
    cancellationReason: { type: String }, // reason for cancellation
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // assigned rider
    deliveryProofImage: { type: String }, // base64 for delivery proof
    total: { type: Number, required: true },
}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
export default Order;
