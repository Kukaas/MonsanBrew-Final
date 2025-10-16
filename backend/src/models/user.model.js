import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contactNumber: { type: String },
    lotNo: { type: String },
    purok: { type: String },
    street: { type: String },
    landmark: { type: String },
    barangay: { type: String, },
    municipality: { type: String, },
    province: { type: String, },
    // Add coordinates for map functionality
    latitude: { type: Number },
    longitude: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // New field for activation status
    deactivationReason: { type: String }, // Reason for deactivation
    deactivatedAt: { type: Date }, // When user was deactivated
    hasChangedPassword: { type: Boolean, default: true },
    verificationString: { type: String },
    verificationStringExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    photo: { type: String }, // base64 string
    role: { type: String, enum: ['admin', 'rider', 'customer', 'frontdesk', 'front_desk'], default: 'customer' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
