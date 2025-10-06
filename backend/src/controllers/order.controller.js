import Order from "../models/order.model.js";
import Product from "../models/products.model.js";
import Ingredient from "../models/ingredients.model.js";
import { updateProductSales } from "./review.controller.js";

// Define low stock thresholds for different units
const LOW_STOCK_THRESHOLDS = {
  pieces: 20,
  kilograms: 2,
  grams: 100,
  liters: 2,
  milliliters: 1000,
  packs: 5,
  boxes: 3,
  cans: 10,
  bottles: 15,
  trays: 2,
  sachets: 50,
  dozens: 2,
};

// Helper function to update ingredient status based on stock
const updateIngredientStatus = (ingredient) => {
  const threshold = LOW_STOCK_THRESHOLDS[ingredient.unit] || 10; // Default threshold

  if (ingredient.stock === 0) {
    ingredient.status = "out_of_stock";
  } else if (ingredient.stock <= threshold) {
    ingredient.status = "low_stock";
  } else {
    ingredient.status = "in_stock";
  }
};

export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      address,
      deliveryInstructions, // optional
      paymentMethod,
      referenceNumber,
      proofImage,
      total,
    } = req.body;

    // Validate required fields (do not require deliveryInstructions)
    if (
      !userId ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !address ||
      !paymentMethod ||
      !total
    ) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // If paymentMethod is gcash, proofImage must be present
    if (paymentMethod === "gcash" && !proofImage) {
      return res
        .status(400)
        .json({ error: "Proof image is required for GCash payments." });
    }

    const order = new Order({
      userId,
      items,
      address,
      paymentMethod,
      referenceNumber,
      proofImage: paymentMethod === "gcash" ? proofImage : undefined,
      isReviewed: false,
      status: "pending",
      total,
    });
    // Only add deliveryInstructions if present
    if (deliveryInstructions) order.deliveryInstructions = deliveryInstructions;
    await order.save();

    // Note: Product sales are updated when order is completed, not when placed
    // This prevents double-counting if order is cancelled

    res.status(201).json({ order });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ error: "Failed to place order." });
  }
};

export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const orders = await Order.find({ userId })
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .populate("riderId", "name email contactNumber");

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json({ order });
  } catch (err) {
    console.error("Get order by ID error:", err);
    res.status(500).json({ error: "Failed to fetch order." });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!reason) {
      return res
        .status(400)
        .json({ error: "Cancellation reason is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Only allow cancellation for pending orders or completed orders (for admin purposes)
    if (order.status !== "pending" && order.status !== "completed") {
      return res.status(400).json({
        error:
          "Order cannot be cancelled. Only pending or completed orders can be cancelled.",
      });
    }

    // If cancelling a completed order, revert the sales count
    if (order.status === "completed") {
      for (const item of order.items) {
        await updateProductSales(item.productId, -item.quantity); // Subtract the quantity
      }
    }

    // Only allow cancellation for COD payments
    if (order.paymentMethod !== "cod") {
      return res
        .status(400)
        .json({ error: "Only COD orders can be cancelled." });
    }

    // Update order status and add cancellation reason
    order.status = "cancelled";
    order.cancellationReason = reason;
    await order.save();

    res.status(200).json({ message: "Order cancelled successfully.", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ error: "Failed to cancel order." });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .populate("riderId", "name email contactNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

// Get orders waiting for rider
export const getOrdersWaitingForRider = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "waiting_for_rider",
      riderId: { $exists: false }, // Not assigned to any rider yet
    })
      .populate("userId", "name email contactNumber")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get orders waiting for rider error:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch orders waiting for rider." });
  }
};

// Get orders assigned to a specific rider
export const getOrdersByRider = async (req, res) => {
  try {
    const { riderId } = req.params;

    if (!riderId) {
      return res.status(400).json({ error: "Rider ID is required." });
    }

    const orders = await Order.find({
      riderId: riderId,
      status: { $in: ["out_for_delivery", "completed"] },
    })
      .populate("userId", "name email contactNumber")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get orders by rider error:", err);
    res.status(500).json({ error: "Failed to fetch rider orders." });
  }
};

