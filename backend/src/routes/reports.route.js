import express from 'express';
import { getReportsSummary, getOrdersReport, getDeliveryPerformance, getFeedbackReport, getProductFeedback, getRiderPerformance } from '../controllers/reports.controller.js';

const router = express.Router();

router.get('/summary', getReportsSummary);
router.get('/orders', getOrdersReport);
router.get('/delivery-performance', getDeliveryPerformance);
router.get('/feedback', getFeedbackReport);
router.get('/feedback/product/:productId', getProductFeedback);
router.get('/delivery-performance/riders', getRiderPerformance);

export default router;


