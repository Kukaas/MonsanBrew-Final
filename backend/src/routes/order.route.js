import express from 'express';
import { placeOrder } from '../controllers/order.controller.js';

const router = express.Router();

// Place order
router.post('/', placeOrder);

export default router;
