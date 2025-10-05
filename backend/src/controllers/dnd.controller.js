import DnDIngredient from "../models/dndIngredient.model.js";
import DnDPreview from "../models/dndPreview.model.js";

// DnD Ingredients
export const createDnDIngredient = async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const existing = await DnDIngredient.findOne({ name: { $regex: `^${name}$`, $options: "i" }, isDeleted: { $ne: true } });
    if (existing) return res.status(400).json({ message: "Ingredient name already exists." });

    const doc = await DnDIngredient.create({ name, price, image, category });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDnDIngredients = async (_req, res) => {
  try {
    const docs = await DnDIngredient.find({ isDeleted: { $ne: true } }).lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDnDIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, image, category } = req.body;
    if (name) {
      const dup = await DnDIngredient.findOne({ name: { $regex: `^${name}$`, $options: "i" }, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (dup) return res.status(400).json({ message: "Ingredient name already exists." });
    }
    const doc = await DnDIngredient.findByIdAndUpdate(id, { name, price, image, category }, { new: true });
    if (!doc) return res.status(404).json({ message: "Ingredient not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDnDIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DnDIngredient.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!doc) return res.status(404).json({ message: "Ingredient not found" });
    res.json({ message: "Ingredient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DnD Previews
export const createDnDPreview = async (req, res) => {
  try {
    const { name, image, blendImage, ingredients = [], isStandalone = false } = req.body;
    const existing = await DnDPreview.findOne({ name: { $regex: `^${name}$`, $options: "i" }, isDeleted: { $ne: true } });
    if (existing) return res.status(400).json({ message: "Preview name already exists." });

    // Optional: validate that provided ingredientIds exist
    if (ingredients.length > 0) {
      const ingredientIds = ingredients.map(ing => ing.ingredientId);
      const count = await DnDIngredient.countDocuments({ _id: { $in: ingredientIds }, isDeleted: { $ne: true } });
      if (count !== ingredientIds.length) {
        return res.status(400).json({ message: "One or more ingredients not found." });
      }
    }

    const doc = await DnDPreview.create({ name, image, blendImage, ingredients, isStandalone });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDnDPreviews = async (_req, res) => {
  try {
    const docs = await DnDPreview.find({ isDeleted: { $ne: true } })
      .populate("ingredients.ingredientId", "name category price")
      .lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDnDPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, blendImage, ingredients = [], isStandalone } = req.body;
    if (name) {
      const dup = await DnDPreview.findOne({ name: { $regex: `^${name}$`, $options: "i" }, _id: { $ne: id }, isDeleted: { $ne: true } });
      if (dup) return res.status(400).json({ message: "Preview name already exists." });
    }
    if (ingredients.length > 0) {
      const ingredientIds = ingredients.map(ing => ing.ingredientId);
      const count = await DnDIngredient.countDocuments({ _id: { $in: ingredientIds }, isDeleted: { $ne: true } });
      if (count !== ingredientIds.length) return res.status(400).json({ message: "One or more ingredients not found." });
    }
    const doc = await DnDPreview.findByIdAndUpdate(id, { name, image, blendImage, ingredients, isStandalone }, { new: true });
    if (!doc) return res.status(404).json({ message: "Preview not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDnDPreview = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DnDPreview.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!doc) return res.status(404).json({ message: "Preview not found" });
    res.json({ message: "Preview deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


