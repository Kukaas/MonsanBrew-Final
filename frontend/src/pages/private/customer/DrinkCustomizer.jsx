import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dndAPI, cartAPI } from "@/services/api";
import CustomerLayout from "@/layouts/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DrinkCustomizer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropZoneRef = useRef(null);

  // State for selected ingredients
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showBlendPreview, setShowBlendPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSize, setSelectedSize] = useState("Medium");

  // Size options with pricing
  const sizeOptions = [
    { name: "Small", price: 10 },
    { name: "Medium", price: 20 },
    { name: "Large", price: 25 },
    { name: "Extra Large", price: 35 }
  ];

  // Fetch DnD ingredients
  const { data: ingredients, isLoading: ingredientsLoading } = useQuery({
    queryKey: ["dnd-ingredients"],
    queryFn: async () => {
      const res = await dndAPI.getIngredients();
      return res.data || res || [];
    },
  });

  // Fetch DnD previews
  const { data: previews, isLoading: previewsLoading } = useQuery({
    queryKey: ["dnd-previews"],
    queryFn: async () => {
      const res = await dndAPI.getPreviews();
      return res.data || res || [];
    },
  });

  // Add to cart mutation
  const { mutate: addToCart, isPending: addingToCart } = useMutation({
    mutationFn: async (customDrink) => {
      return cartAPI.addCustomDrinkToCart(user._id, customDrink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["cart", user._id]);
      toast.success("Custom drink added to cart!");
      navigate(`/cart?user=${user._id}`);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    },
  });

  // Drag and drop handlers
  const handleDragStart = (e, ingredient) => {
    setIsDragging(true);
    e.dataTransfer.setData("application/json", JSON.stringify(ingredient));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const ingredientData = JSON.parse(e.dataTransfer.getData("application/json"));
      addIngredient(ingredientData);
    } catch (error) {
      console.error("Error parsing dropped data:", error);
    }
  };

  // Ingredient management
  const addIngredient = (ingredient) => {
    const existingIngredient = selectedIngredients.find(ing => ing._id === ingredient._id);
    if (existingIngredient) {
      setSelectedIngredients(selectedIngredients.map(ing =>
        ing._id === ingredient._id
          ? { ...ing, quantity: ing.quantity + 1 }
          : ing
      ));
    } else {
      setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: 1 }]);
    }
    toast.success(`${ingredient.name} added!`);
  };

  // Check if ingredient should be hidden from draggable items
  const shouldHideIngredient = (ingredient) => {
    const ingredientCategory = ingredient.category?.toLowerCase();
    const ingredientName = ingredient.name.toLowerCase();

    // Check if any ingredient from the same category is selected
    const hasCategorySelected = selectedIngredients.some(selectedIng => {
      const selectedCategory = selectedIng.category?.toLowerCase();
      const selectedName = selectedIng.name.toLowerCase();

      // For powder ingredients - hide all powders if any powder is selected
      // Since powder ingredients are categorized as "flavor" but have "powder" in their name
      if ((ingredientName.includes('powder') && selectedName.includes('powder')) ||
        (ingredientCategory === 'powder' && selectedCategory === 'powder')) {
        return true;
      }

      return false;
    });

    return hasCategorySelected;
  };

  const handleIngredientClick = (ingredient) => {
    // Only add on click if not dragging
    if (!isDragging) {
      addIngredient(ingredient);
    }
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(ing => ing._id !== ingredientId));
  };

  const updateQuantity = (ingredientId, quantity) => {
    if (quantity <= 0) {
      removeIngredient(ingredientId);
    } else {
      setSelectedIngredients(selectedIngredients.map(ing =>
        ing._id === ingredientId
          ? { ...ing, quantity: Number(quantity) }
          : ing
      ));
    }
  };

  const resetCustomizer = () => {
    setSelectedIngredients([]);
    setShowBlendPreview(false);
    setSelectedSize("Medium");
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    const ingredientsTotal = selectedIngredients.reduce((total, ing) => total + (ing.price * ing.quantity), 0);
    const currentSize = sizeOptions.find(size => size.name === selectedSize);
    const sizePrice = currentSize?.price || 0;

    return ingredientsTotal + sizePrice;
  };

  // Generate drink name - more minimal
  const generateDrinkName = () => {
    if (selectedIngredients.length === 0) return "Custom Drink";

    // If more than 3 ingredients, show count instead of full list
    if (selectedIngredients.length > 3) {
      return `Custom Mix (${selectedIngredients.length} ingredients)`;
    }

    // For 3 or fewer ingredients, show abbreviated names
    return selectedIngredients.map(ing => {
      const shortName = ing.name.split(' ')[0]; // Take first word only
      return ing.quantity > 1 ? `${shortName} x${ing.quantity}` : shortName;
    }).join(" + ");
  };

  // Find matching preview - more flexible matching
  const findMatchingPreview = () => {
    if (!previews || selectedIngredients.length === 0) return null;


    // First try exact match
    const exactMatch = previews.find(preview => {
      if (!preview.ingredients || preview.ingredients.length !== selectedIngredients.length) {
        return false;
      }

      return preview.ingredients.every(previewIng => {
        // Handle both populated and non-populated ingredientId
        const ingredientId = typeof previewIng.ingredientId === 'object'
          ? previewIng.ingredientId._id
          : previewIng.ingredientId;
        const selectedIng = selectedIngredients.find(sel => sel._id === ingredientId);
        return selectedIng && selectedIng.quantity === previewIng.quantity;
      });
    });

    if (exactMatch) return exactMatch;

    // If no exact match, try partial match (same ingredients but different quantities)
    const partialMatch = previews.find(preview => {
      if (!preview.ingredients || preview.ingredients.length !== selectedIngredients.length) {
        return false;
      }

      return preview.ingredients.every(previewIng => {
        // Handle both populated and non-populated ingredientId
        const ingredientId = typeof previewIng.ingredientId === 'object'
          ? previewIng.ingredientId._id
          : previewIng.ingredientId;
        const selectedIng = selectedIngredients.find(sel => sel._id === ingredientId);
        return selectedIng; // Just check if ingredient exists, ignore quantity
      });
    });

    if (partialMatch) return partialMatch;

    // Special case: Look for specific preview ID for Caramel + Strawberry Jam
    const hasCaramel = selectedIngredients.some(ing =>
      ing.name.toLowerCase().includes('caramel') || ing.name.toLowerCase().includes('caramel powder')
    );
    const hasStrawberry = selectedIngredients.some(ing =>
      ing.name.toLowerCase().includes('strawberry') || ing.name.toLowerCase().includes('jam')
    );

    if (hasCaramel && hasStrawberry) {
      // Look for the specific preview ID for Caramel + Strawberry Jam
      const caramelStrawberryPreview = previews.find(preview =>
        preview._id === '68e33717a4a335e157486b50'
      );
      if (caramelStrawberryPreview) return caramelStrawberryPreview;
    }

    return null;
  };

  const matchingPreview = findMatchingPreview();

  // Handle blend button click
  const handleBlendClick = () => {
    if (matchingPreview && matchingPreview.blendImage) {
      setShowBlendPreview(!showBlendPreview);
    } else {
      toast.error("No blend preview available for this combination");
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (selectedIngredients.length === 0) {
      toast.error("Please add some ingredients first!");
      return;
    }

    const customDrink = {
      name: generateDrinkName(),
      totalPrice: calculateTotalPrice(),
      ingredients: selectedIngredients,
      size: selectedSize,
      previewImage: matchingPreview?.blendImage || null, // Use blendImage (finished product) for cart display
      blendImage: matchingPreview?.blendImage || null,
    };

    addToCart(customDrink);
  };

  if (ingredientsLoading || previewsLoading) {
    return (
      <CustomerLayout>
        <div className="bg-gradient-to-br from-[#1a1a1a] via-[#232323] to-[#2a2a2a] min-h-screen w-full flex flex-col">
          {/* Header Skeleton */}
          <div className="w-full px-4 py-8">
            <div className="max-w-6xl mx-auto text-center">
              <Skeleton className="h-12 w-80 mx-auto mb-3 bg-white/20" />
              <Skeleton className="h-6 w-96 mx-auto bg-white/10" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1 w-full px-4 pb-24 md:pb-8">
            <div className="max-w-6xl mx-auto">
              <div className="hidden lg:grid lg:grid-cols-3 gap-8">
                {/* Ingredients Panel Skeleton */}
                <div className="lg:col-span-2">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <Skeleton className="h-8 w-48 mb-6 bg-white/20" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg p-4">
                          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-200" />
                          <Skeleton className="h-4 w-20 mx-auto mb-1 bg-gray-200" />
                          <Skeleton className="h-3 w-12 mx-auto mb-1 bg-gray-200" />
                          <Skeleton className="h-3 w-16 mx-auto bg-gray-200" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Customizer Panel Skeleton */}
                <div className="space-y-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <Skeleton className="h-6 w-32 mb-6 bg-gray-200" />
                    <Skeleton className="h-48 w-full rounded-xl bg-gray-200" />
                  </div>
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                    <Skeleton className="h-6 w-24 mb-4 bg-gray-200" />
                    <Skeleton className="h-32 w-full rounded-xl bg-gray-200" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                    <Skeleton className="h-12 w-full rounded-xl bg-gray-200" />
                  </div>
                </div>
              </div>

              {/* Mobile Layout Skeleton */}
              <div className="lg:hidden space-y-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <Skeleton className="h-6 w-32 mb-4 bg-gray-200" />
                  <Skeleton className="h-32 w-full rounded-lg bg-gray-200" />
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <Skeleton className="h-6 w-24 mb-4 bg-gray-200" />
                  <Skeleton className="h-32 w-full rounded-lg bg-gray-200" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-lg bg-gray-200" />
                  <Skeleton className="h-12 w-full rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="bg-gradient-to-br from-[#1a1a1a] via-[#232323] to-[#2a2a2a] min-h-screen w-full flex flex-col">
        {/* Header */}
        <div className="w-full px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-[#FFC107] to-[#FFB300] bg-clip-text text-transparent">
              <h1 className="text-3xl md:text-5xl font-black mb-3">Custom Drink Creator</h1>
            </div>
            <p className="text-[#BDBDBD] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Craft your perfect drink by mixing ingredients. Drag, drop, and blend your way to deliciousness!
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-4 pb-32 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:block">
              {/* Customizer Panel - Desktop - Full Width */}
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Drop Zone */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Your Custom Drink</h2>
                  </div>
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`min-h-64 border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragOver
                      ? "border-[#FFC107] bg-gradient-to-br from-yellow-50 to-yellow-100 scale-105"
                      : "border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-[#FFC107]/50"
                      }`}
                  >
                    {selectedIngredients.length === 0 ? (
                      <div className="text-gray-500 flex flex-col items-center justify-center h-full">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">🍹</span>
                        </div>
                        <p className="text-lg font-semibold mb-2">Drop ingredients here!</p>
                        <p className="text-sm">Drag ingredients from the left panel</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedIngredients.map((ingredient) => (
                          <div key={ingredient._id} className="flex items-center justify-between bg-white rounded-xl p-3 shadow-md border border-gray-200">
                            <div className="flex items-center gap-3">
                              <img
                                src={ingredient.image}
                                alt={ingredient.name}
                                className="w-8 h-8 object-cover rounded-full max-w-full"
                              />
                              <span className="font-semibold text-gray-900 text-sm">{ingredient.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                value={ingredient.quantity}
                                onChange={(e) => updateQuantity(ingredient._id, e.target.value)}
                                className="w-12 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm focus:border-[#FFC107] focus:ring-1 focus:ring-[#FFC107]"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeIngredient(ingredient._id)}
                                className="h-7 w-7 p-0 rounded-lg"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview Section - Desktop */}
                {selectedIngredients.length > 0 && (
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                    <div className="mb-8">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">Preview</h3>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {matchingPreview && matchingPreview.blendImage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBlendClick}
                            className="bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:from-[#FFB300] hover:to-[#FFA000] text-black border-[#FFC107] font-semibold"
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {showBlendPreview ? 'Hide' : 'Show'} Blend
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Show individual ingredient images */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Ingredients:</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {selectedIngredients.map((ingredient) => (
                          <div key={ingredient._id} className="text-center max-w-[80px]">
                            <img
                              src={ingredient.image}
                              alt={ingredient.name}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-[#FFC107] max-w-full"
                            />
                            <p className="text-xs text-gray-600 mt-1">
                              {ingredient.name} x{ingredient.quantity}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Show actual preview from database */}
                    {matchingPreview && (
                      <div className="text-center mb-6">
                        <img
                          src={matchingPreview.image}
                          alt="Preview"
                          className="w-48 h-48 object-contain rounded-lg mx-auto border-2 border-[#FFC107] max-w-full"
                        />
                        <p className="text-lg text-gray-600 mt-3 font-medium">
                          {matchingPreview.name}
                        </p>
                      </div>
                    )}

                    {/* Show blend preview when blend button is clicked */}
                    {showBlendPreview && matchingPreview && matchingPreview.blendImage && (
                      <div className="text-center mb-6">
                        <img
                          src={matchingPreview.blendImage}
                          alt="Blend Preview"
                          className="w-48 h-48 object-contain rounded-lg mx-auto border-2 border-[#FFC107] max-w-full"
                        />
                        <p className="text-lg text-gray-600 mt-3 font-medium">How your drink will look when blended</p>
                      </div>
                    )}

                    {/* Show message if no preview found */}
                    {!matchingPreview && (
                      <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          No preview available for this combination
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Try different ingredients or quantities
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Drink Name:</span>
                        <span className="text-[#FFC107] font-semibold">{generateDrinkName()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">Total Price:</span>
                        <span className="text-[#FFC107] font-semibold">₱{calculateTotalPrice().toFixed(2)}</span>
                      </div>
                      {matchingPreview && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Preview Match:</span>
                          <span className="text-green-600 font-semibold text-sm">✓ Found</span>
                        </div>
                      )}
                      {matchingPreview && matchingPreview.blendImage && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Blend Available:</span>
                          <span className="text-blue-600 font-semibold text-sm">✓ Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#232323]">Size</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {sizeOptions.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedSize === size.name
                          ? "border-[#FFC107] bg-[#FFC107]/20 text-[#FFC107] font-bold"
                          : "border-gray-300 bg-white hover:border-[#FFC107]/50 text-gray-800 hover:bg-gray-50"
                          }`}
                      >
                        <div className="text-base font-semibold">{size.name}</div>
                        <div className={`text-sm ${selectedSize === size.name ? "text-[#FFC107]/80" : "text-gray-600"
                          }`}>
                          +₱{size.price}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons - Desktop */}
                <div className="space-y-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={selectedIngredients.length === 0 || addingToCart}
                    className="w-full bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:from-[#FFB300] hover:to-[#FFA000] text-black font-bold h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    <ShoppingCart className="h-6 w-6 mr-2" />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={resetCustomizer}
                    className="w-full h-14 rounded-xl border-2 border-gray-300 hover:border-[#FFC107] hover:bg-[#FFC107]/10 transition-all duration-300 text-lg"
                  >
                    <RotateCcw className="h-6 w-6 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            {/* Floating Ingredients Panel - Desktop */}
            <div className="hidden lg:block fixed top-1/2 right-4 transform -translate-y-1/2 z-40">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20 max-w-xs">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Ingredients</h3>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Drag & Drop</div>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {ingredients?.filter(ingredient => !shouldHideIngredient(ingredient)).map((ingredient) => (
                    <div
                      key={ingredient._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ingredient)}
                      onDragEnd={handleDragEnd}
                      className="group bg-white rounded-xl shadow-md p-3 cursor-grab hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#FFC107] hover:-translate-y-1 active:cursor-grabbing"
                    >
                      <div className="text-center">
                        <div className="relative mb-2">
                          <img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className="w-12 h-12 object-cover rounded-full mx-auto border-2 border-[#FFC107] max-w-full group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#FFC107] to-[#FFB300] rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-bold">+</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 text-xs mb-1">{ingredient.name}</h4>
                        <p className="text-xs font-semibold text-[#FFC107]">₱{ingredient.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-6 pb-32">
              {/* Drop Zone - Mobile */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Your Custom Drink</h2>
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`min-h-40 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
                    ? "border-[#FFC107] bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                    }`}
                >
                  {selectedIngredients.length === 0 ? (
                    <div className="text-gray-500">
                      <p className="text-base mb-2">Drop ingredients here!</p>
                      <p className="text-sm">Tap ingredients from below</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedIngredients.map((ingredient) => (
                        <div key={ingredient._id} className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm">
                          <div className="flex items-center gap-2">
                            <img
                              src={ingredient.image}
                              alt={ingredient.name}
                              className="w-6 h-6 object-cover rounded-full flex-shrink-0"
                            />
                            <span className="font-medium text-gray-900 text-sm">{ingredient.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={ingredient.quantity}
                              onChange={(e) => updateQuantity(ingredient._id, e.target.value)}
                              className="w-10 px-1 py-1 text-center border rounded text-sm"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeIngredient(ingredient._id)}
                              className="h-5 w-5 p-0 text-xs"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Section - Mobile */}
              {selectedIngredients.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Preview</h3>
                    <div className="flex gap-2 flex-wrap">
                      {matchingPreview && matchingPreview.blendImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBlendClick}
                          className="bg-[#FFC107] hover:bg-[#FFB300] text-black border-[#FFC107] text-sm"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {showBlendPreview ? 'Hide' : 'Show'} Blend
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Show individual ingredient images */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Ingredients:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedIngredients.map((ingredient) => (
                        <div key={ingredient._id} className="text-center max-w-[70px]">
                          <img
                            src={ingredient.image}
                            alt={ingredient.name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-[#FFC107] max-w-full"
                          />
                          <p className="text-xs text-gray-600 mt-1">
                            {ingredient.name} x{ingredient.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show actual preview from database */}
                  {matchingPreview && (
                    <div className="text-center mb-6">
                      <img
                        src={matchingPreview.image}
                        alt="Preview"
                        className="w-36 h-36 object-contain rounded-lg mx-auto border-2 border-[#FFC107] max-w-full"
                      />
                      <p className="text-base text-gray-600 mt-3 font-medium">
                        {matchingPreview.name}
                      </p>
                    </div>
                  )}

                  {/* Show blend preview when blend button is clicked */}
                  {showBlendPreview && matchingPreview && matchingPreview.blendImage && (
                    <div className="text-center mb-6">
                      <img
                        src={matchingPreview.blendImage}
                        alt="Blend Preview"
                        className="w-36 h-36 object-contain rounded-lg mx-auto border-2 border-[#FFC107] max-w-full"
                      />
                      <p className="text-base text-gray-600 mt-3 font-medium">How your drink will look when blended</p>
                    </div>
                  )}

                  {/* Show message if no preview found */}
                  {!matchingPreview && (
                    <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        No preview available for this combination
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Try different ingredients or quantities
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 text-sm">Drink Name:</span>
                      <span className="text-[#FFC107] font-semibold text-sm">{generateDrinkName()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 text-sm">Total Price:</span>
                      <span className="text-[#FFC107] font-semibold text-sm">₱{calculateTotalPrice().toFixed(2)}</span>
                    </div>
                    {matchingPreview && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 text-sm">Preview Match:</span>
                        <span className="text-green-600 font-semibold text-xs">✓ Found</span>
                      </div>
                    )}
                    {matchingPreview && matchingPreview.blendImage && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900 text-sm">Blend Available:</span>
                        <span className="text-blue-600 font-semibold text-xs">✓ Available</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Size Selection - Mobile */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#232323]">Size</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sizeOptions.map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${selectedSize === size.name
                        ? "border-[#FFC107] bg-[#FFC107]/20 text-[#FFC107] font-bold"
                        : "border-gray-300 bg-white hover:border-[#FFC107]/50 text-gray-800 hover:bg-gray-50"
                        }`}
                    >
                      <div className="text-base font-semibold">{size.name}</div>
                      <div className={`text-sm ${selectedSize === size.name ? "text-[#FFC107]/80" : "text-gray-600"
                        }`}>
                        +₱{size.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={selectedIngredients.length === 0 || addingToCart}
                  className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-black font-bold h-14 text-lg"
                >
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </Button>

                <Button
                  variant="outline"
                  onClick={resetCustomizer}
                  className="w-full h-14 text-lg"
                >
                  <RotateCcw className="h-6 w-6 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Ingredients Panel - Mobile Only */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-base font-bold text-gray-900">Ingredients</h3>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Tap to add</div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
              {ingredients?.filter(ingredient => !shouldHideIngredient(ingredient)).map((ingredient) => (
                <div
                  key={ingredient._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ingredient)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleIngredientClick(ingredient)}
                  className="group bg-white rounded-lg shadow-md p-2 cursor-grab hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#FFC107] hover:-translate-y-1 active:cursor-grabbing"
                >
                  <div className="text-center">
                    <div className="relative mb-1">
                      <img
                        src={ingredient.image}
                        alt={ingredient.name}
                        className="w-10 h-10 object-cover rounded-full mx-auto border-2 border-[#FFC107] max-w-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#FFC107] to-[#FFB300] rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">+</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1 leading-tight">{ingredient.name}</h4>
                    <p className="text-xs font-semibold text-[#FFC107]">₱{ingredient.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
