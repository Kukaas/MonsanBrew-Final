import express from 'express';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../controllers/cart.controller.js';

const router = express.Router();

router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:id', removeFromCart);
router.patch('/:id', updateCartItem);

export default router;
