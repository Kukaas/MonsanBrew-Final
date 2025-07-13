import express from 'express';
import { createReview, getProductReviews, getUserReviews, getOrderReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a review (requires authentication)
router.post('/', protect, createReview);

// Get reviews for a specific product
router.get('/product/:productId', getProductReviews);

// Get reviews by a specific user
router.get('/user/:userId', getUserReviews);

// Get review for a specific order
router.get('/order/:orderId', getOrderReview);

export default router; 