import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { orderAPI } from "@/services/api";
import CustomAlertDialog from "../custom/CustomAlertDialog";
import { AlertDialogCancel } from "../ui/alert-dialog";
import ImageUpload from "../custom/ImageUpload";

const RefundModal = ({ open, onOpenChange, order, onRefundSubmitted }) => {
  const [reason, setReason] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemQuantities, setItemQuantities] = useState({});

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for refund");
      return;
    }

    if (!proofImage) {
      toast.error("Please upload proof image");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to refund");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total refund amount
      const totalRefundAmount = selectedItems.reduce((total, itemIndex) => {
        const item = order.items[itemIndex];
        const quantityToRefund = itemQuantities[itemIndex] || item.quantity;
        const itemTotal =
          (item.price +
            (item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0)) *
          quantityToRefund;
        return total + itemTotal;
      }, 0);

      console.log("Submitting refund request with data:", {
        orderId: order._id,
        reason: reason.trim(),
        refundProofImage: proofImage,
        selectedItems,
        itemQuantities,
        totalRefundAmount,
      });

      await orderAPI.requestRefund(order._id, {
        reason: reason.trim(),
        refundProofImage: proofImage,
        selectedItems,
        itemQuantities,
        totalRefundAmount,
      });

      toast.success("Refund request submitted successfully!");
      setReason("");
      setProofImage("");
      setSelectedItems([]);
      onOpenChange(false);

      if (onRefundSubmitted) {
        onRefundSubmitted();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit refund request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setProofImage("");
      setSelectedItems([]);
      setItemQuantities({});
      onOpenChange(false);
    }
  };

  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={handleClose}
      title="Request Refund"
      description="Please provide details about your refund request"
      actions={
        <>
          <AlertDialogCancel className="h-10" disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="yellow"
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
            disabled={
              isSubmitting ||
              !reason.trim() ||
              !proofImage ||
              selectedItems.length === 0
            }
          >
            {isSubmitting ? "Submitting..." : "Submit Refund Request"}
          </Button>
        </>
      }
    >
      <div className="space-y-6 mt-4">
        {/* Item Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Select Items to Refund
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar px-2">
            {order.items.map((item, index) => {
              const isSelected = selectedItems.includes(index);
              const quantityToRefund = itemQuantities[index] || item.quantity;
              const itemTotal =
                (item.price +
                  (item.addOns?.reduce((sum, addon) => sum + addon.price, 0) ||
                    0)) *
                quantityToRefund;

              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isSelected
                      ? "bg-yellow-900/20 border-yellow-600/50"
                      : "bg-[#2A2A2A] border-[#444]"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems([...selectedItems, index]);
                        // Set default quantity to full quantity when selecting
                        setItemQuantities((prev) => ({
                          ...prev,
                          [index]: item.quantity,
                        }));
                      } else {
                        setSelectedItems(
                          selectedItems.filter((i) => i !== index)
                        );
                        // Remove quantity when deselecting
                        setItemQuantities((prev) => {
                          const newQuantities = { ...prev };
                          delete newQuantities[index];
                          return newQuantities;
                        });
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="border-[#444] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.productName}
                        className="w-8 h-8 object-contain rounded bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                          {item.addOns?.length > 0 && (
                            <span className="ml-1">
                              + ₱
                              {item.addOns
                                .reduce((sum, addon) => sum + addon.price, 0)
                                .toFixed(2)}
                            </span>
                          )}
                        </p>
                        {isSelected && item.quantity > 1 && (
                          <div className="mt-2 flex items-center gap-2">
                            <label className="text-xs text-gray-300">
                              Refund Qty:
                            </label>
                            <Select
                              value={quantityToRefund.toString()}
                              onValueChange={(value) => {
                                const newQuantity = parseInt(value);
                                setItemQuantities((prev) => ({
                                  ...prev,
                                  [index]: newQuantity,
                                }));
                              }}
                            >
                              <SelectTrigger className="text-xs bg-[#2A2A2A] border-[#444] text-white h-6 w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#2A2A2A] border-[#444] text-white">
                                {Array.from(
                                  { length: item.quantity },
                                  (_, i) => i + 1
                                ).map((qty) => (
                                  <SelectItem key={qty} value={qty.toString()}>
                                    {qty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-gray-400">
                              of {item.quantity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-[#FFC107]">
                    ₱{itemTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedItems.length > 0 && (
            <div className="text-sm text-gray-300">
              Total Refund Amount: ₱
              {selectedItems
                .reduce((total, itemIndex) => {
                  const item = order.items[itemIndex];
                  const quantityToRefund =
                    itemQuantities[itemIndex] || item.quantity;
                  const itemTotal =
                    (item.price +
                      (item.addOns?.reduce(
                        (sum, addon) => sum + addon.price,
                        0
                      ) || 0)) *
                    quantityToRefund;
                  return total + itemTotal;
                }, 0)
                .toFixed(2)}
            </div>
          )}
        </div>

        {/* Refund Reason */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Reason for Refund
          </label>
          <Textarea
            placeholder="Please explain why you're requesting a refund..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#2A2A2A] border-[#444] text-white placeholder-gray-400 resize-none"
            rows={4}
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 text-right">
            {reason.length}/500
          </div>
        </div>

        {/* Proof Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Proof Image
          </label>
          <div className="text-xs text-gray-400 mb-2">
            Please upload a photo showing the condition of your order (e.g.,
            uneaten food, damaged items, etc.)
          </div>
          <ImageUpload
            label=""
            value={proofImage}
            onChange={setProofImage}
            disabled={isSubmitting}
            variant="dark"
          />
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-yellow-400 text-sm mt-0.5">⚠️</div>
            <div className="text-xs text-yellow-200">
              <p className="font-medium mb-1">Important:</p>
              <ul className="space-y-1 text-yellow-100">
                <li>• Only completed orders can request refunds</li>
                <li>• Provide clear photos showing the issue</li>
                <li>• Refund requests are reviewed by our team</li>
                <li>• You&apos;ll be notified of the decision via email</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </CustomAlertDialog>
  );
};

RefundModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      productName: PropTypes.string.isRequired,
      image: PropTypes.string,
      price: PropTypes.number.isRequired,
      quantity: PropTypes.number.isRequired,
      addOns: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
      })),
    })).isRequired,
  }).isRequired,
  onRefundSubmitted: PropTypes.func,
};

export default RefundModal;
