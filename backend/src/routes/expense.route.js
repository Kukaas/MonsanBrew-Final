import express from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "../controllers/expense.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Create new expense
router.post("/", createExpense);

// Get all expenses with filters
router.get("/", getExpenses);

// Get expense statistics
router.get("/stats", getExpenseStats);

// Get expense by ID
router.get("/:id", getExpenseById);

// Update expense
router.put("/:id", updateExpense);

// Delete expense
router.delete("/:id", deleteExpense);

export default router;
