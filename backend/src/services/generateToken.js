import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, ENV.JWT_SECRET, { expiresIn: '7d' });
};
