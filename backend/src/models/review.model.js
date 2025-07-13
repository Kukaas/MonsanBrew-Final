import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 500
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

// Ensure one review per user per order
ReviewSchema.index({ userId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);
export default Review; 