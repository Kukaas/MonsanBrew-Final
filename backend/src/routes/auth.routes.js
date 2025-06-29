import express from 'express';
import { signup, verifyEmail, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify-email', verifyEmail);
router.post('/login', login);

export default router;
