import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    expirationDate: {
        type: Date,
        required: false,
    },
    status: {
        type: String,
        enum: ['in_stock', 'out_of_stock', 'expired', 'low_stock'],
        default: 'in_stock',
    },
    image: {
        type: String, // base64 string
        required: false,
    },
    unit: {
        type: String,
        required: false,
        trim: true,
        default: 'pcs',
    },
}, {
    timestamps: true,
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
