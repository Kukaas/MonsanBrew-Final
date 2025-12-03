import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderAPI, reviewAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  RotateCcw,
  Camera,
  Star,
  CreditCard,
  Phone,
} from "lucide-react";
import CustomerLayout from "@/layouts/CustomerLayout";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import DeliveryNavigation from "@/components/custom/DeliveryNavigation";
import { toast } from "sonner";

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  // Fetch single order details using Tanstack Query
  const {
    data: order,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await orderAPI.getOrderById(orderId);
      return response.order || response.data;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Error fetching order:", error);
      toast.error("Failed to fetch order details");
    },
  });

  // Fetch review for this order
  const { data: reviewData } = useQuery({
    queryKey: ["order-review", orderId],
    queryFn: async () => {
      try {
        const res = await reviewAPI.getOrderReview(orderId);
        return res.data?.review || res.review || res;
      } catch (error) {
        // If no review exists, return null
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!orderId && order?.status === "completed",
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (address) => {
    if (!address) return "No address provided";
    const parts = [
      address.lotNo,
      address.purok,
      address.street,
      address.barangay,
      address.municipality,
      address.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const calculateItemTotal = (item) => {
    if (item.isCustomDrink) {
      // For custom drinks, calculate from custom ingredients + size price
      const ingredientsTotal = Array.isArray(item.customIngredients)
        ? item.customIngredients.reduce((sum, ingredient) =>
          sum + (Number(ingredient.price) * Number(ingredient.quantity) || 0), 0)
        : 0;

      // Add size price based on custom size
      const sizePrice = getSizePrice(item.customSize || item.size);

      return (ingredientsTotal + sizePrice) * item.quantity;
    } else {
      // For regular products, calculate base + add-ons
      const addonPrice =
        item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      return (item.price + addonPrice) * item.quantity;
    }
  };

  // Helper function to get size price
  const getSizePrice = (size) => {
    const sizePrices = {
      "Small": 10,
      "Medium": 20,
      "Large": 25,
      "Extra Large": 35
    };
    return sizePrices[size] || 20; // Default to Medium price if size not found
  };

  // Calculate Items Total (sum of all items and add-ons)
  const calculateItemsTotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => {
      if (item.isCustomDrink) {
        // For custom drinks, calculate from custom ingredients + size price
        const ingredientsTotal = Array.isArray(item.customIngredients)
          ? item.customIngredients.reduce((ingSum, ingredient) =>
            ingSum + (Number(ingredient.price) * Number(ingredient.quantity) || 0), 0)
          : 0;
        const sizePrice = getSizePrice(item.customSize || item.size);
        return sum + (ingredientsTotal + sizePrice) * item.quantity;
      } else {
        // For regular products, calculate base + add-ons
        const addonPrice =
          item.addOns?.reduce((a, addon) => a + addon.price, 0) || 0;
        return sum + (item.price + addonPrice) * item.quantity;
      }
    }, 0);
  };
  // Use delivery fee from order or default to 15
  const deliveryFee = order?.deliveryFee || 15;
  const itemsTotal = order ? calculateItemsTotal() : 0;
  // Use total from order directly if available to ensure accuracy
  const grandTotal = order?.total || (itemsTotal + deliveryFee);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-4">
          <div className="w-full max-w-2xl space-y-6">
            {/* Order ID Card Skeleton */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Order Items Card Skeleton */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow animate-pulse">
              <div className="h-6 w-28 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-gray-200"
                  >
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Card Skeleton */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Delivery Address Card Skeleton */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow animate-pulse">
              <div className="h-6 w-40 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Order Summary Card Skeleton */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow animate-pulse">
              <div className="h-6 w-36 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    <div className="h-6 w-28 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error || !order) {
    return (
      <CustomerLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-4">
          <div className="w-full max-w-4xl">
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <Package size={48} className="mx-auto mb-2" />
                  <h2 className="text-2xl font-bold">Order Not Found</h2>
                </div>
                <p className="text-gray-600 mb-6">
                  The order you&apos;re looking for doesn&apos;t exist or has been
                  removed.
                </p>
                <Button
                  variant="yellow"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#232323] flex flex-col items-center px-2 sm:px-4 py-0">
      {/* Sticky Top Bar */}
      <div className="w-full sticky top-0 z-30 bg-[#232323] flex items-center px-4 py-4 shadow-md">
        <button
          className="text-white hover:text-[#FFC107] mr-2"
          aria-label="Back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">
          Order Details
        </h1>
      </div>

      {/* Order ID */}
      <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-base sm:text-lg text-[#232323]">
              Order #{order._id?.slice(-8)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} className="text-[#FFC107]" />
              <span>Ordered on {formatDate(order.createdAt)}</span>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        {order.status === "cancelled" && order.cancellationReason && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 font-medium">Cancellation Reason:</p>
            <p className="text-red-600 text-sm">{order.cancellationReason}</p>
          </div>
        )}

        {/* Refund Information */}
        {order.refundStatus && order.refundStatus !== "none" && (
          <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-300 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <RotateCcw size={16} className="text-yellow-600" />
              <p className="text-yellow-800 font-bold text-base">
                Refund Status
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-yellow-800 font-bold text-sm">Status:</p>
                <div className="mt-1">
                  {order.refundStatus === "refund_requested" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                      ⏳ Requested
                    </span>
                  )}
                  {order.refundStatus === "refund_approved" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-300">
                      ✅ Approved
                    </span>
                  )}
                  {order.refundStatus === "refund_rejected" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 border border-red-300">
                      ❌ Rejected
                    </span>
                  )}
                  {order.refundStatus === "refund_processed" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      💰 Processed
                    </span>
                  )}
                  {![
                    "refund_requested",
                    "refund_approved",
                    "refund_rejected",
                    "refund_processed",
                  ].includes(order.refundStatus) && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-800 border border-gray-300">
                        {order.refundStatus}
                      </span>
                    )}
                </div>
              </div>

              {order.refundReason && (
                <div>
                  <p className="text-yellow-800 font-bold text-sm">Reason:</p>
                  <div className="mt-1 p-3 bg-white rounded-lg border border-yellow-300">
                    <p className="text-yellow-800 text-sm leading-relaxed">
                      {order.refundReason}
                    </p>
                  </div>
                </div>
              )}

              {order.refundAmount && (
                <div>
                  <p className="text-yellow-800 font-bold text-sm">
                    Refund Amount:
                  </p>
                  <div className="mt-1 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                    <p className="text-green-800 text-lg font-bold">
                      ₱{order.refundAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {order.refundRejectionMessage && (
                <div className="mt-3 p-4 bg-red-50 rounded-lg border-2 border-red-300 shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600">❌</span>
                    <p className="text-red-800 font-bold text-sm">
                      Rejection Reason:
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm leading-relaxed">
                      {order.refundRejectionMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Refunded Items */}
              {order.refundItems && order.refundItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-yellow-700 font-medium text-sm mb-2">
                    Refunded Items:
                  </p>
                  <div className="space-y-4">
                    {order.refundItems.map((refundItem, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border-2 border-[#FFC107] flex flex-row items-center gap-4 shadow justify-between"
                      >
                        <div className="flex-1 min-w-0 flex flex-col justify-center px-2">
                          <span className="font-bold text-lg text-[#232323] truncate">
                            {refundItem.productName}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {refundItem.size && (
                              <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                                Size: {refundItem.size}
                              </span>
                            )}
                            {refundItem.addOns &&
                              refundItem.addOns.length > 0 && (
                                <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                                  Add-ons:{" "}
                                  {refundItem.addOns
                                    .map((addon) => addon.name)
                                    .join(", ")}
                                </span>
                              )}
                          </div>
                          <span className="text-[#232323] text-sm font-bold mt-1">
                            Refunded Qty: {refundItem.quantity}
                          </span>
                        </div>
                        <div className="text-lg sm:text-xl font-extrabold text-[#232323] whitespace-nowrap text-right">
                          ₱{refundItem.refundAmount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refund Proof Image */}
              {order.refundProofImage && (
                <div className="mt-3">
                  <p className="text-yellow-700 font-medium text-sm mb-2">
                    Refund Proof:
                  </p>
                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <img
                      src={order.refundProofImage}
                      alt="Refund Proof"
                      className="w-full max-w-xs h-32 object-contain rounded-lg border border-yellow-300 mx-auto"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Photo uploaded by customer as proof for refund request
                    </p>
                  </div>
                </div>
              )}

              {/* Refund Payment Proof Image */}
              {order.refundPaymentProof && (
                <div className="mt-3">
                  <p className="text-yellow-700 font-medium text-sm mb-2">
                    Refund Payment Proof:
                  </p>
                  <div className="bg-white rounded p-3 border border-yellow-200">
                    <img
                      src={order.refundPaymentProof}
                      alt="Refund Payment Proof"
                      className="w-full max-w-xs h-32 object-contain rounded-lg border border-yellow-300 mx-auto"
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Payment proof uploaded by admin after processing refund
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
        <div className="font-bold text-base sm:text-lg text-[#232323]">
          Order Items
        </div>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-4 border-1 border-[#FFC107] flex flex-row items-center gap-4 shadow justify-between"
            >
              <img
                src={item.isCustomDrink ? (item.customImage || item.image || "/placeholder.png") : (item.image || "/placeholder.png")}
                alt={item.productName}
                className="w-20 h-20 object-contain rounded-xl bg-white shadow flex-shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-center px-2">
                <span className="font-bold text-lg text-[#232323] truncate">
                  {item.productName}
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(item.size || (item.isCustomDrink && item.customSize)) && (
                    <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                      Size: {item.isCustomDrink ? item.customSize : item.size}
                    </span>
                  )}
                  {item.isCustomDrink && item.customIngredients && item.customIngredients.length > 0 && (
                    <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                      Custom: {item.customIngredients.map(ing => ing.name).join(", ")}
                    </span>
                  )}
                  {!item.isCustomDrink && item.addOns && item.addOns.length > 0 && (
                    <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                      Add-ons:{" "}
                      {item.addOns.map((addon) => addon.name).join(", ")}
                    </span>
                  )}
                </div>
                <span className="text-[#232323] text-sm font-bold mt-1">
                  Qty: {item.quantity}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-[#232323] whitespace-nowrap text-right">
                ₱{calculateItemTotal(item).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Proof Image */}
        {order.deliveryProofImage && (
          <div className="pt-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-[#FFC107]/40 flex flex-col items-center shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-[#FFC107]" />
                <span className="font-bold text-base sm:text-lg text-[#FFC107]">
                  Delivery Proof
                </span>
              </div>
              <img
                src={order.deliveryProofImage}
                alt="Delivery Proof"
                className="w-full max-w-xs h-48 object-contain rounded-lg border-2 border-[#FFC107] shadow"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                Photo taken by rider upon delivery completion
              </p>
            </div>
          </div>
        )}

        {/* Customer Review */}
        {order.status === "completed" && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-[#FFC107]" />
              <span className="font-bold text-base sm:text-lg text-[#232323]">
                Your Review
              </span>
            </div>
            {reviewData ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${star <= reviewData.rating
                        ? "fill-[#FFC107] text-[#FFC107]"
                        : "text-gray-400"
                        }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-2">
                    {reviewData.rating}/5
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {reviewData.comment}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Reviewed on{" "}
                  {new Date(reviewData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {reviewData.isAnonymous && (
                    <span className="ml-2 text-yellow-600">(Anonymous)</span>
                  )}
                </p>
                {reviewData.orderId && (
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Order #{reviewData.orderId._id?.slice(-8)} •
                    {reviewData.orderId.items?.length || 0} item
                    {(reviewData.orderId.items?.length || 0) !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <Star className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No review submitted yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  You can review this order from your orders list
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
        <div className="font-bold text-base sm:text-lg text-[#232323] flex items-center gap-2">
          <CreditCard size={20} className="text-[#FFC107]" />
          Payment Method
        </div>
        <div className="space-y-2">
          <p className="font-medium text-gray-800">
            {order.paymentMethod.toUpperCase()}
          </p>
          {order.referenceNumber && (
            <p className="text-sm text-gray-600">
              Reference: {order.referenceNumber}
            </p>
          )}
        </div>
      </div>

      {/* GCash Payment Proof Image */}
      {order.paymentMethod === "gcash" && order.proofImage && (
        <div className="w-full max-w-2xl bg-gray-50 rounded-xl p-4 border border-[#FFC107]/40 flex flex-col items-center shadow mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-5 h-5 text-[#FFC107]" />
            <span className="font-bold text-base sm:text-lg text-[#FFC107]">
              GCash Payment Proof
            </span>
          </div>
          <img
            src={order.proofImage}
            alt="GCash Payment Proof"
            className="w-full max-w-xs h-48 object-contain rounded-lg border-2 border-[#FFC107] shadow"
          />
          <p className="text-xs text-gray-400 mt-2 text-center">
            Uploaded by customer as proof of GCash payment
          </p>
        </div>
      )}

      {/* Delivery Address */}
      <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
        <div className="font-bold text-base sm:text-lg text-[#232323] flex items-center gap-2">
          <MapPin size={20} className="text-[#FFC107]" />
          Delivery Address
        </div>
        <div className="space-y-2">
          {order.address?.contactNumber && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-[#FFC107]" />
              <span className="text-sm">{order.address.contactNumber}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-[#FFC107] mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              {formatAddress(order.address)}
            </p>
          </div>
          {order.address?.landmark && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-[#FFC107] mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600 italic">
                Landmark: {order.address.landmark}
              </p>
            </div>
          )}
          {order.deliveryInstructions && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-700 font-medium text-sm">
                Delivery Instructions:
              </p>
              <p className="text-yellow-600 text-sm">
                {order.deliveryInstructions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Map */}
      {order.address?.latitude && order.address?.longitude && (
        <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
          <div className="font-bold text-base sm:text-lg text-[#232323] flex items-center gap-2">
            <MapPin size={20} className="text-[#FFC107]" />
            Delivery Location
          </div>
          <DeliveryNavigation
            deliveryAddress={formatAddress(order.address)}
            deliveryCoordinates={{
              latitude: order.address.latitude,
              longitude: order.address.longitude
            }}
            restaurantCoordinates={{
              latitude: 13.323830,
              longitude: 121.845809
            }}
            className="w-full"
          />
        </div>
      )}

      {/* Order Summary */}
      <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-8">
        <div className="font-bold text-base sm:text-lg text-[#232323]">
          Order Summary
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Items Total</span>
            <span className="font-medium">₱{itemsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Delivery Fee</span>
            <span className="font-medium">₱{deliveryFee.toFixed(2)}</span>
          </div>
          <hr className="my-2 border-gray-300" />
          <div className="flex justify-between text-2xl font-extrabold text-[#232323]">
            <span>Total</span>
            <span>₱{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
