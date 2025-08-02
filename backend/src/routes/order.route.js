import express from "express";
import {
  placeOrder,
  getOrdersByUser,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrdersWaitingForRider,
  getOrdersByRider,
  acceptOrder,
  completeOrder,
  requestRefund,
  approveRefund,
  rejectRefund,
  processRefund,
  getRefundRequests,
} from "../controllers/order.controller.js";

const router = express.Router();

// Place order
router.post("/", placeOrder);

// Get all orders (admin)
router.get("/", getAllOrders);

// Get orders waiting for rider
router.get("/waiting-for-rider", getOrdersWaitingForRider);

// Get orders by rider
router.get("/rider/:riderId", getOrdersByRider);

// Get orders by user ID
router.get("/user/:userId", getOrdersByUser);

// Refund routes (must come before /:orderId routes)
// Get refund requests (admin)
router.get("/refund/requests", getRefundRequests);

// Get order by ID
router.get("/:orderId", getOrderById);

// Update order status (admin)
router.patch("/:orderId/status", updateOrderStatus);

// Accept order by rider
router.patch("/:orderId/accept", acceptOrder);

// Complete order by rider
router.patch("/:orderId/complete", completeOrder);

// Cancel order
router.patch("/:orderId/cancel", cancelOrder);

// Refund routes
// Request refund (user)
router.post("/:orderId/refund/request", requestRefund);

// Approve refund (admin)
router.patch("/:orderId/refund/approve", approveRefund);

// Reject refund (admin)
router.patch("/:orderId/refund/reject", rejectRefund);

// Process refund (admin)
router.patch("/:orderId/refund/process", processRefund);

export default router;
