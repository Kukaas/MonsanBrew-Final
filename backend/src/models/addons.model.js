import mongoose from 'mongoose';

const AddonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Addon = mongoose.model('Addon', AddonSchema);

export default Addon;
