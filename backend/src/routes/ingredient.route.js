import express from "express";
import {
  createDndItem,
  getDndItems,
  getDndItemById,
  updateDndItem,
  deleteDndItem,
} from "../controllers/ingredient.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/admin.middleware.js";

const router = express.Router();

// Public route - anyone can get dnd items
router.get("/", getDndItems);

// Protected routes - require authentication and admin role
router.use(protect);
router.use(adminOnly);

// Create new dnd item
router.post("/", createDndItem);

// Get dnd item by ID
router.get("/:id", getDndItemById);

// Update dnd item
router.put("/:id", updateDndItem);

// Delete dnd item
router.delete("/:id", deleteDndItem);

export default router;
