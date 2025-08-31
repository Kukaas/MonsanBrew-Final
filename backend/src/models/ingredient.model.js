import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema(
  {
    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String, // base64 image
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const DndItem = mongoose.model("DndItems", IngredientSchema);
export default DndItem;
