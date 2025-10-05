import express from "express";
import {
  createDnDIngredient,
  getDnDIngredients,
  updateDnDIngredient,
  deleteDnDIngredient,
  createDnDPreview,
  getDnDPreviews,
  updateDnDPreview,
  deleteDnDPreview,
} from "../controllers/dnd.controller.js";

const router = express.Router();

// Ingredients
router.post("/ingredients", createDnDIngredient);
router.get("/ingredients", getDnDIngredients);
router.put("/ingredients/:id", updateDnDIngredient);
router.delete("/ingredients/:id", deleteDnDIngredient);

// Previews
router.post("/previews", createDnDPreview);
router.get("/previews", getDnDPreviews);
router.put("/previews/:id", updateDnDPreview);
router.delete("/previews/:id", deleteDnDPreview);

export default router;


