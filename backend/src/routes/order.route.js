import express from 'express';
import { placeOrder, getOrdersByUser, getOrderById, cancelOrder } from '../controllers/order.controller.js';

const router = express.Router();

// Place order
router.post('/', placeOrder);

// Get orders by user ID
router.get('/user/:userId', getOrdersByUser);

// Get order by ID
router.get('/:orderId', getOrderById);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

export default router;