// Accept order by rider
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!riderId) {
      return res.status(400).json({ error: "Rider ID is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if order is waiting for rider
    if (order.status !== "waiting_for_rider") {
      return res
        .status(400)
        .json({ error: "Order is not available for acceptance." });
    }

    // Check if order is already assigned to a rider
    if (order.riderId) {
      return res
        .status(400)
        .json({ error: "Order is already assigned to a rider." });
    }

    // Assign rider and update status
    order.riderId = riderId;
    order.status = "out_for_delivery";
    await order.save();

    res.status(200).json({ message: "Order accepted successfully.", order });
  } catch (err) {
    console.error("Accept order error:", err);
    res.status(500).json({ error: "Failed to accept order." });
  }
};

// Complete order by rider with delivery proof
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId, deliveryProofImage } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!riderId) {
      return res.status(400).json({ error: "Rider ID is required." });
    }

    if (!deliveryProofImage) {
      return res
        .status(400)
        .json({ error: "Delivery proof image is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if order is assigned to this rider
    if (order.riderId?.toString() !== riderId) {
      return res
        .status(403)
        .json({ error: "You can only complete orders assigned to you." });
    }

    // Check if order is out for delivery
    if (order.status !== "out_for_delivery") {
      return res
        .status(400)
        .json({ error: "Order must be out for delivery to be completed." });
    }

    // Update order status and add delivery proof
    order.status = "completed";
    order.deliveryProofImage = deliveryProofImage;
    await order.save();

    // Update product sales count
    for (const item of order.items) {
      await updateProductSales(item.productId, item.quantity);
    }

    res.status(200).json({ message: "Order completed successfully.", order });
  } catch (err) {
    console.error("Complete order error:", err);
    res.status(500).json({ error: "Failed to complete order." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }

    // Validate status values
    const validStatuses = [
      "pending",
      "approved",
      "preparing",
      "waiting_for_rider",
      "out_for_delivery",
      "completed",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Don't allow updating completed or cancelled orders
    if (order.status === "completed" || order.status === "cancelled") {
      return res
        .status(400)
        .json({ error: "Cannot update completed or cancelled orders." });
    }

        // Check if status is changing to "waiting_for_rider" and deduct ingredients
        if (
          status === "waiting_for_rider" &&
          order.status !== "waiting_for_rider"
        ) {
          try {
            let totalIngredientsToDeduct = [];

            // Process each order item (only regular products for ingredient deduction)
            for (let i = 0; i < order.items.length; i++) {
              const orderItem = order.items[i];

              // Skip custom drinks for ingredient deduction
              if (orderItem.isCustomDrink) {
                continue;
              }

              // Handle regular products only
              const product = await Product.findById(orderItem.productId).populate("ingredients.ingredientId");

              if (product && product.ingredients && product.ingredients.length > 0) {
                // Process each ingredient in the product
                for (let j = 0; j < product.ingredients.length; j++) {
                  const ingredient = product.ingredients[j];
                  const quantityNeeded = ingredient.quantity * orderItem.quantity;

                  // Add to deduction list
                  totalIngredientsToDeduct.push({
                    productName: orderItem.productName,
                    ingredientId: ingredient.ingredientId,
                    ingredientName:
                      ingredient.ingredientId?.ingredientName ||
                      "Unknown Ingredient",
                    quantityNeeded,
                    unit:
                      ingredient.unit || ingredient.ingredientId?.unit || "units",
                  });
                }
              }
            }

        // Now validate and deduct ingredients
        for (const deductionItem of totalIngredientsToDeduct) {
          // Find the corresponding ingredient
          const ingredient = await Ingredient.findById(
            deductionItem.ingredientId
          );

          if (ingredient) {
            // Check if there's enough stock
            if (ingredient.stock < deductionItem.quantityNeeded) {
              return res.status(400).json({
                error: `Insufficient stock for ingredient: ${deductionItem.ingredientName}. Required: ${deductionItem.quantityNeeded} ${deductionItem.unit}, Available: ${ingredient.stock} ${ingredient.unit}`,
              });
            }

            // Deduct the quantity from ingredient stock
            const oldStock = ingredient.stock;
            ingredient.stock =
              Math.round(
                (ingredient.stock - deductionItem.quantityNeeded) * 100
              ) / 100;

            // Update status based on remaining stock
            updateIngredientStatus(ingredient);

            await ingredient.save();
          } else {
            return res.status(400).json({
              error: `Ingredient not found: ${deductionItem.ingredientName}. Please add this ingredient first.`,
            });
          }
        }
      } catch (ingredientError) {
        console.error("Error deducting ingredients:", ingredientError);
        return res
          .status(500)
          .json({ error: "Failed to update ingredient quantities." });
      }
    }

    // Update order status
    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully.", order });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
};

// Request refund
export const requestRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const {
      reason,
      refundProofImage,
      selectedItems,
      itemQuantities,
      totalRefundAmount,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!reason) {
      return res.status(400).json({ error: "Refund reason is required." });
    }

    if (!refundProofImage) {
      return res.status(400).json({ error: "Refund proof image is required." });
    }

    if (
      !selectedItems ||
      !Array.isArray(selectedItems) ||
      selectedItems.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Please select at least one item to refund." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Only allow refund requests for completed orders
    if (order.status !== "completed") {
      return res.status(400).json({
        error: "Only completed orders can request refunds.",
      });
    }

    // Check if refund is already requested or processed
    if (order.refundStatus !== "none") {
      return res.status(400).json({
        error: "Refund has already been requested or processed for this order.",
      });
    }

    // Validate selected items
    const validItemIndices = selectedItems.every(
      (index) => index >= 0 && index < order.items.length
    );
    if (!validItemIndices) {
      return res.status(400).json({ error: "Invalid item selection." });
    }

    // Validate item quantities if provided
    if (itemQuantities) {
      for (const [itemIndex, quantity] of Object.entries(itemQuantities)) {
        const index = parseInt(itemIndex);
        if (index < 0 || index >= order.items.length) {
          return res
            .status(400)
            .json({ error: "Invalid item index in quantities." });
        }
        const item = order.items[index];
        if (quantity < 1 || quantity > item.quantity) {
          return res.status(400).json({
            error: `Invalid quantity for item ${index}. Must be between 1 and ${item.quantity}.`,
          });
        }
      }
    }

    // Create refund items array
    const refundItems = selectedItems.map((itemIndex) => {
      const item = order.items[itemIndex];
      const quantityToRefund = itemQuantities?.[itemIndex] || item.quantity;
      const itemTotal =
        (item.price +
          (item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0)) *
        quantityToRefund;

      return {
        itemIndex,
        productId: item.productId,
        productName: item.productName,
        size: item.size, // Include size information
        quantity: quantityToRefund, // Use the selected quantity
        price: item.price,
        addOns: item.addOns || [],
        refundAmount: itemTotal,
      };
    });

    // Calculate total refund amount
    const calculatedTotal = refundItems.reduce(
      (sum, item) => sum + item.refundAmount,
      0
    );

    // Update order with refund request
    order.refundStatus = "refund_requested";
    order.status = "refund"; // Update main status for frontend reference
    order.refundRequestDate = new Date();
    order.refundReason = reason;
    order.refundProofImage = refundProofImage;
    order.refundAmount = calculatedTotal; // Use calculated amount
    order.refundItems = refundItems; // Store refund items

    await order.save();

    res.status(200).json({
      message: "Refund request submitted successfully.",
      order,
    });
  } catch (err) {
    console.error("Request refund error:", err);
    res.status(500).json({ error: "Failed to request refund." });
  }
};

// Approve refund (admin)
export const approveRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundAmount } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if refund is requested
    if (order.refundStatus !== "refund_requested") {
      return res.status(400).json({
        error: "Order is not in refund requested status.",
      });
    }

    // Update order with approved refund
    order.refundStatus = "refund_approved";
    order.status = "refund"; // Keep main status as refund for frontend reference
    order.refundAmount = refundAmount || order.refundAmount; // Use provided amount or calculated amount

    await order.save();

    res.status(200).json({
      message: "Refund approved successfully.",
      order,
    });
  } catch (err) {
    console.error("Approve refund error:", err);
    res.status(500).json({ error: "Failed to approve refund." });
  }
};

