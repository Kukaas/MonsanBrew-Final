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
        required: function() {
            return !this.isCustomDrink;
        }
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
    ],
    // Custom drink fields
    isCustomDrink: {
        type: Boolean,
        default: false
    },
    customIngredients: [
        {
            ingredientId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'DndItems'
            },
            name: String,
            price: Number,
            image: String,
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    customImage: String, // preview image for custom drink
    customBlendImage: String, // blend preview image for custom drink
    customDrinkName: String, // generated name for custom drink
    customSize: String // size for custom drinks (Small, Medium, Large, Extra Large)
}, { timestamps: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

export default CartItem;
