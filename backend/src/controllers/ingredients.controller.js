import Ingredient from "../models/ingredients.model.js";
import Inventory from "../models/inventory.model.js";

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

// Create a new ingredient or update existing one
export const createIngredient = async (req, res) => {
  try {
    const { ingredientName, description, stock, unit, recipe, image } =
      req.body;

    // Check if ingredient already exists
    const existing = await Ingredient.findOne({
      ingredientName: { $regex: `^${ingredientName}$`, $options: "i" },
      isDeleted: { $ne: true },
    });

    if (existing) {
      // Recipe is optional - some ingredients don't need raw materials
      if (recipe && recipe.length > 0) {
        // Check if all raw materials exist and have enough stock
        for (const recipeItem of recipe) {
          const rawMaterial = await Inventory.findById(
            recipeItem.rawMaterialId
          );
          if (!rawMaterial) {
            return res.status(400).json({
              message: `Raw material with ID ${recipeItem.rawMaterialId} not found.`,
            });
          }

          // Calculate how much raw material is needed for the requested stock
          const requiredQuantity = recipeItem.quantity * stock;
          if (rawMaterial.stock < requiredQuantity) {
            return res.status(400).json({
              message: `Insufficient stock for ${rawMaterial.productName}. Available: ${rawMaterial.stock} ${rawMaterial.unit}, Required: ${requiredQuantity} ${recipeItem.unit}`,
            });
          }
        }

        // Deduct raw materials from inventory
        for (const recipeItem of recipe) {
          const rawMaterial = await Inventory.findById(
            recipeItem.rawMaterialId
          );
          const requiredQuantity = recipeItem.quantity; // Don't multiply by stock
          rawMaterial.stock = parseFloat(
            (rawMaterial.stock - requiredQuantity).toFixed(2)
          );
          await rawMaterial.save();
        }
      }

      // Update existing ingredient stock
      existing.stock = parseFloat((existing.stock + stock).toFixed(2));

      // Update status based on new stock level
      updateIngredientStatus(existing);

      await existing.save();
      return res.status(200).json(existing);
    }

    // Recipe is optional - some ingredients don't need raw materials
    if (recipe && recipe.length > 0) {
      // Check if all raw materials exist and have enough stock
      for (const recipeItem of recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
        if (!rawMaterial) {
          return res.status(400).json({
            message: `Raw material with ID ${recipeItem.rawMaterialId} not found.`,
          });
        }

        // Check if raw material has enough stock (don't multiply by ingredient stock)
        const requiredQuantity = recipeItem.quantity;
        if (rawMaterial.stock < requiredQuantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${rawMaterial.productName}. Available: ${rawMaterial.stock} ${rawMaterial.unit}, Required: ${requiredQuantity} ${recipeItem.unit}`,
          });
        }
      }

      // Deduct raw materials from inventory
      for (const recipeItem of recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
        const requiredQuantity = recipeItem.quantity; // Don't multiply by stock
        rawMaterial.stock = parseFloat(
          (rawMaterial.stock - requiredQuantity).toFixed(2)
        );
        await rawMaterial.save();
      }
    }

    const ingredient = new Ingredient({
      ingredientName,
      description,
      stock,
      unit,
      recipe,
      image,
    });

    // Update status based on stock level
    updateIngredientStatus(ingredient);

    await ingredient.save();
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all ingredients
export const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({ isDeleted: { $ne: true } })
      .populate("recipe.rawMaterialId", "productName unit")
      .lean();
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single ingredient by ID
export const getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate("recipe.rawMaterialId", "productName unit stock")
      .lean();

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an ingredient
export const updateIngredient = async (req, res) => {
  try {
    const { ingredientName, description, stock, unit, recipe, image } =
      req.body;

    // Check for duplicate ingredient name (excluding current ingredient)
    const existing = await Ingredient.findOne({
      ingredientName: { $regex: `^${ingredientName}$`, $options: "i" },
      isDeleted: { $ne: true },
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Ingredient name already exists." });
    }

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { ingredientName, description, stock, unit, recipe, image },
      { new: true }
    );

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an ingredient (soft delete)
export const deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }
    res.status(200).json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add stock to ingredient (create more from raw materials)
export const addIngredientStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ message: "Ingredient not found" });
    }

    // Check if raw materials have enough stock for the new quantity (only if recipe exists)
    if (ingredient.recipe && ingredient.recipe.length > 0) {
      for (const recipeItem of ingredient.recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
        if (!rawMaterial) {
          return res.status(400).json({ message: `Raw material not found.` });
        }

        const requiredQuantity = recipeItem.quantity * quantity;
        if (rawMaterial.stock < requiredQuantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${rawMaterial.productName}. Available: ${rawMaterial.stock} ${rawMaterial.unit}, Required: ${requiredQuantity} ${recipeItem.unit}`,
          });
        }
      }

      // Deduct raw materials from inventory
      for (const recipeItem of ingredient.recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
        const requiredQuantity = recipeItem.quantity * quantity;
        rawMaterial.stock = parseFloat(
          (rawMaterial.stock - requiredQuantity).toFixed(2)
        );
        await rawMaterial.save();
      }
    }

    // Add to ingredient stock
    ingredient.stock = parseFloat((ingredient.stock + quantity).toFixed(2));

    // Update status based on new stock level
    updateIngredientStatus(ingredient);

    await ingredient.save();

    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
