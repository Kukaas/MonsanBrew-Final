import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeWithPasswordEmail } from '../services/email.service.js';

// Get current user's address
export const getAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('contactNumber lotNo purok street landmark barangay municipality province');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ address: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch address' });
    }
};

// Update current user's address
export const updateAddress = async (req, res) => {
    try {
        const { contactNumber, lotNo, purok, street, landmark, barangay, municipality, province } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { contactNumber, lotNo, purok, street, landmark, barangay, municipality, province },
            { new: true, runValidators: true, fields: 'contactNumber lotNo purok street landmark barangay municipality province' }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ address: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update address' });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires').sort({ createdAt: -1 });
        res.status(200).json({ users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            role = 'customer',
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            photo
        } = req.body;

        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Generate a random password (10 chars, alphanumeric)
        const generatedPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            photo,
            isVerified: true, // Admin-created users are automatically verified
            hasChangedPassword: false // New users need to change their password
        });

        await user.save();

        // Send welcome email with password
        await sendWelcomeWithPasswordEmail(email, generatedPassword);

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ 
            message: 'User created successfully',
            user: userResponse 
        });
    } catch (error) {
        console.error('Create user error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to create user' });
    }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            name,
            email,
            role,
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            photo,
            isVerified
        } = req.body;

        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== existingUser.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                name,
                email,
                role,
                contactNumber,
                lotNo,
                purok,
                street,
                landmark,
                barangay,
                municipality,
                province,
                photo,
                isVerified
            },
            { new: true, runValidators: true }
        ).select('-password -verificationString -verificationStringExpires -resetPasswordToken -resetPasswordExpires');

        res.status(200).json({ 
            message: 'User updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Update user error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update user' });
    }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deletion of admin users (optional security measure)
        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Cannot delete admin users' });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
};
