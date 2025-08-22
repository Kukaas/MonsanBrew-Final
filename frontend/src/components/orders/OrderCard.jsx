import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import OrderStatusBadge from "./OrderStatusBadge";
import CustomAlertDialog from "../custom/CustomAlertDialog";
import ReviewModal from "../reviews/ReviewModal";
import RefundModal from "./RefundModal";
import { orderAPI } from "@/services/api";

const OrderCard = ({ order, onOrderUpdate }) => {
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Use mutation for cancelling orders, similar to ProductDetail.jsx pattern
  const cancelOrderMutation = useMutation({
    mutationFn: async ({ orderId, reason }) => {
      return await orderAPI.cancelOrder(orderId, reason);
    },
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
      setCancellationReason("");
      setCancelLoading(false);
      // Notify parent component to refresh orders
      if (onOrderUpdate) {
        onOrderUpdate();
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to cancel order");
      setCancelLoading(false);
    },
  });

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setCancelLoading(true);
    cancelOrderMutation.mutate({
      orderId: order._id,
      reason: cancellationReason,
    });
  };

  const canCancelOrder =
    order.status === "pending" && order.paymentMethod === "cod";

  const canRequestRefund =
    order.status === "completed" &&
    !order.isReviewed &&
    order.refundStatus === "none";

  const handleCardClick = () => {
    navigate(`/order/${order._id}`);
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click when clicking buttons
  };

  return (
    <Card
      className="mb-4 bg-white border border-gray-200 shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={() => {
        if (!showCancelModal && !showReviewModal && !showRefundModal)
          handleCardClick();
      }}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              Order #{order._id?.slice(-8)}
            </span>
            <OrderStatusBadge
              status={
                order.refundStatus === "refund_processed"
                  ? "processed"
                  : order.refundStatus === "refund_rejected"
                  ? "rejected"
                  : order.status
              }
            />
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(order.createdAt)}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 p-4 shadow border-1 border-[#FFC107] rounded-xl"
            >
              <img
                src={item.image || "/placeholder.png"}
                alt={item.productName}
                className="w-20 h-20 object-contain rounded-xl bg-white mb-2 sm:mb-0 shadow"
              />
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-base text-[#232323] truncate">
                    {item.productName}
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.size && (
                      <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                        Size: {item.size}
                      </span>
                    )}
                    {item.addOns && item.addOns.length > 0 && (
                      <span className="text-xs bg-[#FFC107]/20 text-[#FFC107] font-semibold px-2 py-0.5 rounded">
                        Add-ons:{" "}
                        {item.addOns
                          .map(
                            (addon) =>
                              `${addon.name}${
                                addon.price ? ` (+₱${addon.price})` : ""
                              }`
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
              <div className="text-base sm:text-lg font-extrabold text-[#232323] mt-2 sm:mt-0 whitespace-nowrap">
                ₱
                {(
                  (item.price +
                    (item.addOns?.reduce(
                      (sum, addon) => sum + addon.price,
                      0
                    ) || 0)) *
                  item.quantity
                ).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Payment:{" "}
              <span className="font-medium">
                {order.paymentMethod.toUpperCase()}
              </span>
            </div>
            <div className="text-lg font-bold text-[#232323]">
              Total: ₱{order.total.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Conditional buttons based on order status */}
        {canCancelOrder && (
          <div className="mt-3 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={(e) => {
                handleButtonClick(e);
                setShowCancelModal(true);
              }}
            >
              Cancel Order
            </Button>
          </div>
        )}

        {order.status === "completed" && !order.isReviewed && (
          <div className="mt-3 space-y-2">
            <Button
              variant="yellow"
              size="sm"
              className="w-full"
              onClick={(e) => {
                handleButtonClick(e);
                // Use the first item for the review (one review per order)
                const firstItem = order.items[0];
                if (firstItem && firstItem.productId) {
                  // Extract the string ID from productId (handle both string and object cases)
                  const productIdString =
                    typeof firstItem.productId === "string"
                      ? firstItem.productId
                      : firstItem.productId._id || firstItem.productId;
                  setSelectedProductId(productIdString);
                  setShowReviewModal(true);
                } else {
                  toast.error("Product information not found");
                }
              }}
            >
              Rate & Review Order
            </Button>

            {canRequestRefund && (
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
                onClick={(e) => {
                  handleButtonClick(e);
                  setShowRefundModal(true);
                }}
              >
                Request Refund
              </Button>
            )}
          </div>
        )}

        {order.status === "completed" && order.isReviewed && (
          <div className="mt-3">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-700 text-sm font-medium">
                ✓ Order Reviewed
              </span>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        <CustomAlertDialog
          open={showCancelModal}
          onOpenChange={setShowCancelModal}
          title="Cancel Order"
          description="Please provide a reason for cancelling this order."
          actions={
            <>
              <Button
                variant="yellow-outline"
                onClick={(e) => {
                  handleButtonClick(e);
                  setShowCancelModal(false);
                  setCancellationReason("");
                }}
                disabled={cancelLoading}
              >
                Keep Order
              </Button>
              <Button
                variant="yellow"
                onClick={handleCancelOrder}
                disabled={cancelLoading || !cancellationReason.trim()}
              >
                {cancelLoading ? "Cancelling..." : "Cancel Order"}
              </Button>
            </>
          }
        >
          <Textarea
            placeholder="Enter your reason for cancellation..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="mt-4 bg-[#333] border-gray-600 text-white placeholder-gray-400"
            rows={3}
          />
        </CustomAlertDialog>

        {/* Review Modal */}
        <ReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          order={order}
          productId={selectedProductId}
          onReviewSubmitted={onOrderUpdate}
        />

        {/* Refund Modal */}
        <RefundModal
          open={showRefundModal}
          onOpenChange={setShowRefundModal}
          order={order}
          onRefundSubmitted={onOrderUpdate}
        />
      </CardContent>
    </Card>
  );
};

OrderCard.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    isReviewed: PropTypes.bool,
    refundStatus: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      productId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      productName: PropTypes.string.isRequired,
      image: PropTypes.string,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      size: PropTypes.string,
      addOns: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
      })),
    })).isRequired,
  }).isRequired,
  onOrderUpdate: PropTypes.func,
};

export default OrderCard;
