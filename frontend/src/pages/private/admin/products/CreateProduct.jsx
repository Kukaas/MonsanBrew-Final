import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, categoryAPI, addonsAPI, rawMaterialsAPI } from "@/services/api";
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
import { Plus, Minus } from 'lucide-react';

export default function CreateProduct() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState("");
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [addOns, setAddOns] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);
    const [preparationTime, setPreparationTime] = useState("");
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [ingredients, setIngredients] = useState([{ productName: '', quantity: '' }]);
    const [image, setImage] = useState("");
    const [size, setSize] = useState("");
    const [formError, setFormError] = useState("");
    const [showSaving, setShowSaving] = useState(false);

    const { data: categories, isLoading: loadingCategories, error: errorCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await categoryAPI.getAll();
            return res.data || res || [];
        }
    });
    const { data: addonsOptions, isLoading: loadingAddons, error: errorAddons } = useQuery({
        queryKey: ['addons'],
        queryFn: async () => {
            const res = await addonsAPI.getAll();
            return res.data || res || [];
        }
    });
    const { data: ingredientsOptions, isLoading: loadingIngredients, error: errorIngredients } = useQuery({
        queryKey: ['raw-materials'],
        queryFn: async () => {
            const res = await rawMaterialsAPI.getAll();
            return res.data || res || [];
        }
    });

    const { mutate } = useMutation({
        mutationFn: async (newProduct) => {
            return await productAPI.create(newProduct);
        },
        onSuccess: () => {
            setShowSaving(false);
            queryClient.invalidateQueries(['products']);
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
            } else if (typeof err === 'string') {
                msg = err;
            }
            setFormError(msg);
            toast.error(msg);
        }
    });

    // Handler to update an ingredient row
    const handleIngredientChange = (idx, field, value) => {
        setIngredients(ingredients => ingredients.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing));
    };
    // Handler to add a new ingredient row
    const handleAddIngredient = () => {
        setIngredients([...ingredients, { productName: '', quantity: '' }]);
    };
    // Handler to remove an ingredient row
    const handleRemoveIngredient = (idx) => {
        setIngredients(ingredients => ingredients.filter((_, i) => i !== idx));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormError("");
        if (!category) return setFormError("Category is required");
        if (!productName.trim()) return setFormError("Product name is required");
        if (!description.trim()) return setFormError("Description is required");
        if (!price || isNaN(price)) return setFormError("Valid price is required");
        if (!preparationTime || isNaN(preparationTime)) return setFormError("Preparation time is required");
        // Validate ingredients
        if (!ingredients.length || ingredients.some(ing => !ing.productName || !ing.quantity || isNaN(ing.quantity))) {
            return setFormError("All ingredients must have a name and quantity");
        }
        // If not customizable, ensure addOns is an empty array
        const addOnsToSend = isCustomizable ? addOns.filter(a => a) : [];
        setShowSaving(true);
        mutate({
            category,
            productName,
            description,
            price: Number(price),
            addOns: addOnsToSend,
            isAvailable,
            preparationTime: Number(preparationTime),
            isCustomizable,
            ingredients: ingredients.map(ing => ({ productName: ing.productName, quantity: Number(ing.quantity) })),
            image,
            size: size || undefined
        });
    };

    // Remove loading state and show form immediately, disabling selects/inputs if data is not loaded
    const categoriesLoaded = !!categories && !loadingCategories && !errorCategories;
    const addonsLoaded = !!addonsOptions && !loadingAddons && !errorAddons;
    const ingredientsLoaded = !!ingredientsOptions && !loadingIngredients && !errorIngredients;

    // Ensure addOns is always at least one item
    if (addOns.length === 0) setAddOns(['']);

    return (
        <AdminLayout>
            <PageLayout title="Create Product" description="Add a new product.">
                <Form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full bg-[#181818] p-8 rounded-2xl border border-[#232323] shadow-lg">
                        {/* Product Information Section */}
                        <div className="col-span-1 md:col-span-2">
                            <h2 className="text-lg font-bold text-[#FFC107] mb-4">Product Information</h2>
                        </div>
                        {/* Left column: Product Information (Category, Product Name, Description, Price, Preparation Time, Image, Size) */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="category" className="font-bold text-[#FFC107]">Category</label>
                                <CustomSelect
                                    id="category"
                                    value={category}
                                    onChange={setCategory}
                                    options={categoriesLoaded ? categories.map(c => ({ value: c._id, label: c.category })) : []}
                                    placeholder="Select a category (e.g. Beverage, Snack)"
                                    name="category"
                                    error={formError}
                                    variant="dark"
                                    disabled={!categoriesLoaded}
                                />
                            </div>
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Product Name</span>}
                                name="productName"
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="e.g. Iced Coffee, Bagel, Sandwich"
                            />
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Description</span>}
                                name="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="Enter a short product description"
                            />
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Price</span>}
                                name="price"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="e.g. 120"
                            />
                            <FormInput
                                label={<span className="font-bold text-[#FFC107]">Preparation Time (minutes)</span>}
                                name="preparationTime"
                                type="number"
                                value={preparationTime}
                                onChange={e => setPreparationTime(e.target.value)}
                                error={formError}
                                variant="dark"
                                placeholder="e.g. 5"
                            />
                            <CustomSelect
                                label={<span className="font-bold text-[#FFC107]">Size <span className="text-gray-400 font-normal">(optional)</span></span>}
                                name="size"
                                value={size}
                                onChange={setSize}
                                options={[
                                    { value: 'Small', label: 'Small' },
                                    { value: 'Medium', label: 'Medium' },
                                    { value: 'Large', label: 'Large' },
                                    { value: 'Extra Large', label: 'Extra Large' }
                                ]}
                                error={formError}
                                variant="dark"
                                placeholder="Select size (optional)"
                                isClearable={true}
                            />
                            <div className="flex flex-col gap-1">
                                <label className="font-bold text-[#FFC107]">Image</label>
                                <ImageUpload label="" value={image} onChange={setImage} error={formError} placeholder="Upload product image (optional)" />
                            </div>
                        </div>
                        {/* Right column: Add-ons (array), Customizable, Ingredients */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="font-bold text-[#FFC107]">Add-ons & Customizable</label>
                                <div className="flex gap-2 items-center mb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <Checkbox checked={isCustomizable} onCheckedChange={val => {
                                            setIsCustomizable(val);
                                            if (!val) {
                                                setAddOns(['']); // Remove all add-ons when unchecked
                                            } else if (addOns.length === 0) {
                                                setAddOns(['']); // Ensure at least one add-on select when checked
                                            }
                                        }} id="isCustomizable" className="w-5 h-5 border-2 border-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-black" />
                                        <span htmlFor="isCustomizable" className="text-sm font-bold text-white">Customizable</span>
                                    </label>
                                </div>
                                {/* Add-ons array */}
                                {addOns.map((addon, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <CustomSelect
                                            value={addon}
                                            onChange={val => setAddOns(addOns => addOns.map((a, i) => i === idx ? val : a))}
                                            options={addonsLoaded ? addonsOptions.map(a => ({ value: a._id, label: a.name })) : []}
                                            placeholder={<span className="text-[#FFC107]">Select add-ons (e.g. Extra Cheese, Syrup)</span>}
                                            name={`addOns-${idx}`}
                                            error={formError}
                                            disabled={!isCustomizable || !addonsLoaded}
                                            variant="dark"
                                            style={{ minWidth: 180, width: 220 }}
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => setAddOns(addOns => addOns.filter((_, i) => i !== idx))} disabled={addOns.length === 1} aria-label="Remove add-on" className="rounded-full w-8 h-8 flex items-center justify-center">
                                            <Minus className="w-5 h-5 text-white" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="yellow" size="lg" onClick={() => setAddOns([...addOns, ''])} aria-label="Add add-on" className="mt-2 w-full flex items-center justify-center gap-2" disabled={!isCustomizable}>
                                    <Plus className="w-5 h-5" />
                                    Add Add-on
                                </Button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="font-bold text-[#FFC107]">Ingredients</label>
                                {ingredients.map((ing, idx) => (
                                    <div key={idx} className="flex gap-2 items-center bg-[#232323] rounded-lg p-2 border border-[#333] w-full">
                                        <CustomSelect
                                            value={ing.productName}
                                            onChange={val => handleIngredientChange(idx, 'productName', val)}
                                            options={ingredientsLoaded ? ingredientsOptions.map(i => ({ value: i.productName, label: i.productName })) : []}
                                            placeholder="Select ingredient (e.g. Coffee Beans)"
                                            name={`ingredient-productName-${idx}`}
                                            variant="dark"
                                            disabled={!ingredientsLoaded}
                                            className="flex-1"
                                        />
                                        <FormInput
                                            value={ing.quantity}
                                            onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                                            placeholder="Qty (e.g. 2)"
                                            name={`ingredient-quantity-${idx}`}
                                            type="number"
                                            min={0}
                                            variant="dark"
                                            style={{ width: 200 }}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveIngredient(idx)} disabled={ingredients.length === 1} aria-label="Remove ingredient" className="rounded-full w-8 h-8 flex items-center justify-center">
                                            <Minus className="w-5 h-5 text-white" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="yellow" size="lg" onClick={handleAddIngredient} aria-label="Add ingredient" className="mt-2 w-full flex items-center justify-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add Ingredient
                                </Button>
                            </div>
                        </div>
                        {formError && <div className="text-red-500 text-sm col-span-1 md:col-span-2">{formError}</div>}
                        <div className="flex flex-col md:flex-row gap-2 mt-2 col-span-1 md:col-span-2">
                            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/products')} className="w-full md:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" variant="yellow" size="lg" loading={showSaving} disabled={showSaving} className="w-full md:w-auto md:ml-auto">
                                {showSaving ? "Adding..." : "Add Product"}
                            </Button>
                        </div>
                    </div>
                </Form>
            </PageLayout>
        </AdminLayout>
    );
}
