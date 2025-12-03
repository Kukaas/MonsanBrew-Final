import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cartAPI } from "@/services/api";
import CustomerLayout from "@/layouts/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

function useQueryParams() {
  return new URLSearchParams(useLocation().search);
}

export default function Cart() {
  const { user, loading: authLoading } = useAuth();
  const query = useQueryParams();
  const userId = query.get("user");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch cart with TanStack Query
  const {
    data: cart = [],
    isLoading,
  } = useQuery({
    queryKey: ["cart", userId],
    queryFn: () =>
      cartAPI
        .getCart(userId)
        .then((res) =>
          res && Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : []
        ),
    enabled: !!userId,
  });

  // Group cart items by product, size, and addOns (order-insensitive)
  function groupCartItems(items) {
    const groups = {};
    items.forEach((item) => {
      // Create a unique key based on product, size, and sorted addOns
      const addOnsKey =
        Array.isArray(item.addOns) && item.addOns.length > 0
          ? item.addOns
            .map((a) => a.addonId || a._id || a.name)
            .sort()
            .join(",")
          : "";

      // For custom drinks, use customDrinkName and customIngredients for grouping
      let key;
      if (item.isCustomDrink) {
        const customIngredientsKey = Array.isArray(item.customIngredients) && item.customIngredients.length > 0
          ? item.customIngredients
            .map((ing) => ing.ingredientId || ing.name)
            .sort()
            .join(",")
          : "";
        key = `custom|${item.customDrinkName || item.productName}|${customIngredientsKey}|${item.customSize || item.size || ""}`;
      } else {
        key = `${item.product}|${item.size || ""}|${addOnsKey}`;
      }

      if (!groups[key]) {
        groups[key] = { ...item, quantity: 0, _originalIds: [] };
      }
      groups[key].quantity += item.quantity;
      groups[key]._originalIds.push(item._id);
    });
    return Object.values(groups);
  }

  const groupedCart = groupCartItems(cart);

  // Selection state for checkout
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Auto-select single item when cart has only 1 item
  useEffect(() => {
    if (groupedCart.length === 1) {
      const singleItemKey = getGroupKey(groupedCart[0]);
      if (!selectedKeys.includes(singleItemKey)) {
        setSelectedKeys([singleItemKey]);
      }
    }
  }, [groupedCart.length]);

  // Per-item loading state
  // loadingItem: { key: groupKey, action: 'inc' | 'dec' | 'del' } | null
  const [loadingItem, setLoadingItem] = useState(null);

  // Helper to get group key for a cart item (must match groupCartItems logic)
  function getGroupKey(item) {
    if (item.isCustomDrink) {
      const customIngredientsKey = Array.isArray(item.customIngredients) && item.customIngredients.length > 0
        ? item.customIngredients
          .map((ing) => ing.ingredientId || ing.name)
          .sort()
          .join(",")
        : "";
      return `custom|${item.customDrinkName || item.productName}|${customIngredientsKey}|${item.customSize || item.size || ""}`;
    } else {
      const addOnsKey = Array.isArray(item.addOns) && item.addOns.length > 0
        ? item.addOns
          .map((a) => a.addonId || a._id || a.name)
          .sort()
          .join(",")
        : "";
      return `${item.product}|${item.size || ""}|${addOnsKey}`;
    }
  }

  // Select all logic
  const allKeys = groupedCart.map(getGroupKey);
  const allSelected =
    allKeys.length > 0 && allKeys.every((key) => selectedKeys.includes(key));
  const toggleSelectAll = () => {
    setSelectedKeys(allSelected ? [] : allKeys);
  };
  const toggleSelectOne = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Mutations for cart updates
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ group, delta }) => {
      for (const id of group._originalIds) {
        const original = cart.find((item) => item._id === id);
        if (!original) continue;
        const newQty = original.quantity + delta;
        if (newQty > 0) {
          await cartAPI.updateCartItem(id, { quantity: newQty });
        } else {
          await cartAPI.removeFromCart(id);
        }
      }
    },
    onMutate: ({ group, delta }) => {
      setLoadingItem({
        key: getGroupKey(group),
        action: delta > 0 ? "inc" : "dec",
      });
    },
    onSettled: () => {
      setLoadingItem(null);
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (group) => {
      for (const id of group._originalIds) {
        await cartAPI.removeFromCart(id);
      }
    },
    onMutate: (group) => {
      setLoadingItem({ key: getGroupKey(group), action: "del" });
    },
    onSettled: () => {
      setLoadingItem(null);
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });

  // Handle quantity update
  const handleUpdateQuantity = (group, delta) => {
    updateQuantityMutation.mutate({ group, delta });
  };

  // Handle delete group
  const handleDeleteGroup = (group) => {
    deleteGroupMutation.mutate(group);
  };

  // Helper to calculate total price for a cart item (base + add-ons)
  function getItemUnitTotal(item) {
    if (item.isCustomDrink) {
      // For custom drinks, calculate from custom ingredients + size price
      const ingredientsTotal = Array.isArray(item.customIngredients)
        ? item.customIngredients.reduce((sum, ingredient) =>
          sum + (Number(ingredient.price) * Number(ingredient.quantity) || 0), 0)
        : 0;

      // Add size price based on custom size
      const sizePrice = getSizePrice(item.customSize || item.size);

      return ingredientsTotal + sizePrice;
    } else {
      // For regular products, calculate base + add-ons
      const base = Number(item.price) || 0;
      const addons = Array.isArray(item.addOns)
        ? item.addOns.reduce((sum, a) => sum + (Number(a.price) || 0), 0)
        : 0;
      return base + addons;
    }
  }

  // Helper function to get size price
  function getSizePrice(size) {
    const sizePrices = {
      "Small": 10,
      "Medium": 20,
      "Large": 25,
      "Extra Large": 35
    };
    return sizePrices[size] || 20; // Default to Medium price if size not found
  }

  // Only include selected items in totals
  const selectedCart = groupedCart.filter((item) =>
    selectedKeys.includes(getGroupKey(item))
  );
  const subtotal = selectedCart.reduce(
    (sum, item) => sum + getItemUnitTotal(item) * item.quantity,
    0
  );
  const discount = 0;
  const shipping = selectedCart.length > 0 ? 15 : 0;
  const total = subtotal - discount + shipping;

  // Minimum order requirement (excluding delivery fee)
  const MINIMUM_ORDER = 150;
  const meetsMinimum = subtotal >= MINIMUM_ORDER;

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-2">
          <h1 className="text-4xl font-extrabold text-center text-white mb-8">
            Cart
          </h1>
          <div className="flex flex-wrap gap-6 justify-center mb-8 w-full max-w-5xl">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow py-4 px-4 flex w-[320px] min-h-[140px] relative"
              >
                <Skeleton className="absolute top-3 left-3 w-5 h-5 rounded bg-gray-200" />
                <div className="flex flex-col items-center justify-center mr-4">
                  <Skeleton className="w-20 h-20 mb-2 rounded-xl bg-gray-200" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <Skeleton className="h-6 w-32 mb-2 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-20 mb-2 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-24 mb-2 bg-gray-200 rounded" />
                  <Skeleton className="h-6 w-16 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col items-center justify-center gap-2 ml-4">
                  <Skeleton className="w-8 h-8 rounded-full bg-gray-200 mb-1" />
                  <Skeleton className="h-4 w-6 bg-gray-200 rounded mb-1" />
                  <Skeleton className="w-8 h-8 rounded-full bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (!isLoading && cart.length === 0) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
          <h1 className="text-4xl font-extrabold text-center text-white mb-6">
            Cart
          </h1>

          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
            <ShoppingCart
              size={80}
              strokeWidth={2.5}
              className="mb-4"
              style={{
                color: "#FFC107",
                filter: "drop-shadow(0 0 8px #FFC10788)",
              }}
            />
            <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">
              Your cart is empty
            </div>
            <div className="text-gray-500 mb-6 text-center">
              Looks like you haven&apos;t added anything yet.
            </div>
            <Button
              variant="yellow"
              className="w-full text-lg font-bold py-3"
              onClick={() => navigate("/menus")}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-2">
        <h1 className="text-4xl font-extrabold text-center text-white mb-8">
          Cart
        </h1>
        {/* Cart Items */}
        <div className="flex flex-wrap gap-6 justify-center mb-8 w-full max-w-5xl">
          {/* Select All Checkbox - Only show when there are multiple items */}
          {groupedCart.length > 1 && (
            <div
              className="w-full flex items-center mb-4 px-2 gap-2 relative z-10"
              style={{ minHeight: 32 }}
            >
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                id="select-all-cart"
                className="w-5 h-5 border-2 border-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-black rounded"
              />
              <span
                className="text-sm text-[#FFC107] font-bold select-none cursor-pointer"
                style={{ userSelect: "none" }}
              >
                Select All
              </span>
            </div>
          )}
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#232323] rounded-2xl shadow p-4 flex flex-col items-center w-[320px] min-h-[140px]"
              >
                <Skeleton className="w-20 h-20 mb-2 rounded-xl bg-[#333]" />
                <Skeleton className="h-6 w-32 mb-2 bg-[#333]" />
                <Skeleton className="h-4 w-20 mb-2 bg-[#333]" />
                <Skeleton className="h-6 w-16 bg-[#333]" />
              </div>
            ))
            : groupedCart.map((item) => {
              const groupKey = getGroupKey(item);
              return (
                <div
                  key={groupKey}
                  className="bg-white rounded-2xl shadow py-4 px-4 flex w-[320px] min-h-[140px] relative"
                >
                  {/* Checkbox for selection - Hide when only 1 item */}
                  {groupedCart.length > 1 && (
                    <Checkbox
                      checked={selectedKeys.includes(groupKey)}
                      onCheckedChange={() => toggleSelectOne(groupKey)}
                      className="absolute top-3 left-3 w-5 h-5 border-2 border-[#FFC107] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107] data-[state=checked]:text-black rounded"
                      title="Select for checkout"
                    />
                  )}
                  {/* Left: Image and Info */}
                  <div className="flex flex-col items-center justify-center mr-4">
                    <img
                      src={item.isCustomDrink ? (item.customImage || item.image || "/placeholder.png") : (item.image || "/placeholder.png")}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-xl bg-white"
                    />
                  </div>
                  {/* Middle: Product Info */}
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="font-bold text-lg text-[#232323] truncate">
                      {item.productName}
                    </div>
                    {(item.size || (item.isCustomDrink && item.customSize)) && (
                      <div className="text-xs text-gray-500 font-semibold">
                        {item.isCustomDrink ? item.customSize : item.size}
                      </div>
                    )}

                    {/* Custom Drink Ingredients */}
                    {item.isCustomDrink && item.customIngredients && item.customIngredients.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-[#FFC107] font-bold">
                          Custom Ingredients:
                        </div>
                        <ul className="text-xs text-[#232323]">
                          {item.customIngredients.map((ingredient, idx) => (
                            <li
                              key={ingredient.ingredientId || idx}
                              className="flex justify-between"
                            >
                              <span>{ingredient.name} x{ingredient.quantity}</span>
                              <span>
                                ₱ {Number(ingredient.price * ingredient.quantity).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Regular Add-ons */}
                    {!item.isCustomDrink && item.addOns && item.addOns.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-[#FFC107] font-bold">
                          Add-ons:
                        </div>
                        <ul className="text-xs text-[#232323]">
                          {item.addOns.map((addon, idx) => (
                            <li
                              key={addon.addonId || addon._id || idx}
                              className="flex justify-between"
                            >
                              <span>{addon.name}</span>
                              <span>
                                ₱ {Number(addon.price).toLocaleString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-[#232323] text-base font-bold mt-2">
                      ₱{" "}
                      {(
                        getItemUnitTotal(item) * item.quantity
                      ).toLocaleString()}
                      <span className="block text-xs font-normal text-gray-400 mt-1">
                        {item.isCustomDrink ? (
                          <>
                            (₱ {Array.isArray(item.customIngredients)
                              ? item.customIngredients.reduce((sum, ing) => sum + (Number(ing.price) * Number(ing.quantity) || 0), 0).toLocaleString()
                              : 0} ingredients + ₱ {getSizePrice(item.customSize || item.size).toLocaleString()} size) × {item.quantity}
                          </>
                        ) : (
                          <>
                            (₱ {Number(item.price).toLocaleString()} base
                            {item.addOns && item.addOns.length > 0 && (
                              <>
                                {" "}
                                + ₱{" "}
                                {item.addOns
                                  .reduce(
                                    (sum, a) => sum + (Number(a.price) || 0),
                                    0
                                  )
                                  .toLocaleString()}{" "}
                                add-ons
                              </>
                            )}
                            ) × {item.quantity}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Right: Quantity Controls */}
                  <div className="flex flex-col items-center justify-center gap-2 ml-4">
                    {item.quantity > 1 ? (
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-8 h-8 flex items-center justify-center"
                        onClick={() => handleUpdateQuantity(item, -1)}
                        disabled={
                          !!loadingItem && loadingItem.key === groupKey
                        }
                      >
                        {loadingItem &&
                          loadingItem.key === groupKey &&
                          loadingItem.action === "dec" ? (
                          <Loader2 className="animate-spin text-[#FFC107] w-5 h-5" />
                        ) : (
                          "-"
                        )}
                      </Button>
                    ) : (
                      <button
                        className="rounded-full w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 text-lg shadow border border-gray-200"
                        title="Remove from cart"
                        onClick={() => handleDeleteGroup(item)}
                        disabled={
                          !!loadingItem && loadingItem.key === groupKey
                        }
                      >
                        {loadingItem &&
                          loadingItem.key === groupKey &&
                          loadingItem.action === "del" ? (
                          <Loader2 className="animate-spin text-[#FFC107] w-5 h-5" />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            width="20"
                            height="20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.5 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4h3.25a.75.75 0 0 1 0 1.5h-.278l-.427 9.399A2.25 2.25 0 0 1 13.1 17.13l-.1.007H7a2.25 2.25 0 0 1-2.25-2.224L4.323 5.5H4.25a.75.75 0 0 1 0-1.5H7.5V3zm1 1v1h3V4h-3zm-2.177 1.5l.427 9.399a.75.75 0 0 0 .75.726h6a.75.75 0 0 0 .75-.726l.427-9.399H6.323z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                    <span className="font-bold text-[#232323]">
                      {item.quantity}
                    </span>
                    <Button
                      variant="yellow"
                      size="icon"
                      className="rounded-full w-8 h-8 flex items-center justify-center"
                      onClick={() => handleUpdateQuantity(item, 1)}
                      disabled={!!loadingItem && loadingItem.key === groupKey}
                    >
                      {loadingItem &&
                        loadingItem.key === groupKey &&
                        loadingItem.action === "inc" ? (
                        <Loader2 className="animate-spin text-white w-5 h-5" />
                      ) : (
                        "+"
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
        {/* Promocode */}
        <div className="w-full max-w-5xl flex justify-start mb-6">
          <button className="text-white font-bold text-lg hover:underline">
            Apply promocode &gt;
          </button>
        </div>
        {/* Minimum Order Warning */}
        {selectedCart.length > 0 && !meetsMinimum && (
          <div className="w-full max-w-md mx-auto bg-yellow-50 border-2 border-[#FFC107] rounded-2xl p-4 shadow mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <div className="font-bold text-base text-[#232323] mb-1">
                  Minimum Order Required
                </div>
                <div className="text-sm text-gray-700">
                  Your current order is <span className="font-bold">₱{subtotal.toFixed(2)}</span>.
                  You need <span className="font-bold text-[#FFC107]">₱{(MINIMUM_ORDER - subtotal).toFixed(2)}</span> more to reach the minimum order of <span className="font-bold">₱{MINIMUM_ORDER.toFixed(2)}</span> (excluding delivery fee).
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Summary */}
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl p-8 shadow flex flex-col gap-4 mb-8">
          <div className="flex justify-between text-lg font-bold text-[#232323]">
            <span>Subtotal</span>
            <span>P {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-400">
            <span>Discount</span>
            <span>P {discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[#232323]">
            <span>Shipping Fee</span>
            <span>P {shipping.toFixed(2)}</span>
          </div>
          <hr className="my-2 border-gray-300" />
          <div className="flex justify-between text-2xl font-extrabold text-[#232323]">
            <span>Total</span>
            <span>P {total.toFixed(2)}</span>
          </div>
        </div>
        <Button
          variant="yellow"
          className="w-full max-w-md text-xl font-bold py-4"
          disabled={selectedCart.length === 0 || !meetsMinimum}
          onClick={() => {
            console.log("Selected cart items:", selectedCart);
            console.log("Selected cart length:", selectedCart.length);
            localStorage.setItem("selectedCart", JSON.stringify(selectedCart));
            navigate(`/checkout/${userId}`, { state: { selectedCart } });
          }}
        >
          Checkout
        </Button>
      </div>
    </CustomerLayout>
  );
}
