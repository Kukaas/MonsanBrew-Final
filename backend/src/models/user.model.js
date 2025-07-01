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
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationString: { type: String },
    verificationStringExpires: { type: Date },
    otpCode: { type: String },
    otpExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    photo: { type: String }, // base64 string
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
