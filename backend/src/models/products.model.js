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
    sizes: [{
        label: { type: String, required: true },
        price: { type: Number, required: true, min: 0 }
    }],
    price: {
        type: Number,
        min: 0,
        required: function () {
            // price is required if sizes is not present or empty
            return !this.sizes || this.sizes.length === 0;
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

productSchema.pre('validate', function (next) {
    // Add-ons required if customizable
    if (this.isCustomizable && (!this.addOns || this.addOns.length === 0)) {
        this.invalidate('addOns', 'Add-ons are required when product is customizable.');
    }
    // At least one of price or sizes must be present
    if ((!this.sizes || this.sizes.length === 0) && (this.price === undefined || this.price === null)) {
        this.invalidate('price', 'Either price or sizes must be provided.');
    }
    // If sizes is present, ensure all have label and price
    if (this.sizes && this.sizes.length > 0) {
        for (const size of this.sizes) {
            if (!size.label || typeof size.price !== 'number') {
                this.invalidate('sizes', 'Each size must have a label and a price.');
            }
        }
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
