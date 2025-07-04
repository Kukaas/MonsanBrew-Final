import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    productName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    addOns: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Addon',
        required: function () { return this.isCustomizable; }
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number, // in minutes
        required: true,
        min: 0
    },
    isCustomizable: {
        type: Boolean,
        default: false
    },
    ingredients: [{
        productName: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    image: {
        type: String, // base64 string
        required: false
    },
    size: {
        type: String,
        required: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
