import User from '../models/user.model.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { ENV } from '../config/env.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateAccessToken, generateRefreshToken } from '../services/generateToken.js';

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
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === 'production',
            sameSite: 'lax',
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
