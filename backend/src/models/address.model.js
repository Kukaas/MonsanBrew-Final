import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    label: {
        type: String,
        default: 'Home'
    },
    contactNumber: {
        type: String,
        required: true
    },
    lotNo: {
        type: String,
        required: true
    },
    purok: {
        type: String
    },
    street: {
        type: String
    },
    landmark: {
        type: String
    },
    barangay: {
        type: String,
        required: true
    },
    municipality: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 });

const Address = mongoose.model('Address', addressSchema);

export default Address;
