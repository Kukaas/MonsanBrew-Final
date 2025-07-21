import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productAPI,
  addonsAPI,
  cartAPI,
  reviewAPI,
} from "../../../services/api";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { Heart, Share2, Star } from "lucide-react";
import CustomerLayout from "../../../layouts/CustomerLayout";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import FormInput from "@/components/custom/FormInput";
import QRCode from "react-qr-code";
import { Copy as CopyIcon } from "lucide-react";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import ReviewFilter from "@/components/reviews/ReviewFilter";

export default function ProductDetail() {
  // All hooks must be at the top
  const [shareOpen, setShareOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await productAPI.getById(id);
      return res.data || res;
    },
  });
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Real-time favorite count
  const { data: favoriteCountData, refetch: refetchFavoriteCount } = useQuery({
    queryKey: ["favoriteCount", id],
    queryFn: async () => {
      const res = await productAPI.getFavoriteCount(id);
      return res.favorites ?? res.data?.favorites ?? 0;
    },
    enabled: !!id,
  });
  const favoriteCount = favoriteCountData ?? 0;

  // Check if user has favorited
  const [favorite, setFavorite] = useState(false);
  useEffect(() => {
    if (product && user) {
      setFavorite(
        Array.isArray(product.favorites) && product.favorites.includes(user._id)
      );
    }
  }, [product, user]);

  // Pagination state for reviews
  const [reviewPage, setReviewPage] = useState(1);
  const [allReviews, setAllReviews] = useState([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const REVIEWS_PER_PAGE = 5;

  // Fetch reviews for this product (paginated)
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    refetch: refetchReviews,
    isFetching: isFetchingReviews,
  } = useQuery({
    queryKey: ["product-reviews", id, reviewPage],
    queryFn: async () => {
      try {
        const res = await reviewAPI.getProductReviews(
          id,
          reviewPage,
          REVIEWS_PER_PAGE
        );
        return res.data || res;
      } catch (error) {
        if (error.response?.status === 404) {
          return { reviews: [], totalReviews: 0, totalPages: 1 };
        }
        throw error;
      }
    },
    enabled: !!id,
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  // Append reviews as pages are loaded
  useEffect(() => {
    if (reviewsData && Array.isArray(reviewsData.reviews)) {
      if (reviewPage === 1) {
        setAllReviews(reviewsData.reviews);
      } else {
        setAllReviews((prev) => [...prev, ...reviewsData.reviews]);
      }
      setHasMoreReviews(reviewsData.currentPage < reviewsData.totalPages);
    }
  }, [reviewsData, reviewPage]);

  // Reset reviews if product changes
  useEffect(() => {
    setReviewPage(1);
    setAllReviews([]);
    setHasMoreReviews(true);
    setSelectedRating(null);
  }, [id]);

  // Filter reviews based on selected rating
  const filteredReviews = selectedRating
    ? allReviews.filter((review) => review.rating === selectedRating)
    : allReviews;

  // Calculate review counts by rating
  const reviewCounts = allReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  // Handle rating filter change
  const handleRatingFilterChange = (rating) => {
    setSelectedRating(rating);
    // Don't reset the reviews data, just change the filter
  };

  // Favorite/unfavorite mutations
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const favoriteMutation = useMutation({
    mutationFn: async (currentFavorite) => {
      if (!user) throw new Error("Not logged in");
      if (currentFavorite) {
        await productAPI.removeFavorite(id, user._id);
      } else {
        await productAPI.addFavorite(id, user._id);
      }
    },
    onMutate: () => {
      setFavoriteLoading(true);
    },
    onSuccess: (_data, currentFavorite) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      refetchFavoriteCount();
      setFavorite((f) => !f);
      if (currentFavorite) {
        toast.success("Removed from favorites!");
      } else {
        toast.success("Added to favorites!");
      }
    },
    onError: () => {},
    onSettled: () => {
      setFavoriteLoading(false);
    },
  });

  // Placeholder for image gallery
  const images =
    product?.images && product.images.length > 0
      ? product.images
      : [product?.image || product?.imageUrl || "/placeholder.png"];
  const [selectedImage, setSelectedImage] = useState(images[0]);
  useEffect(() => {
    if (images[0]) setSelectedImage(images[0]);
  }, [product]);
  // Placeholder for variants
  const variants = product?.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);
  // Quantity
  const [quantity, setQuantity] = useState(1);
  const maxQty = product?.stock || 99;

  // Size selection
  const sizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0
      ? product.sizes
      : Array.isArray(product?.size)
      ? product.size
      : product?.size
      ? [product.size]
      : [];
  const [selectedSize, setSelectedSize] = useState(null);

  // Set default selected size to 'small' if exists, else first size
  useEffect(() => {
    if (sizes && sizes.length > 0) {
      const small = sizes.find(
        (s) => (s.label || s).toString().toLowerCase() === "small"
      );
      setSelectedSize(
        small ? small.label || small : sizes[0].label || sizes[0]
      );
    }
  }, [product]);

  // Customization: fetch add-ons if customizable
  const isCustomizable = product?.isCustomizable;
  const addonIds = product?.addOns || [];
  const { data: addons, isLoading: loadingAddons } = useQuery({
    queryKey: ["addons", addonIds],
    enabled: isCustomizable && addonIds.length > 0,
    queryFn: async () => {
      // Use correct API
      const res = await addonsAPI.getMany(addonIds);
      return res.data || res || [];
    },
  });
  const [selectedAddons, setSelectedAddons] = React.useState([]);
  const handleAddonToggle = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  // Add to Cart handler
  const [addCartLoading, setAddCartLoading] = React.useState(false);
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("You must be logged in to add to cart.");
      return;
    }
    setAddCartLoading(true);
    try {
      await cartAPI.addToCart({
        user: user._id,
        product: product._id,
        size: selectedSize,
        quantity,
        addOns: selectedAddons,
      });
      toast.success("Added to cart!");
      setAddCartLoading(false);
      // Reset all form states
      setQuantity(1);
      // Reset selected size to default (small or first)
      if (sizes && sizes.length > 0) {
        const small = sizes.find(
          (s) => (s.label || s).toString().toLowerCase() === "small"
        );
        setSelectedSize(
          small ? small.label || small : sizes[0].label || sizes[0]
        );
      } else {
        setSelectedSize(null);
      }
      // Reset selected variant to first or null
      setSelectedVariant(variants[0] || null);
      // Reset selected add-ons
      setSelectedAddons([]);
      // Reset selected image to first
      if (images[0]) setSelectedImage(images[0]);
    } catch (err) {
      toast.error("Failed to add to cart.");
      setAddCartLoading(false);
    }
  };

  // Buy Now handler
  const [buyNowLoading, setBuyNowLoading] = React.useState(false);
  const handleBuyNow = async () => {
    if (!user) {
      toast.error("You must be logged in to purchase.");
      return;
    }
    setBuyNowLoading(true);
    try {
      // Create a temporary cart item for checkout
      const checkoutItem = {
        product: product._id,
        productName: product.productName,
        image: product.image || product.images?.[0],
        size: selectedSize,
        quantity,
        addOns: selectedAddons,
        price: selectedSize
          ? (() => {
              const found = product.sizes.find((s) => s.label === selectedSize);
              return found ? found.price : product.price;
            })()
          : product.price,
      };

      // Store checkout data in sessionStorage for the checkout page
      sessionStorage.setItem("buyNowItem", JSON.stringify(checkoutItem));

      // Navigate to checkout page
      navigate(`/checkout/${user._id}?buyNow=true`);
    } catch (err) {
      toast.error("Failed to proceed to checkout.");
      setBuyNowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="mt-10 flex flex-col items-center justify-center min-h-screen bg-[#232323] px-2 sm:px-4">
          <div className="bg-white rounded-2xl shadow p-4 sm:p-8 md:p-12 flex flex-col items-center w-full max-w-2xl mb-8 gap-4 sm:gap-6">
            <Skeleton className="w-full max-w-[420px] h-60 sm:h-80 md:h-[420px] mb-6 bg-gray-200 rounded-2xl border border-gray-200" />
            <Skeleton className="h-8 w-48 sm:w-72 mb-2 bg-gray-200 rounded-lg" />
            <Skeleton className="h-6 w-32 sm:w-56 mb-4 bg-gray-200 rounded-lg" />
            <Skeleton className="h-12 w-40 sm:w-80 mb-4 bg-gray-200 rounded-lg" />
          </div>
          {/* Product Description Skeleton */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-8 w-full max-w-2xl mb-8">
            <Skeleton className="h-8 w-32 sm:w-48 mb-4 bg-gray-200 rounded-lg" />
            <Skeleton className="h-5 w-full mb-2 bg-gray-200 rounded" />
            <Skeleton className="h-5 w-3/4 mb-2 bg-gray-200 rounded" />
            <Skeleton className="h-5 w-2/3 mb-2 bg-gray-200 rounded" />
            <Skeleton className="h-5 w-1/2 mb-2 bg-gray-200 rounded" />
          </div>
          {/* Reviews Skeleton */}
          <div className="bg-white rounded-xl shadow p-4 sm:p-8 w-full max-w-2xl">
            <Skeleton className="h-8 w-32 sm:w-40 mb-4 bg-gray-200 rounded-lg" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4 sm:mb-6">
                <Skeleton className="h-6 w-1/2 mb-2 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-full mb-1 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-3/4 mb-1 bg-gray-200 rounded" />
                <Skeleton className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }
  if (error || !product) {
    return (
      <CustomerLayout>
        <div className="text-center text-red-500 py-8">Product not found.</div>
      </CustomerLayout>
    );
  }

  // Only compute these after product is loaded
  const url = `${window.location.origin}/product/${product._id}`;
  const handleCopy = (url) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Product link copied!");
    } else {
      alert(url);
    }
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-2">
        {/* Product Card (not sticky, single column) */}
        <div className="bg-white rounded-2xl shadow max-w-2xl w-full flex flex-col p-10 gap-8 border border-gray-200 mb-10">
          {/* Image Gallery */}
          <div className="flex flex-col items-center justify-center">
            <img
              src={selectedImage}
              alt={product.productName}
              className="w-full max-w-xs h-64 md:w-96 md:h-96 object-contain rounded-xl mb-6 border-2 border-gray-200 shadow bg-white"
            />
          </div>
          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Top: Name, Favorite, Share */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#232323] mb-2 flex-1">
                {product.productName}
              </h2>
              <div className="flex gap-3 items-center">
                {/* Favorite Button */}
                <button
                  onClick={() => favoriteMutation.mutate(favorite)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all shadow ${
                    favorite
                      ? "bg-[#FFC107] border-[#FFC107]"
                      : "bg-white border-gray-200"
                  } hover:scale-105`}
                  aria-label={
                    favorite ? "Remove from favorites" : "Add to favorites"
                  }
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <span className="flex items-center justify-center w-6 h-6">
                      <svg
                        className={`animate-spin ${
                          favorite ? "text-white" : "text-[#FFC107]"
                        }`}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke={favorite ? "white" : "#FFC107"}
                          strokeWidth="4"
                          strokeDasharray="60 40"
                        />
                      </svg>
                    </span>
                  ) : (
                    <Heart
                      className={favorite ? "text-white" : "text-[#FFC107]"}
                      fill={favorite ? "#FFC107" : "none"}
                      size={24}
                    />
                  )}
                </button>
                <span className="text-[#FFC107] font-bold text-lg select-none min-w-[24px] text-center">
                  {favoriteCount}
                </span>
                {/* Share Button */}
                {product && (
                  <>
                    <button
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition-all shadow"
                      aria-label="Share"
                      type="button"
                      onClick={() => {
                        setShareOpen(true);
                        setShowQR(false);
                      }}
                    >
                      <Share2 className="text-[#FFC107]" size={22} />
                    </button>
                    <CustomAlertDialog
                      open={shareOpen}
                      onOpenChange={(open) => {
                        setShareOpen(open);
                        setShowQR(false);
                      }}
                      title="Share Product"
                      description="Share this product with others."
                      actions={
                        <AlertDialogCancel className="w-full rounded-lg font-bold py-3 text-lg border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white transition">
                          Close
                        </AlertDialogCancel>
                      }
                    >
                      <div className="flex flex-col gap-4 items-center">
                        <div className="w-full relative">
                          <FormInput
                            label="Product Link"
                            value={url}
                            readOnly
                            variant="dark"
                            inputClassName="text-center font-mono text-sm pr-12  "
                            className="w-full text-white"
                            endIcon={
                              <button
                                type="button"
                                onClick={() => handleCopy(url)}
                                className="ml-2 p-1 rounded hover:bg-[#FFC107]/20 transition"
                                aria-label="Copy link"
                              >
                                <CopyIcon
                                  size={20}
                                  className="text-[#FFC107]"
                                />
                              </button>
                            }
                          />
                        </div>
                        <div className="flex gap-2 w-full mb-2">
                          <Button
                            variant="yellow-outline"
                            className="flex-1 rounded-lg font-bold py-3 text-lg"
                            onClick={() => setShowQR((q) => !q)}
                          >
                            {showQR ? "Hide QR" : "Show QR Code"}
                          </Button>
                        </div>
                        {showQR && (
                          <div className="flex flex-col items-center mt-2 w-full">
                            <div className="bg-[#232323] border-2 border-[#FFC107] rounded-2xl p-4 shadow-lg flex flex-col items-center w-full">
                              <QRCode
                                value={url}
                                size={140}
                                bgColor="#232323"
                                fgColor="#FFC107"
                                style={{
                                  background: "#232323",
                                  boxShadow: "0 4px 24px #0004",
                                }}
                              />
                              <div className="text-yellow-400 font-bold mt-3 text-center text-base">
                                Scan to open product
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CustomAlertDialog>
                  </>
                )}
              </div>
            </div>
            {/* Price, Ratings, Sold, Availability */}
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              <div className="text-3xl font-bold text-[#FFC107]">
                {Array.isArray(product.sizes) &&
                product.sizes.length > 0 &&
                selectedSize ? (
                  (() => {
                    const found = product.sizes.find(
                      (s) => s.label === selectedSize
                    );
                    return found
                      ? `₱ ${Number(found.price).toLocaleString()}`
                      : `₱ ${product.price?.toLocaleString()}`;
                  })()
                ) : (
                  <>₱ {product.price?.toLocaleString()}</>
                )}
              </div>
              <div className="text-gray-400 text-lg">
                {product.averageRating ? (
                  <>
                    {product.averageRating.toFixed(1)} ★ |{" "}
                    {product.totalSold || 0} sold
                  </>
                ) : (
                  <>No ratings yet | {product.totalSold || 0} sold</>
                )}
              </div>
              {product.isAvailable ? (
                <span className="ml-2 px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold">
                  Available
                </span>
              ) : (
                <span className="ml-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                  Not Available
                </span>
              )}
            </div>
            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-[#232323] mb-1">
                  Variants:
                </div>
                <div className="flex gap-2 flex-wrap">
                  {variants.map((v, i) => (
                    <Button
                      key={i}
                      variant={
                        selectedVariant === v ? "yellow" : "yellow-outline"
                      }
                      onClick={() => setSelectedVariant(v)}
                      disabled={!product.isAvailable}
                      className="min-w-[80px]"
                    >
                      {v}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {/* Size Selector */}
            {Array.isArray(product?.sizes) && product.sizes.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold text-[#232323] mb-1">Size:</div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size, i) => (
                    <Button
                      key={i}
                      variant={
                        selectedSize === size.label
                          ? "yellow"
                          : "yellow-outline"
                      }
                      onClick={() => setSelectedSize(size.label)}
                      disabled={!product.isAvailable}
                      className="min-w-[60px]"
                    >
                      {size.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 mb-2">
              <div className="font-semibold text-[#232323]">Quantity:</div>
              <div className="flex items-center gap-1">
                <Button
                  variant="yellow-outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!product.isAvailable}
                >
                  -
                </Button>
                <span className="px-3 text-lg font-bold text-[#232323]">
                  {quantity}
                </span>
                <Button
                  variant="yellow-outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={!product.isAvailable}
                >
                  +
                </Button>
              </div>
            </div>
            {/* Customization Section */}
            {isCustomizable && (
              <div className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-200">
                <div className="font-bold text-[#232323] mb-3 text-lg">
                  Customize your order
                </div>
                {loadingAddons ? (
                  <Skeleton className="h-8 w-32 bg-[#333] rounded-lg" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {addons && addons.length > 0 ? (
                      addons.map((addon) => (
                        <label
                          key={addon._id}
                          className={`flex items-center gap-3 ${
                            !addon.isAvailable
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(addon._id)}
                            onChange={() => handleAddonToggle(addon._id)}
                            disabled={!addon.isAvailable}
                            className="accent-[#FFC107] w-5 h-5"
                          />
                          {addon.image && (
                            <img
                              src={addon.image}
                              alt={addon.name}
                              className="w-10 h-10 object-cover rounded border border-gray-200 bg-white"
                            />
                          )}
                          <span
                            className={`font-medium ${
                              !addon.isAvailable
                                ? "text-gray-500"
                                : "text-[#232323]"
                            }`}
                          >
                            {addon.name}
                          </span>
                          <span className="text-[#FFC107] font-bold ml-2">
                            +₱{addon.price?.toLocaleString()}
                          </span>
                          {!addon.isAvailable && (
                            <span className="text-red-500 text-xs font-medium ml-auto">
                              Not Available
                            </span>
                          )}
                        </label>
                      ))
                    ) : (
                      <span className="text-gray-400">
                        No add-ons available.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <Button
                variant="yellow-outline"
                className="flex-1 w-full"
                onClick={handleAddToCart}
                disabled={addCartLoading || !product.isAvailable}
                loading={addCartLoading}
              >
                {addCartLoading
                  ? "Adding..."
                  : !product.isAvailable
                  ? "Not Available"
                  : "Add to Cart"}
              </Button>
              <Button
                variant="yellow"
                className="flex-1 w-full"
                onClick={handleBuyNow}
                disabled={buyNowLoading || !product.isAvailable}
                loading={buyNowLoading}
              >
                {buyNowLoading
                  ? "Processing..."
                  : !product.isAvailable
                  ? "Not Available"
                  : "Buy Now"}
              </Button>
            </div>
            {!product.isAvailable && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium text-center">
                  This product is currently not available for purchase.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Product Description (bottom, full width) */}
        <div className="max-w-2xl w-full mb-10">
          <h3 className="text-xl font-extrabold mb-3 text-[#FFC107]">
            Product Description
          </h3>
          <div className="bg-white rounded-xl p-6 text-gray-700 text-base shadow-sm border border-gray-200">
            {product.description || "No description available."}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mt-6">
                <div className="font-bold text-[#232323] mb-2">
                  Ingredients:
                </div>
                <ul className="list-disc list-inside text-gray-700">
                  {product.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.productName}{" "}
                      <span className="text-[#232323] font-bold">
                        : {ing.quantity}
                        {ing.unit ? ` ${ing.unit}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        {/* Reviews Section (bottom, full width) */}
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-extrabold text-[#FFC107]">Reviews</h3>
          </div>

          {/* Review Filter Component */}
          {allReviews && allReviews.length > 0 && (
            <ReviewFilter
              selectedRating={selectedRating}
              onRatingChange={handleRatingFilterChange}
              totalReviews={reviewsData?.totalReviews || 0}
              averageRating={product?.averageRating || 0}
              reviewCounts={reviewCounts}
            />
          )}

          {allReviews && allReviews.length > 0 ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {/* Filter Status */}
              {selectedRating && (
                <div className="mb-4 p-3 bg-[#FFC107] bg-opacity-10 rounded-lg border border-[#FFC107]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#232323]">
                      Showing {filteredReviews.length} review
                      {filteredReviews.length !== 1 ? "s" : ""} with{" "}
                      {selectedRating} star{selectedRating !== 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRatingFilterChange(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear filter
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                {filteredReviews.map((review, index) => (
                  <div
                    key={review._id || index}
                    className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "fill-[#FFC107] text-[#FFC107]"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {review.rating}/5
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {review.userId?.name || "Anonymous"}
                          </span>
                        </div>
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                          {review.orderId && (
                            <>
                              <span>•</span>
                              <span>
                                Order #{review.orderId._id?.slice(-8)}
                              </span>
                            </>
                          )}
                        </div>
                        {/* Show order contents if available */}
                        {review.orderId?.items &&
                          review.orderId.items.length > 0 && (
                            <ul className="mt-2 ml-2 text-xs text-gray-700 list-disc">
                              {review.orderId.items.map((item, idx) => (
                                <li key={idx}>
                                  <span className="font-medium">
                                    {item.quantity}x {item.productName}
                                  </span>
                                  {item.size && <span> ({item.size})</span>}
                                  {item.addOns && item.addOns.length > 0 && (
                                    <span>
                                      {" "}
                                      Add-ons:{" "}
                                      {item.addOns
                                        .map((a) => a.name)
                                        .join(", ")}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreReviews && (
                <div className="flex justify-center mt-6">
                  <Button
                    variant="yellow-outline"
                    onClick={() => setReviewPage((p) => p + 1)}
                    disabled={isFetchingReviews}
                  >
                    {isFetchingReviews ? "Loading..." : "Load more reviews"}
                  </Button>
                </div>
              )}
              {selectedRating && filteredReviews.length === 0 && (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No reviews with {selectedRating} star
                    {selectedRating !== 1 ? "s" : ""}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Try selecting a different rating or clear the filter
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-gray-400 text-base shadow-sm border border-gray-200">
              <div className="text-center py-4">
                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Be the first to review this product!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
