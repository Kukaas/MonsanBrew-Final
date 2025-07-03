import User from '../models/user.model.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../services/email.service.js';
import { ENV } from '../config/env.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateAccessToken, generateRefreshToken } from '../services/generateToken.js';
import nodemailer from 'nodemailer';

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists by email or name
        const existingUser = await User.findOne({ $or: [{ email }, { name }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already in use.' });
            }
            if (existingUser.name === name) {
                return res.status(400).json({ message: 'Name already in use.' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification string
        const verificationString = crypto.randomBytes(32).toString('hex');
        const verificationStringExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationString,
            verificationStringExpires
        });
        await user.save();

        // Send verification email
        const verificationLink = `${ENV.FRONTEND_URL}/verify-email?token=${verificationString}&email=${email}`;
        await sendVerificationEmail(email, verificationLink);

        res.status(201).json({ message: 'Signup successful. Please check your email to verify your account.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.body;
        if (!token || !email) {
            return res.status(400).json({ message: 'Invalid verification link.' });
        }
        const user = await User.findOne({ email, verificationString: token });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link.' });
        }
        if (user.isVerified) {
            return res.status(200).json({ message: 'Email already verified.' });
        }
        if (user.verificationStringExpires < new Date()) {
            return res.status(400).json({ message: 'Verification link has expired.' });
        }
        user.isVerified = true;
        user.verificationString = undefined;
        user.verificationStringExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({
            message: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const logout = async (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logout successful.' });
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Email not found.' });
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();
        const resetLink = `${ENV.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        await sendResetPasswordEmail(email, resetLink);
        res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, email, password } = req.body;
        if (!token || !email || !password) {
            return res.status(400).json({ message: 'Invalid request.' });
        }
        const user = await User.findOne({ email, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }
        res.status(200).json({ message: 'Valid reset token.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
