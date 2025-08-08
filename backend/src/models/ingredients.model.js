import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: (props) =>
          `${props.value} is not a valid stock value. Only up to 2 decimal places allowed.`,
      },
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "pieces",
        "kilograms",
        "grams",
        "liters",
        "milliliters",
        "packs",
        "boxes",
        "cans",
        "bottles",
        "trays",
        "sachets",
        "dozens",
      ],
    },
    // Raw materials used to create this ingredient
    rawMaterials: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        unit: {
          type: String,
          required: true,
        },
      },
    ],
    // Recipe: how much of each raw material is needed to make 1 unit of this ingredient (optional)
    recipe: [
      {
        rawMaterialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: false,
        },
        quantity: {
          type: Number,
          required: false,
          min: 0,
        },
        unit: {
          type: String,
          required: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["in_stock", "out_of_stock", "low_stock"],
      default: "in_stock",
    },
    image: {
      type: String, // base64 string
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
