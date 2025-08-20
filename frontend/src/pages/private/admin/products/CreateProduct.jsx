import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  productAPI,
  categoryAPI,
  addonsAPI,
  ingredientsAPI,
} from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import Form from "@/components/custom/Form";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import ImageUpload from "@/components/custom/ImageUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Calculator } from "lucide-react";
import UnitConversionModal from "@/components/custom/UnitConversionModal";

export default function CreateProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [addOns, setAddOns] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [preparationTime, setPreparationTime] = useState("");
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [ingredients, setIngredients] = useState([
    { ingredientId: "", quantity: "", unit: "" },
  ]);
  const [image, setImage] = useState("");
  const [sizes, setSizes] = useState([{ label: "", price: "" }]);
  const [formError, setFormError] = useState("");
  const [showSaving, setShowSaving] = useState(false);
  const [hasSizes, setHasSizes] = useState(true);
  const [price, setPrice] = useState("");
  const [showUnitConversion, setShowUnitConversion] = useState(false);

  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryAPI.getAll();
      return res.data || res || [];
    },
  });
  const {
    data: addonsOptions,
    isLoading: loadingAddons,
    error: errorAddons,
  } = useQuery({
    queryKey: ["addons"],
    queryFn: async () => {
      const res = await addonsAPI.getAll();
      return res.data || res || [];
    },
  });
  const {
    data: ingredientsOptions,
    isLoading: loadingIngredients,
    error: errorIngredients,
  } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const res = await ingredientsAPI.getAll();
      return res.data || res || [];
    },
  });

  const { mutate } = useMutation({
    mutationFn: async (newProduct) => {
      return await productAPI.create(newProduct);
    },
    onSuccess: () => {
      setShowSaving(false);
      queryClient.invalidateQueries(["products"]);
      toast.success("Product created successfully!");
      navigate("/admin/products");
    },
    onError: (err) => {
      setShowSaving(false);
      let msg = "Failed to create product";
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

  // Handler to update an ingredient row
  const handleIngredientChange = (idx, field, value) => {
    setIngredients((ingredients) =>
      ingredients.map((ing, i) => {
        if (i === idx) {
          if (field === "ingredientId") {
            // Find unit from ingredientsOptions
            const found = ingredientsOptions?.find((opt) => opt._id === value);
            return { ...ing, ingredientId: value, unit: found?.unit || "" };
          }
          return { ...ing, [field]: value };
        }
        return ing;
      })
    );
  };
  // Handler to add a new ingredient row
  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { ingredientId: "", quantity: "", unit: "" },
    ]);
  };
  // Handler to remove an ingredient row
  const handleRemoveIngredient = (idx) => {
    setIngredients((ingredients) => ingredients.filter((_, i) => i !== idx));
  };

  const handleSizeChange = (idx, field, value) => {
    setSizes((sizes) =>
      sizes.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };
  const handleAddSize = () => {
    setSizes([...sizes, { label: "", price: "" }]);
  };
  const handleRemoveSize = (idx) => {
    setSizes((sizes) => sizes.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!category) return setFormError("Category is required");
    if (!productName.trim()) return setFormError("Product name is required");
    if (!description.trim()) return setFormError("Description is required");
    if (hasSizes) {
      if (
        !sizes.length ||
        sizes.some((s) => !s.label || !s.price || isNaN(s.price))
      )
        return setFormError("All sizes must have a label and price");
    } else {
      if (!price || isNaN(price)) return setFormError("Price is required");
    }
    if (!preparationTime || isNaN(preparationTime))
      return setFormError("Preparation time is required");
    if (
      !ingredients.length ||
      ingredients.some(
        (ing) => !ing.ingredientId || !ing.quantity || isNaN(ing.quantity)
      )
    ) {
      return setFormError("All ingredients must have a name and quantity");
    }
    const addOnsToSend = isCustomizable ? addOns.filter((a) => a) : [];
    setShowSaving(true);
    mutate({
      category,
      productName,
      description,
      addOns: addOnsToSend,
      isAvailable,
      preparationTime: Number(preparationTime),
      isCustomizable,
      ingredients: ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        quantity: Number(ing.quantity),
        unit: ing.unit,
      })),
      image,
      ...(hasSizes
        ? {
            sizes: sizes.map((s) => ({
              label: s.label,
              price: Number(s.price),
            })),
            price: undefined,
          }
        : { price: Number(price), sizes: [] }),
    });
  };

  // Remove loading state and show form immediately, disabling selects/inputs if data is not loaded
  const categoriesLoaded =
    !!categories && !loadingCategories && !errorCategories;
  const addonsLoaded = !!addonsOptions && !loadingAddons && !errorAddons;
  const ingredientsLoaded =
    !!ingredientsOptions && !loadingIngredients && !errorIngredients;

  // Ensure addOns is always at least one item
  if (addOns.length === 0) setAddOns([""]);

  const sizeOptions = [
    { value: "Small", label: "Small" },
    { value: "Medium", label: "Medium" },
    { value: "Large", label: "Large" },
    { value: "Extra Large", label: "Extra Large" },
  ];

  // Helper to get available size options for a given index
  const getAvailableSizeOptions = (idx) => {
    const selectedLabels = sizes.map((s, i) => (i === idx ? null : s.label));
    return sizeOptions.filter((opt) => !selectedLabels.includes(opt.value));
  };

  return (
    <AdminLayout>
      <PageLayout title="Create Product" description="Add a new product.">
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full bg-[#181818] p-8 rounded-2xl border border-[#232323] shadow-lg">
            {/* Product Information Section */}
            <div className="col-span-1 md:col-span-2">
              <h2 className="text-lg font-bold text-[#FFC107] mb-4">
                Product Information
              </h2>
            </div>
            {/* Left column: Product Information (Category, Product Name, Description, Preparation Time, Image) */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="category" className="font-bold text-[#FFC107]">
                  Category
                </label>
                <CustomSelect
                  id="category"
                  value={category}
                  onChange={setCategory}
                  options={
                    categoriesLoaded
                      ? categories.map((c) => ({
                          value: c._id,
                          label: c.category,
                        }))
                      : []
                  }
                  placeholder="Select a category (e.g. Beverage, Snack)"
                  name="category"
                  error={formError}
                  variant="dark"
                  disabled={!categoriesLoaded}
                />
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4 w-full">
                <div className="flex-1">
                  <FormInput
                    label={
                      <span className="font-bold text-[#FFC107]">
                        Product Name
                      </span>
                    }
                    name="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    error={formError}
                    variant="dark"
                    placeholder="e.g. Iced Coffee, Bagel, Sandwich"
                  />
                </div>
              </div>
              <FormInput
                label={
                  <span className="font-bold text-[#FFC107]">Description</span>
                }
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="Enter a short product description"
              />
              <FormInput
                label={
                  <span className="font-bold text-[#FFC107]">
                    Preparation Time (minutes)
                  </span>
                }
                name="preparationTime"
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                error={formError}
                variant="dark"
                placeholder="e.g. 5"
              />
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#FFC107]">Image</label>
                <ImageUpload
                  label=""
                  value={image}
                  onChange={setImage}
                  error={formError}
                  placeholder="Upload product image (optional)"
                />
              </div>
            </div>
            {/* Right column: Has Sizes, Add-ons (array), Customizable, Ingredients */}
            <div className="flex flex-col gap-4">
              {/* Has Sizes and Price/Sizes input */}
              <div className="flex flex-col gap-2 mb-2">
                <label className="font-bold text-[#FFC107] flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={hasSizes}
                    onChange={(e) => setHasSizes(e.target.checked)}
                    className="accent-[#FFC107] w-4 h-4"
                  />
                  Has Sizes?
                </label>
                {hasSizes ? (
                  <div className="flex flex-col gap-1 min-w-[220px]">
                    <label className="font-bold text-[#FFC107]">
                      Sizes & Prices
                    </label>
                    {sizes.map((size, idx) => (
                      <div
                        key={idx}
                        className="flex flex-row gap-2 items-center"
                      >
                        <CustomSelect
                          value={size.label}
                          onChange={(val) =>
                            handleSizeChange(idx, "label", val)
                          }
                          options={getAvailableSizeOptions(idx)}
                          placeholder="Select size (e.g. Small)"
                          name={`size-label-${idx}`}
                          variant="dark"
                          className="flex-1"
                        />
                        <FormInput
                          value={size.price}
                          onChange={(e) =>
                            handleSizeChange(idx, "price", e.target.value)
                          }
                          placeholder="Price (e.g. 120)"
                          name={`size-price-${idx}`}
                          type="number"
                          min={0}
                          variant="dark"
                          className="w-[120px] text-white"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveSize(idx)}
                          disabled={sizes.length === 1}
                          aria-label="Remove size"
                          className="rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          <Minus className="w-5 h-5 text-white" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="yellow"
                      size="lg"
                      onClick={handleAddSize}
                      aria-label="Add size"
                      className="mt-2 w-full flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Size
                    </Button>
                  </div>
                ) : (
                  <FormInput
                    name="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    error={formError}
                    variant="dark"
                    placeholder="e.g. 120"
                    type="number"
                    min={0}
                    className="min-w-[180px] text-white"
                  />
                )}
              </div>
              {/* Add-ons & Customizable */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#FFC107]">
                  Add-ons & Customizable
                </label>
                <div className="flex gap-2 items-center mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isCustomizable}
                      onCheckedChange={(val) => {
                        setIsCustomizable(val);
                        if (!val) {
                          setAddOns([""]); // Remove all add-ons when unchecked
                        } else if (addOns.length === 0) {
                          setAddOns([""]); // Ensure at least one add-on select when checked
                        }
                      }}
                      id="isCustomizable"
                      className="w-5 h-5 border-2 border-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-black"
                    />
                    <span
                      htmlFor="isCustomizable"
                      className="text-sm font-bold text-white"
                    >
                      Customizable
                    </span>
                  </label>
                </div>
                {/* Add-ons array */}
                {addOns.map((addon, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 w-full sm:items-center"
                  >
                    <CustomSelect
                      value={addon}
                      onChange={(val) =>
                        setAddOns((addOns) =>
                          addOns.map((a, i) => (i === idx ? val : a))
                        )
                      }
                      options={
                        addonsLoaded
                          ? addonsOptions.map((a) => ({
                              value: a._id,
                              label: a.name,
                            }))
                          : []
                      }
                      placeholder={
                        <span className="text-[#FFC107]">
                          Select add-ons (e.g. Extra Cheese, Syrup)
                        </span>
                      }
                      name={`addOns-${idx}`}
                      error={formError}
                      disabled={!isCustomizable || !addonsLoaded}
                      variant="dark"
                      className="flex-1 w-full"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        setAddOns((addOns) =>
                          addOns.filter((_, i) => i !== idx)
                        )
                      }
                      disabled={addOns.length === 1}
                      aria-label="Remove add-on"
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
                  onClick={() => setAddOns([...addOns, ""])}
                  aria-label="Add add-on"
                  className="mt-2 w-full flex items-center justify-center gap-2"
                  disabled={!isCustomizable}
                >
                  <Plus className="w-5 h-5" />
                  Add Add-on
                </Button>
              </div>
              {/* Ingredients */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#FFC107]">
                    Ingredients
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
                {ingredients.map((ing, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-2 w-full sm:items-center bg-[#232323] rounded-lg p-2 border border-[#333]"
                  >
                    <CustomSelect
                      value={ing.ingredientId}
                      onChange={(val) =>
                        handleIngredientChange(idx, "ingredientId", val)
                      }
                      options={
                        ingredientsLoaded
                          ? ingredientsOptions.map((i) => ({
                              value: i._id,
                              label: `${i.ingredientName} (${i.stock} ${i.unit})`,
                            }))
                          : []
                      }
                      placeholder="Select ingredient (e.g. Coffee Extract)"
                      name={`ingredient-ingredientId-${idx}`}
                      variant="dark"
                      disabled={!ingredientsLoaded}
                      className="flex-1 w-full"
                    />
                    <FormInput
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(idx, "quantity", e.target.value)
                      }
                      placeholder="Qty (e.g. 2)"
                      name={`ingredient-quantity-${idx}`}
                      type="number"
                      variant="dark"
                      className="w-full sm:w-[200px] text-white"
                    />
                    <FormInput
                      value={ing.unit}
                      readOnly
                      placeholder="Unit"
                      name={`ingredient-unit-${idx}`}
                      variant="dark"
                      className="w-full sm:w-[100px] text-white"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveIngredient(idx)}
                      disabled={ingredients.length === 1}
                      aria-label="Remove ingredient"
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
                  onClick={handleAddIngredient}
                  aria-label="Add ingredient"
                  className="mt-2 w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Ingredient
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
                onClick={() => navigate("/admin/products")}
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
                {showSaving ? "Adding..." : "Add Product"}
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
