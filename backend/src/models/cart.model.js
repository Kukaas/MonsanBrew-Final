import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: String, // snapshot
    image: String, // snapshot
    price: Number, // snapshot, for sized products this is the selected size's price
    size: String, // for sized products, this is the size label
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addOns: [
        {
            addonId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Addon',
                required: true
            },
            name: String,
            price: Number,
            image: String
        }
    ]
}, { timestamps: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
