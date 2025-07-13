import express from 'express';
import { getDashboardSummary, getSalesData, getRecentOrders, getLowStockItems, getSalesDataWeekly, getSalesDataMonthly } from '../controllers/dashboard.controller.js';

const router = express.Router();

// Get dashboard summary statistics
router.get('/summary', getDashboardSummary);

// Get sales data for charts
router.get('/sales', getSalesData);
// New endpoints for weekly and monthly sales data
router.get('/sales/weekly', getSalesDataWeekly);
router.get('/sales/monthly', getSalesDataMonthly);

// Get recent orders
router.get('/recent-orders', getRecentOrders);

// Get low stock items
router.get('/low-stock', getLowStockItems);

export default router; 