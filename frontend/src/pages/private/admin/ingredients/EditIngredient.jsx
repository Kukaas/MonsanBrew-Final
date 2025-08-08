import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ingredientsAPI, rawMaterialsAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import Form from "@/components/custom/Form";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import ImageUpload from "@/components/custom/ImageUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Calculator } from "lucide-react";
import UnitConversionModal from "@/components/custom/UnitConversionModal";

const unitOptions = [
  { value: "pieces", label: "Pieces" },
  { value: "kilograms", label: "Kilograms" },
  { value: "grams", label: "Grams" },
  { value: "liters", label: "Liters" },
  { value: "milliliters", label: "Milliliters" },
  { value: "packs", label: "Packs" },
  { value: "boxes", label: "Boxes" },
  { value: "cans", label: "Cans" },
  { value: "bottles", label: "Bottles" },
  { value: "trays", label: "Trays" },
  { value: "sachets", label: "Sachets" },
  { value: "dozens", label: "Dozens" },
];

export default function EditIngredient() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [ingredientName, setIngredientName] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("pieces");
  const [recipe, setRecipe] = useState([
    { rawMaterialId: "", quantity: "", unit: "" },
  ]);
  const [image, setImage] = useState("");
  const [formError, setFormError] = useState("");
  const [showSaving, setShowSaving] = useState(false);
  const [showUnitConversion, setShowUnitConversion] = useState(false);

  // Fetch ingredient data
  const {
    data: ingredient,
    isLoading: loadingIngredient,
    error: errorIngredient,
  } = useQuery({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      const res = await ingredientsAPI.getById(id);
      return res.data || res;
    },
    enabled: !!id,
  });

  // Fetch raw materials for recipe
  const {
    data: rawMaterials,
    isLoading: loadingRawMaterials,
    error: errorRawMaterials,
  } = useQuery({
    queryKey: ["raw-materials"],
    queryFn: async () => {
      const res = await rawMaterialsAPI.getAll();
      return res.data || res || [];
    },
  });

  // Set form data when ingredient is loaded
  useEffect(() => {
    if (ingredient) {
      setIngredientName(ingredient.ingredientName || "");
      setDescription(ingredient.description || "");
      setStock(ingredient.stock || "");
      setUnit(ingredient.unit || "pieces");
      setImage(ingredient.image || "");
      setRecipe(
        ingredient.recipe && ingredient.recipe.length > 0
          ? ingredient.recipe.map((r) => ({
              rawMaterialId: r.rawMaterialId._id || r.rawMaterialId,
              quantity: r.quantity,
              unit: r.unit,
            }))
          : [{ rawMaterialId: "", quantity: "", unit: "" }]
      );
    }
  }, [ingredient]);

  const { mutate } = useMutation({
    mutationFn: async (updatedIngredient) => {
      return await ingredientsAPI.update(id, updatedIngredient);
    },
    onSuccess: () => {
      setShowSaving(false);
      queryClient.invalidateQueries(["ingredients"]);
      queryClient.invalidateQueries(["ingredient", id]);
      toast.success("Ingredient updated successfully!");
      navigate("/admin/ingredients");
    },
    onError: (err) => {
      setShowSaving(false);
      let msg = "Failed to update ingredient";
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }
      setFormError(msg);
      toast.error(msg);
    },
  });

  const handleRecipeChange = (idx, field, value) => {
    setRecipe(
      recipe.map((item, i) => {
        if (i === idx) {
          if (field === "rawMaterialId") {
            // Find unit from raw materials
            const found = rawMaterials?.find((rm) => rm._id === value);
            return { ...item, [field]: value, unit: found?.unit || "" };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleAddRecipe = () => {
    setRecipe([...recipe, { rawMaterialId: "", quantity: "", unit: "" }]);
  };

  const handleRemoveRecipe = (idx) => {
    setRecipe(recipe.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (!ingredientName.trim()) {
      setFormError("Ingredient name is required");
      return;
    }

    if (!stock || isNaN(stock)) {
      setFormError("Valid stock is required");
      return;
    }

    // Recipe is optional - some ingredients don't need raw materials
    if (recipe.length > 0) {
      // Only validate recipe items that have been started (have rawMaterialId or quantity)
      const startedRecipeItems = recipe.filter(
        (r) => r.rawMaterialId || r.quantity
      );
      if (startedRecipeItems.some((r) => !r.rawMaterialId)) {
        setFormError("All recipe items must have a raw material selected");
        return;
      }
    }

    setShowSaving(true);
    mutate({
      ingredientName: ingredientName.trim(),
      description: description.trim(),
      stock: Number(stock),
      unit,
      recipe: recipe
        .filter((r) => r.rawMaterialId)
        .map((r) => ({
          rawMaterialId: r.rawMaterialId,
          quantity: r.quantity ? Number(r.quantity) : 0,
          unit: r.unit,
        })),
      image,
    });
  };

  if (loadingIngredient) {
    return (
      <AdminLayout>
        <PageLayout
          title="Edit Ingredient"
          description="Update ingredient information."
          action={
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/admin/ingredients")}
            >
              Back to Ingredients
            </Button>
          }
        >
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-[#333] rounded"></div>
              <div className="h-10 bg-[#333] rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-[#333] rounded"></div>
                <div className="h-10 bg-[#333] rounded"></div>
              </div>
            </div>
          </div>
        </PageLayout>
      </AdminLayout>
    );
  }

  if (errorIngredient) {
    return (
      <AdminLayout>
        <PageLayout
          title="Edit Ingredient"
          description="Update ingredient information."
          action={
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/admin/ingredients")}
            >
              Back to Ingredients
            </Button>
          }
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load ingredient data.</p>
              <Button
                variant="yellow"
                size="lg"
                onClick={() => navigate("/admin/ingredients")}
                className="mt-4"
              >
                Back to Ingredients
              </Button>
            </div>
          </div>
        </PageLayout>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageLayout
        title="Edit Ingredient"
        description="Update ingredient details."
      >
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full bg-[#181818] p-8 rounded-2xl border border-[#232323] shadow-lg">
            {/* Ingredient Information Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-bold text-[#FFC107] mb-4">
                Ingredient Information
              </h2>
            </div>
            {/* Left column: Ingredient Information */}
            <div className="flex flex-col gap-4">
              <FormInput
                label={
                  <span className="font-bold text-[#FFC107]">
                    Ingredient Name
                  </span>
                }
                name="ingredientName"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="e.g. Coffee Extract, Bread Dough"
                autoFocus
              />

              <FormInput
                label={
                  <span className="font-bold text-[#FFC107]">Description</span>
                }
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="Optional description"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#FFC107]">Stock</label>
                  <FormInput
                    name="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    error={formError}
                    variant="dark"
                    placeholder="Enter stock quantity"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#FFC107]">Unit</label>
                  <CustomSelect
                    value={unit}
                    onChange={setUnit}
                    options={unitOptions}
                    placeholder="Select unit"
                    name="unit"
                    error={formError}
                    variant="dark"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#FFC107]">Image</label>
                <ImageUpload
                  label=""
                  value={image}
                  onChange={setImage}
                  error={formError}
                  placeholder="Upload ingredient image (optional)"
                />
              </div>
            </div>

            {/* Right column: Recipe */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#FFC107]">
                    Recipe (Raw Materials) - Optional
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUnitConversion(true)}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <Calculator className="w-3 h-3 mr-1" />
                    Converter
                  </Button>
                </div>
                <p className="text-sm text-[#BDBDBD]">
                  Define the raw materials needed to create this ingredient
                  (leave empty for basic ingredients like ice, water, etc.)
                </p>

                {recipe.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 w-full sm:items-center bg-[#232323] rounded-lg p-2 border border-[#333]"
                  >
                    <CustomSelect
                      value={item.rawMaterialId}
                      onChange={(val) =>
                        handleRecipeChange(idx, "rawMaterialId", val)
                      }
                      options={
                        loadingRawMaterials
                          ? []
                          : rawMaterials?.map((rm) => ({
                              value: rm._id,
                              label: `${rm.productName} (${rm.stock} ${rm.unit})`,
                            })) || []
                      }
                      placeholder="Select raw material"
                      name={`recipe-rawMaterialId-${idx}`}
                      variant="dark"
                      disabled={showSaving || loadingRawMaterials}
                      className="flex-1 w-full"
                    />
                    <FormInput
                      value={item.quantity}
                      onChange={(e) =>
                        handleRecipeChange(idx, "quantity", e.target.value)
                      }
                      placeholder="Qty"
                      name={`recipe-quantity-${idx}`}
                      type="number"
                      variant="dark"
                      className="w-full sm:w-[120px] text-white"
                    />
                    <FormInput
                      value={item.unit}
                      readOnly
                      placeholder="Unit"
                      name={`recipe-unit-${idx}`}
                      variant="dark"
                      className="w-full sm:w-[100px] text-white"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveRecipe(idx)}
                      disabled={recipe.length === 1}
                      aria-label="Remove recipe item"
                      className="rounded-full w-8 h-8 flex items-center justify-center sm:self-auto self-end"
                    >
                      <Minus className="w-5 h-5 text-white" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="yellow"
                  size="lg"
                  onClick={handleAddRecipe}
                  aria-label="Add recipe item"
                  className="mt-2 w-full flex items-center justify-center gap-2"
                  disabled={showSaving}
                >
                  <Plus className="w-5 h-5" />
                  Add Recipe Item
                </Button>
              </div>
            </div>

            {formError && (
              <div className="text-red-500 text-sm col-span-1 md:col-span-2">
                {formError}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-2 mt-2 col-span-1 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/admin/ingredients")}
                className="w-full md:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="yellow"
                size="lg"
                loading={showSaving}
                disabled={showSaving}
                className="w-full md:w-auto md:ml-auto"
              >
                {showSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Form>
      </PageLayout>

      <UnitConversionModal
        isOpen={showUnitConversion}
        onClose={() => setShowUnitConversion(false)}
      />
    </AdminLayout>
  );
}
