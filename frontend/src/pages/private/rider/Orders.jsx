import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import RiderLayout from "@/layouts/RiderLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Package,
  User,
  CheckCircle,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUpload from "@/components/custom/ImageUpload";
import OrderStatusBadge from "@/components/orders/OrderStatusBadge";
import DeliveryNavigation from "@/components/custom/DeliveryNavigation";

export default function Orders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [completingOrder, setCompletingOrder] = useState(null);
  const [deliveryProofImage, setDeliveryProofImage] = useState("");
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

  // Fetch rider's active orders (out for delivery)
  const {
    data: activeOrders = [],
    isLoading: activeLoading,
    error: activeError,
  } = useQuery({
    queryKey: ["rider-active-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await orderAPI.getOrdersByRider(user._id);
      return (response.orders || []).filter(
        (order) => order.status === "out_for_delivery"
      );
    },
    enabled: !!user?._id,
    staleTime: 1000 * 30, // 30 seconds
    cacheTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch rider's completed orders
  const {
    data: completedOrders = [],
    isLoading: completedLoading,
    error: completedError,
  } = useQuery({
    queryKey: ["rider-completed-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await orderAPI.getOrdersByRider(user._id);
      return (response.orders || []).filter(
        (order) => order.status === "completed"
      );
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Complete order mutation
  const { mutate: completeOrder } = useMutation({
    mutationFn: async ({ orderId, riderId, deliveryProofImage }) => {
      return await orderAPI.completeOrder(orderId, riderId, deliveryProofImage);
    },
    onSuccess: () => {
      toast.success("Order completed successfully!");
      setCompleteDialogOpen(false);
      setCompletingOrder(null);
      setDeliveryProofImage("");
      queryClient.invalidateQueries(["rider-active-orders", user?._id]);
      queryClient.invalidateQueries(["rider-completed-orders", user?._id]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to complete order";
      toast.error(errorMessage);
      console.error("Complete order error:", error);
      setCompleteDialogOpen(false);
      setCompletingOrder(null);
      setDeliveryProofImage("");
    },
    onSettled: () => {
      setCompleteLoading(false);
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const handleImageUpload = (base64Image) => {
    setDeliveryProofImage(base64Image);
  };

  const handleCompleteOrder = () => {
    if (!deliveryProofImage) {
      toast.error("Please upload a delivery proof image");
      return;
    }
    setCompleteLoading(true);
    completeOrder({
      orderId: completingOrder._id,
      riderId: user._id,
      deliveryProofImage,
    });
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

  // Helper to calculate items total for an order
  const calculateItemsTotal = (order) => {
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
          item.addOns?.reduce((a, addon) => a + (addon.price || 0), 0) || 0;
        return sum + (item.price + addonPrice) * item.quantity;
      }
    }, 0);
  };
  const deliveryFee = 15;

  const renderOrderCard = (order, isActive = false) => {
    const itemsTotal = calculateItemsTotal(order);
    const grandTotal = itemsTotal + deliveryFee;
    return (
      <Card
        key={order._id}
        className="bg-white hover:shadow-lg transition-shadow duration-200 rounded-2xl"
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-[#232323] text-lg">
                Order #{order._id.substring(0, 8)}...
              </CardTitle>
              <p className="text-gray-400 text-sm">
                {formatDate(order.createdAt)}
              </p>
            </div>
            {/* Use the shared OrderStatusBadge for status */}
            <OrderStatusBadge status={order.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Info */}
          <div className="flex items-center gap-2 text-[#232323] font-medium">
            <User className="w-4 h-4 text-[#FFC107]" />
            <span>{order.userId?.name || "Unknown Customer"}</span>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-[#FFC107]" />
            <span>
              {order.userId?.contactNumber ||
                order.address?.contactNumber ||
                "No contact number"}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-[#FFC107] mt-0.5" />
            <span className="text-sm">{formatAddress(order.address)}</span>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <Package className="w-4 h-4 text-[#FFC107]" />
              <span className="font-bold text-[#232323]">Order Items:</span>
            </div>
            <div className="ml-2 space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 border-2 border-[#FFC107] flex flex-col sm:flex-row sm:items-center gap-4 shadow"
                >
                  <img
                    src={item.isCustomDrink ? (item.customImage || item.image || "/placeholder.png") : (item.image || "/placeholder.png")}
                    alt={item.productName}
                    className="w-20 h-20 object-contain rounded-xl bg-white mb-2 sm:mb-0 shadow"
                  />
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-[#232323] truncate">
                        {item.productName}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(item.size || (item.isCustomDrink && item.customSize)) && (
                          <span className="text-xs bg-[#FFF9E5] text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                            Size: {item.isCustomDrink ? item.customSize : item.size}
                          </span>
                        )}
                        {item.isCustomDrink && item.customIngredients && item.customIngredients.length > 0 && (
                          <span className="text-xs bg-[#FFF9E5] text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                            Custom: {item.customIngredients.map(ing => ing.name).join(", ")}
                          </span>
                        )}
                        {!item.isCustomDrink && item.addOns && item.addOns.length > 0 && (
                          <span className="text-xs bg-[#FFF9E5] text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                            Add-ons:{" "}
                            {item.addOns
                              .map(
                                (a) =>
                                  `${a.name}${a.price ? ` (+₱${a.price})` : ""}`
                              )
                              .join(", ")}
                          </span>
                        )}
                      </div>
                      <span className="text-[#232323] text-xs font-bold mt-1">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="text-base sm:text-lg font-extrabold text-[#232323] mt-2 sm:mt-0 whitespace-nowrap ml-auto">
                    ₱
                    {item.isCustomDrink ? (
                      // For custom drinks, calculate from custom ingredients + size price
                      (() => {
                        const ingredientsTotal = Array.isArray(item.customIngredients)
                          ? item.customIngredients.reduce((sum, ingredient) =>
                              sum + (Number(ingredient.price) * Number(ingredient.quantity) || 0), 0)
                          : 0;
                        const sizePrice = getSizePrice(item.customSize || item.size);
                        return ingredientsTotal + sizePrice;
                      })()
                    ).toFixed(2) : (
                      // For regular products, calculate base + add-ons
                      (item.price +
                        (item.addOns?.reduce(
                          (a, addon) => a + (addon.price || 0),
                          0
                        ) || 0))
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            {/* Breakdown: Items Total, Delivery Fee, Total */}
            <div className="mt-4 space-y-2 ml-2">
              <div className="flex justify-between items-center text-sm font-bold text-[#232323]">
                <span>Items Total:</span>
                <span>₱{itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-[#232323]">
                <span>Delivery Fee:</span>
                <span>₱{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#FFC107]/30 pt-2 mt-2">
                <span className="text-lg font-extrabold text-[#232323]">
                  Total:
                </span>
                <span className="text-lg font-extrabold text-[#232323]">
                  ₱{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Navigation (for active orders) */}
          {isActive && (
            <div className="pt-4 border-t border-gray-200">
              <DeliveryNavigation
                deliveryAddress={formatAddress(order.address)}
                deliveryCoordinates={{
                  latitude: order.address?.latitude || 13.323830,
                  longitude: order.address?.longitude || 121.845809
                }}
              />
            </div>
          )}

          {/* Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-[#444]">
            {/* Total line moved to breakdown above */}
            {isActive && (
              <Button
                variant="yellow"
                size="sm"
                className="w-full sm:w-auto text-sm sm:text-base"
                onClick={() => {
                  setCompletingOrder(order);
                  setCompleteDialogOpen(true);
                }}
                disabled={completeLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Complete Delivery</span>
                <span className="sm:hidden">Complete</span>
              </Button>
            )}
          </div>

          {/* Delivery Proof Image (for completed orders) */}
          {order.status === "completed" && order.deliveryProofImage && (
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
                  className="w-full max-w-xs h-40 object-contain rounded-lg border-2 border-[#FFC107] shadow"
                />
                <span className="text-xs text-gray-700 mt-2 text-center font-medium">
                  Uploaded by rider upon delivery completion
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (activeLoading || completedLoading) {
    return (
      <RiderLayout>
        <div className="min-h-screen bg-[#232323] p-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Orders</h1>
              <p className="text-gray-400">Manage your deliveries</p>
            </div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-gray-100 animate-pulse shadow rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </RiderLayout>
    );
  }

  if (activeError || completedError) {
    return (
      <RiderLayout>
        <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
          <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
            <CheckCircle
              size={80}
              strokeWidth={2.5}
              className="mb-4 text-red-500"
            />
            <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">
              Error Loading Orders
            </div>
            <div className="text-gray-500 mb-6 text-center">
              Failed to load your orders. Please try again.
            </div>
            <Button
              variant="yellow"
              className="w-full text-lg font-bold py-3"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </RiderLayout>
    );
  }

  return (
    <RiderLayout>
      <div className="min-h-screen bg-[#232323] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Orders</h1>
            <p className="text-gray-400">Manage your deliveries</p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            {/* Sticky Tabs */}
            <div className="sticky top-18 z-10 bg-[#232323] pb-4">
              <div className="bg-white rounded-2xl p-2 shadow">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-1">
                  <TabsTrigger
                    value="active"
                    className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                  >
                    Active ({activeOrders.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="data-[state=active]:bg-[#FFC107] data-[state=active]:text-black py-2 px-3 text-xs sm:text-sm font-medium rounded-xl transition-all hover:bg-gray-100"
                  >
                    Completed ({completedOrders.length})
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="active" className="mt-6">
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md mx-auto">
                  <Package
                    size={80}
                    strokeWidth={2.5}
                    className="mb-4"
                    style={{
                      color: "#FFC107",
                      filter: "drop-shadow(0 0 8px #FFC10788)",
                    }}
                  />
                  <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">
                    No Active Orders
                  </div>
                  <div className="text-gray-500 mb-6 text-center">
                    You don&apos;t have any orders currently out for delivery.
                  </div>
                  <Button
                    variant="yellow"
                    className="w-full text-lg font-bold py-3"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map((order) => (
                    <div key={order._id}>
                      {renderOrderCard(order, true)}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md mx-auto">
                  <CheckCircle
                    size={80}
                    strokeWidth={2.5}
                    className="mb-4"
                    style={{
                      color: "#FFC107",
                      filter: "drop-shadow(0 0 8px #FFC10788)",
                    }}
                  />
                  <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">
                    No Completed Orders
                  </div>
                  <div className="text-gray-500 mb-6 text-center">
                    You haven&apos;t completed any orders yet.
                  </div>
                  <Button
                    variant="yellow"
                    className="w-full text-lg font-bold py-3"
                    onClick={() => window.location.reload()}
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedOrders.map((order) =>
                    renderOrderCard(order, false)
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Complete Order Dialog */}
        <CustomAlertDialog
          open={completeDialogOpen}
          onOpenChange={completeLoading ? undefined : setCompleteDialogOpen}
          title="Complete Delivery"
          description={`Upload a photo as proof of delivery for order #${completingOrder?._id?.substring(
            0,
            8
          )}...`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={completeLoading}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="yellow"
                size="lg"
                loading={completeLoading}
                disabled={completeLoading || !deliveryProofImage}
                onClick={handleCompleteOrder}
              >
                {completeLoading ? "Completing..." : "Complete Order"}
              </Button>
            </>
          }
        >
          <div className="mt-4">
            <ImageUpload
              label="Delivery Proof Photo"
              value={deliveryProofImage}
              onChange={handleImageUpload}
              disabled={completeLoading}
              variant="dark"
            />
          </div>
        </CustomAlertDialog>
      </div>
    </RiderLayout>
  );
}
