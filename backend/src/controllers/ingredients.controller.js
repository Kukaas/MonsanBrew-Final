import Ingredient from "../models/ingredients.model.js";
import Inventory from "../models/inventory.model.js";

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
      // Update existing ingredient stock
      existing.stock = parseFloat((existing.stock + stock).toFixed(2));
      await existing.save();
      return res.status(200).json(existing);
    }

    // Recipe is optional - some ingredients don't need raw materials
    let rawMaterials = [];
    if (recipe && recipe.length > 0) {
      // Check if all raw materials exist and have enough stock
      for (const recipeItem of recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
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

        rawMaterials.push({
          rawMaterialId: recipeItem.rawMaterialId,
          quantity: requiredQuantity,
          unit: recipeItem.unit,
        });
      }

      // Deduct raw materials from inventory
      for (const recipeItem of recipe) {
        const rawMaterial = await Inventory.findById(recipeItem.rawMaterialId);
        const requiredQuantity = recipeItem.quantity * stock;
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
      rawMaterials,
      image,
    });

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
      .populate("rawMaterials.rawMaterialId", "productName unit")
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
      .populate("rawMaterials.rawMaterialId", "productName unit")
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
    await ingredient.save();

    res.status(200).json(ingredient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
