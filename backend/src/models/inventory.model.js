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
        validate: {
            validator: function (v) {
                return /^\d+(\.\d{1,2})?$/.test(v.toString());
            },
            message: props => `${props.value} is not a valid stock value. Only up to 2 decimal places allowed.`
        }
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
