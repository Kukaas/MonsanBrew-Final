import DndItem from "../models/ingredient.model.js";

// Create new dnd item
export const createDndItem = async (req, res) => {
  try {
    const { ingredientName, price, image } = req.body;

    // Validate required fields
    if (!ingredientName || !price || !image) {
      return res.status(400).json({
        error: "Item name, price, and image are required.",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: "Price must be greater than 0.",
      });
    }

    const dndItem = new DndItem({
      ingredientName: ingredientName.trim(),
      price: Number(price),
      image,
    });

    await dndItem.save();

    res.status(201).json({ dndItem });
  } catch (err) {
    console.error("Create dnd item error:", err);
    res.status(500).json({ error: "Failed to create dnd item." });
  }
};

// Get all dnd items
export const getDndItems = async (req, res) => {
  try {
    const dndItems = await DndItem.find({ isActive: true })
      .sort({ ingredientName: 1 });

    res.status(200).json({ dndItems });
  } catch (err) {
    console.error("Get dnd items error:", err);
    res.status(500).json({ error: "Failed to fetch dnd items." });
  }
};

// Get dnd item by ID
export const getDndItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const dndItem = await DndItem.findById(id);

    if (!dndItem) {
      return res.status(404).json({ error: "Dnd item not found." });
    }

    res.status(200).json({ dndItem });
  } catch (err) {
    console.error("Get dnd item by ID error:", err);
    res.status(500).json({ error: "Failed to fetch dnd item." });
  }
};

// Update dnd item
export const updateDndItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { ingredientName, price, image, isActive } = req.body;

    // Validate required fields
    if (!ingredientName || !price) {
      return res.status(400).json({
        error: "Item name and price are required.",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: "Price must be greater than 0.",
      });
    }

    const dndItem = await DndItem.findById(id);

    if (!dndItem) {
      return res.status(404).json({ error: "Dnd item not found." });
    }

    // Update dnd item fields
    dndItem.ingredientName = ingredientName.trim();
    dndItem.price = Number(price);
    if (image !== undefined) dndItem.image = image;
    if (isActive !== undefined) dndItem.isActive = isActive;

    await dndItem.save();

    res.status(200).json({ dndItem });
  } catch (err) {
    console.error("Update dnd item error:", err);
    res.status(500).json({ error: "Failed to update dnd item." });
  }
};

// Delete dnd item
export const deleteDndItem = async (req, res) => {
  try {
    const { id } = req.params;

    const dndItem = await DndItem.findById(id);

    if (!dndItem) {
      return res.status(404).json({ error: "Dnd item not found." });
    }

    await DndItem.findByIdAndDelete(id);

    res.status(200).json({ message: "Dnd item deleted successfully." });
  } catch (err) {
    console.error("Delete dnd item error:", err);
    res.status(500).json({ error: "Failed to delete dnd item." });
  }
};
