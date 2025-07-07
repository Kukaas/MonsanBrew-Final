import express from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addFavorite,
    removeFavorite,
    getFavoriteCount,
    getFavoritesByUser
} from '../controllers/products.controller.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:productId/favorite', addFavorite);
router.post('/:productId/unfavorite', removeFavorite);
router.get('/:productId/favorites', getFavoriteCount);
router.get('/favorites/:userId', getFavoritesByUser);

export default router;
