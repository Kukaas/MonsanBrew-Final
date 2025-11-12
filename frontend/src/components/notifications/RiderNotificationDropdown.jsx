import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import NotificationDropdown from "./NotificationDropdown";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orderAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  Package,
  Truck,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";

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

const calculateItemsTotal = (order) => {
  if (!order?.items) return 0;
  return order.items.reduce((sum, item) => {
    const addonTotal =
      item.addOns?.reduce((a, addon) => a + (addon.price || 0), 0) || 0;
    return sum + (item.price + addonTotal) * item.quantity;
  }, 0);
};

export default function RiderNotificationDropdown(props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const orderId = selectedNotification?.orderId;

  const {
    data: orderData,
    isLoading: orderLoading,
    isError: orderError,
  } = useQuery({
    queryKey: ["rider-notification-order", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await orderAPI.getOrderById(orderId);
      return res.order || res.data;
    },
    enabled: !!orderId && dialogOpen,
    staleTime: 1000 * 5,
  });

  const { mutate: acceptOrder, isLoading: acceptLoading } = useMutation({
    mutationFn: async () => {
      if (!orderId || !user?._id) return;
      return await orderAPI.acceptOrder(orderId, user._id);
    },
    onSuccess: () => {
      toast.success("Order accepted successfully!");
      queryClient.invalidateQueries(["orders-waiting-for-rider"]);
      queryClient.invalidateQueries(["rider-active-orders", user?._id]);
      queryClient.invalidateQueries(["notifications", user?._id, "rider"]);
      setDialogOpen(false);
      setSelectedNotification(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.error || "Failed to accept order");
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification?.orderId) {
      toast.info("Order details are not available for this notification.");
      return;
    }
    setSelectedNotification(notification);
    setDialogOpen(true);
  };

  const itemsTotal = useMemo(() => calculateItemsTotal(orderData), [orderData]);

  const acceptDisabled =
    acceptLoading ||
    orderLoading ||
    !orderData ||
    orderData.status !== "waiting_for_rider";

  return (
    <>
      <NotificationDropdown
        {...props}
        onNotificationClick={handleNotificationClick}
      />
      <CustomAlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!acceptLoading) {
            setDialogOpen(open);
            if (!open) {
              setSelectedNotification(null);
            }
          }
        }}
        title={
          selectedNotification
            ? `Order #${selectedNotification.orderId?.slice(-8) || ""}`
            : "Order Details"
        }
        description={
          orderData
            ? `Placed on ${new Date(orderData.createdAt).toLocaleString()}`
            : "Fetching order details..."
        }
        actions={
          <>
            <AlertDialogCancel className="h-10" disabled={acceptLoading}>
              Close
            </AlertDialogCancel>
            <Button
              variant="yellow"
              size="lg"
              loading={acceptLoading}
              disabled={acceptDisabled}
              onClick={() => acceptOrder()}
            >
              {orderData?.status !== "waiting_for_rider"
                ? "Not Available"
                : "Accept Order"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {orderLoading && (
            <div className="text-center text-gray-300 py-6">
              Loading order details...
            </div>
          )}
          {orderError && (
            <div className="text-center text-red-400 py-6">
              Unable to load order details. This order may no longer be
              available.
            </div>
          )}
          {!orderLoading && orderData && (
            <>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-200">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <span>Status: </span>
                  <span className="font-semibold capitalize">
                    {orderData.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <User className="w-4 h-4 text-[#FFC107]" />
                  <span>
                    {orderData.userId?.name || "Unknown Customer"}
                    {orderData.userId?.contactNumber
                      ? ` • ${orderData.userId.contactNumber}`
                      : ""}
                  </span>
                </div>
                <div className="flex items-start gap-2 text-gray-200">
                  <MapPin className="w-4 h-4 text-[#FFC107] mt-1" />
                  <span>{formatAddress(orderData.address)}</span>
                </div>
              </div>

              <div className="border border-[#FFC107]/30 rounded-xl p-3 bg-[#2A2A2A] space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#FFC107]" />
                  Order Items
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {orderData.items.map((item, idx) => (
                    <div
                      key={`${item._id || idx}`}
                      className="bg-[#232323] border border-[#444] rounded-lg p-3 text-sm text-gray-200 space-y-1"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-semibold text-white">
                          {item.productName}
                        </span>
                        <span className="font-semibold text-[#FFC107]">
                          ₱{item.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                      {item.addOns?.length > 0 && (
                        <div className="text-xs text-gray-400">
                          Add-ons:{" "}
                          {item.addOns
                            .map((addon) => addon.name)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center text-white font-semibold text-lg">
                <span>Total</span>
                <span>₱{(orderData.total || itemsTotal).toFixed(2)}</span>
              </div>

              {orderData.status !== "waiting_for_rider" && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  This order is no longer available for acceptance. It may have
                  been assigned to another rider.
                </div>
              )}

              <div className="text-xs text-gray-500 text-center">
                Accepting this order will assign it to you for delivery. Make
                sure you are ready to pick it up promptly.
              </div>
            </>
          )}
        </div>
      </CustomAlertDialog>
    </>
  );
}