// Reject refund (admin)
export const rejectRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rejectionMessage } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!rejectionMessage) {
      return res.status(400).json({ error: "Rejection message is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if refund is requested
    if (order.refundStatus !== "refund_requested") {
      return res.status(400).json({
        error: "Order is not in refund requested status.",
      });
    }

    // Update order with rejected refund
    order.refundStatus = "refund_rejected";
    order.status = "refund"; // Keep main status as refund for frontend reference
    order.refundRejectionMessage = rejectionMessage;

    await order.save();

    res.status(200).json({
      message: "Refund rejected successfully.",
      order,
    });
  } catch (err) {
    console.error("Reject refund error:", err);
    res.status(500).json({ error: "Failed to reject refund." });
  }
};

// Process refund (admin)
export const processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundPaymentProof } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required." });
    }

    if (!refundPaymentProof) {
      return res
        .status(400)
        .json({ error: "Refund payment proof is required." });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Check if refund is approved
    if (order.refundStatus !== "refund_approved") {
      return res.status(400).json({
        error: "Order is not in refund approved status.",
      });
    }

    // Update order with processed refund
    order.refundStatus = "refund_processed";
    order.status = "refund"; // Keep main status as refund for frontend reference
    order.refundProcessedDate = new Date();
    order.refundPaymentProof = refundPaymentProof;

    await order.save();

    res.status(200).json({
      message: "Refund processed successfully.",
      order,
    });
  } catch (err) {
    console.error("Process refund error:", err);
    res.status(500).json({ error: "Failed to process refund." });
  }
};

// Get orders with refund requests (admin)
export const getRefundRequests = async (req, res) => {
  try {
    const orders = await Order.find({
      refundStatus: {
        $in: [
          "refund_requested",
          "refund_approved",
          "refund_rejected",
          "refund_processed",
        ],
      },
    })
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .sort({ refundRequestDate: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Get refund requests error:", err);
    res.status(500).json({ error: "Failed to fetch refund requests." });
  }
};
