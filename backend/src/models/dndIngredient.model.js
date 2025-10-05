import mongoose from "mongoose";

const dndIngredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true }, // base64
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "flavor",
        "jam",
        "ice",
        "milk",
        "powder",
        "base",
        "other",
      ],
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dndIngredientSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } });

const DnDIngredient = mongoose.model("DnDIngredient", dndIngredientSchema);

export default DnDIngredient;


