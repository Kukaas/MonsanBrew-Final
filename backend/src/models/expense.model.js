import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "utilities",
        "rent",
        "supplies",
        "equipment",
        "maintenance",
        "marketing",
        "salary",
        "delivery",
        "ingredients",
        "packaging",
        "other",
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "gcash", "bank_transfer", "credit_card"],
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    receipt: {
      type: String, // base64 image
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", ExpenseSchema);
export default Expense;
