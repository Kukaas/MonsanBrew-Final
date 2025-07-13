import express from 'express';
import { placeOrder, getOrdersByUser, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getOrdersWaitingForRider, getOrdersByRider, acceptOrder, completeOrder } from '../controllers/order.controller.js';

const router = express.Router();

// Place order
router.post('/', placeOrder);

// Get all orders (admin)
router.get('/', getAllOrders);

// Get orders waiting for rider
router.get('/waiting-for-rider', getOrdersWaitingForRider);

// Get orders by rider
router.get('/rider/:riderId', getOrdersByRider);

// Get orders by user ID
router.get('/user/:userId', getOrdersByUser);

// Get order by ID
router.get('/:orderId', getOrderById);

// Update order status (admin)
router.patch('/:orderId/status', updateOrderStatus);

// Accept order by rider
router.patch('/:orderId/accept', acceptOrder);

// Complete order by rider
router.patch('/:orderId/complete', completeOrder);

// Cancel order
router.patch('/:orderId/cancel', cancelOrder);

export default router;
