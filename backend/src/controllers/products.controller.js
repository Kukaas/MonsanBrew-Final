import Product from "../models/products.model.js";
import Inventory from "../models/inventory.model.js";
import Ingredient from "../models/ingredients.model.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const {
      category,
      productName,
      description,
      addOns,
      isAvailable,
      preparationTime,
      isCustomizable,
      ingredients,
      image,
      sizes,
      price,
    } = req.body;

    // Check for duplicate product name (case-insensitive, not deleted)
    const existing = await Product.findOne({
      productName: { $regex: `^${productName}$`, $options: "i" },
      isDeleted: { $ne: true },
    });
    if (existing) {
      return res.status(400).json({ message: "Product name already exists." });
    }

    // Validation for price/sizes
    if (
      (!sizes || sizes.length === 0) &&
      (price === undefined || price === null)
    ) {
      return res
        .status(400)
        .json({ message: "Either price or sizes must be provided." });
    }
    if (sizes && sizes.length > 0) {
      for (const size of sizes) {
        if (!size.label || typeof size.price !== "number") {
          return res
            .status(400)
            .json({ message: "Each size must have a label and a price." });
        }
      }
    }
    if (isCustomizable && (!addOns || addOns.length === 0)) {
      return res.status(400).json({
        message: "Add-ons are required when product is customizable.",
      });
    }

    // Validate ingredients and check stock
    let ingredientsWithUnit = [];
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        const ingredient = await Ingredient.findById(ing.ingredientId);
        if (!ingredient) {
          return res.status(400).json({
            message: `Ingredient with ID ${ing.ingredientId} not found.`,
          });
        }

        // Check if ingredient has enough stock
        if (ingredient.stock < ing.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${ingredient.ingredientName}. Available: ${ingredient.stock} ${ingredient.unit}, Required: ${ing.quantity} ${ing.unit}`,
          });
        }

        ingredientsWithUnit.push({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ingredient.unit,
        });
      }
    }

    // Deduct ingredients from stock
    for (const ing of ingredientsWithUnit) {
      const ingredient = await Ingredient.findById(ing.ingredientId);
      ingredient.stock = parseFloat(
        (ingredient.stock - ing.quantity).toFixed(2)
      );
      await ingredient.save();
    }

    const product = new Product({
      category,
      productName,
      description,
      addOns,
      isAvailable,
      preparationTime,
      isCustomizable,
      ingredients: ingredientsWithUnit,
      image,
      sizes,
      price,
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isDeleted: { $ne: true } })
      .populate("category", "category")
      .populate("addOns", "name price")
      .populate("ingredients.ingredientId", "ingredientName unit stock")
      .lean();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate("category", "category")
      .populate("addOns", "name price")
      .populate("ingredients.ingredientId", "ingredientName unit stock")
      .lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const {
      category,
      productName,
      description,
      addOns,
      isAvailable,
      preparationTime,
      isCustomizable,
      ingredients,
      image,
      sizes,
      price,
    } = req.body;
    // Check for duplicate product name (case-insensitive, not deleted, different _id)
    const existing = await Product.findOne({
      productName: { $regex: `^${productName}$`, $options: "i" },
      isDeleted: { $ne: true },
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(400).json({ message: "Product name already exists." });
    }
    if (isCustomizable && (!addOns || addOns.length === 0)) {
      return res.status(400).json({
        message: "Add-ons are required when product is customizable.",
      });
    }

    // Validate ingredients and check stock
    let ingredientsWithUnit = [];
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        const ingredient = await Ingredient.findById(ing.ingredientId);
        if (!ingredient) {
          return res.status(400).json({
            message: `Ingredient with ID ${ing.ingredientId} not found.`,
          });
        }

        // Check if ingredient has enough stock
        if (ingredient.stock < ing.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${ingredient.ingredientName}. Available: ${ingredient.stock} ${ingredient.unit}, Required: ${ing.quantity} ${ing.unit}`,
          });
        }

        ingredientsWithUnit.push({
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ingredient.unit,
        });
      }
    }

    // Deduct ingredients from stock
    for (const ing of ingredientsWithUnit) {
      const ingredient = await Ingredient.findById(ing.ingredientId);
      ingredient.stock = parseFloat(
        (ingredient.stock - ing.quantity).toFixed(2)
      );
      await ingredient.save();
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        category,
        productName,
        description,
        addOns,
        isAvailable,
        preparationTime,
        isCustomizable,
        ingredients: ingredientsWithUnit,
        image,
        sizes,
        price,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to user's favorites
export const addFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    if (!product.favorites.includes(userId)) {
      product.favorites.push(userId);
      await product.save();
    }
    res.json({ success: true, favorites: product.favorites.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove product from user's favorites
export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.favorites = product.favorites.filter(
      (id) => id.toString() !== userId
    );
    await product.save();
    res.json({ success: true, favorites: product.favorites.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get favorite count for a product
export const getFavoriteCount = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ favorites: product.favorites.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all favorite products for a specific user
export const getFavoritesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    const products = await Product.find({
      favorites: userId,
      isDeleted: { $ne: true },
    })
      .populate("category", "category")
      .populate("addOns", "name price")
      .lean();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
