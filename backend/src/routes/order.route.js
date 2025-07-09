import express from 'express';
import { placeOrder, getOrdersByUser, getOrderById, cancelOrder, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

// Place order
router.post('/', placeOrder);

// Get all orders (admin)
router.get('/', getAllOrders);

// Get orders by user ID
router.get('/user/:userId', getOrdersByUser);

// Get order by ID
router.get('/:orderId', getOrderById);

// Update order status (admin)
router.patch('/:orderId/status', updateOrderStatus);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

export default router;
