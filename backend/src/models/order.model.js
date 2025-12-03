import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.isWalkInOrder;
      }
    },
    // Walk-in order fields
    isWalkInOrder: {
      type: Boolean,
      default: false
    },
    customerName: {
      type: String,
      required: function () {
        return this.isWalkInOrder;
      }
    },
    customerContact: {
      type: String,
      required: false
    },
    orderType: {
      type: String,
      enum: ["delivery", "dine_in", "take_out"],
      default: "delivery"
    },
    frontdeskUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.isWalkInOrder;
      }
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: function () {
            return !this.isCustomDrink;
          }
        },
        productName: String,
        image: String,
        size: String,
        addOns: [
          {
            addonId: { type: mongoose.Schema.Types.ObjectId, ref: "Addon" },
            name: String,
            price: Number,
          },
        ],
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        // Custom drink fields
        isCustomDrink: {
          type: Boolean,
          default: false
        },
        customIngredients: [
          {
            ingredientId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "DndItems"
            },
            name: String,
            price: Number,
            image: String,
            quantity: {
              type: Number,
              default: 1
            }
          }
        ],
        customImage: String,
        customBlendImage: String,
        customDrinkName: String,
        customSize: String // size for custom drinks (Small, Medium, Large, Extra Large)
      },
    ],
    address: {
      contactNumber: String,
      lotNo: String,
      purok: String,
      street: String,
      landmark: String,
      barangay: String,
      municipality: String,
      province: String,
      // Add coordinates for map functionality
      latitude: Number,
      longitude: Number,
    },
    deliveryInstructions: { type: String }, // optional
    paymentMethod: { type: String, enum: ["gcash", "cod", "cash"], required: true },
    referenceNumber: { type: String },
    proofImage: { type: String }, // base64 for GCash
    isReviewed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "preparing",
        "waiting_for_rider",
        "out_for_delivery",
        "completed",
        "cancelled",
        "refund",
      ],
      default: "pending",
    },
    cancellationReason: { type: String }, // reason for cancellation
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // assigned rider
    deliveryProofImage: { type: String }, // base64 for delivery proof
    total: { type: Number, required: true },
    deliveryFee: { type: Number, default: 15 }, // Dynamic delivery fee calculated on frontend
    // Refund related fields
    refundStatus: {
      type: String,
      enum: [
        "none",
        "refund_requested",
        "refund_approved",
        "refund_rejected",
        "refund_processed",
      ],
      default: "none",
    },
    refundRequestDate: { type: Date },
    refundReason: { type: String }, // reason for refund request
    refundProofImage: { type: String }, // base64 for refund proof (order condition)
    refundRejectionMessage: { type: String }, // message when refund is rejected
    refundProcessedDate: { type: Date },
    refundAmount: { type: Number }, // amount to be refunded
    refundPaymentProof: { type: String }, // base64 for refund payment proof
    refundItems: [
      {
        itemIndex: { type: Number, required: true }, // index of the item in the order
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: String,
        size: String, // Include size information
        quantity: { type: Number, required: true }, // quantity to refund
        price: { type: Number, required: true }, // price per item
        addOns: [
          {
            addonId: { type: mongoose.Schema.Types.ObjectId, ref: "Addon" },
            name: String,
            price: Number,
          },
        ],
        refundAmount: { type: Number, required: true }, // total refund amount for this item
      },
    ],
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
export default Order;
