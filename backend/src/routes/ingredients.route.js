import express from "express";
import {
  createIngredient,
  getIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient,
  addIngredientStock,
} from "../controllers/ingredients.controller.js";

const router = express.Router();

// Create a new ingredient
router.post("/", createIngredient);

// Get all ingredients
router.get("/", getIngredients);

// Get a single ingredient by ID
router.get("/:id", getIngredientById);

// Update an ingredient
router.put("/:id", updateIngredient);

// Delete an ingredient
router.delete("/:id", deleteIngredient);

// Add stock to ingredient
router.post("/:id/add-stock", addIngredientStock);

export default router;
