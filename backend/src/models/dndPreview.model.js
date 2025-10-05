import mongoose from "mongoose";

const dndPreviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // base64 preview image
    blendImage: { type: String, required: false }, // optional base64 blend preview image
    ingredients: [
      {
        ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "DnDIngredient", required: true },
        quantity: { type: Number, required: true, min: 1 }
      }
    ],
    // If true, this preview is not tied to specific ingredients (e.g., base cup)
    isStandalone: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

dndPreviewSchema.index({ name: 1 }, { unique: true, partialFilterExpression: { isDeleted: { $ne: true } } });

const DnDPreview = mongoose.model("DnDPreview", dndPreviewSchema);

export default DnDPreview;


