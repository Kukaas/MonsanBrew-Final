import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { reviewAPI } from "@/services/api";
import CustomAlertDialog from "../custom/CustomAlertDialog";
import { AlertDialogCancel } from "../ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";

const ReviewModal = ({
  open,
  onOpenChange,
  order,
  productId,
  onReviewSubmitted,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting review with data:", {
        userId: order.userId,
        productId: productId,
        orderId: order._id,
        rating,
        comment: comment.trim(),
      });

      await reviewAPI.createReview({
        userId: order.userId,
        productId: productId,
        orderId: order._id,
        rating,
        comment: comment.trim(),
        isAnonymous,
      });

      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onOpenChange(false);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit review";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      setIsAnonymous(false);
      onOpenChange(false);
    }
  };

  return (
    <CustomAlertDialog
      open={open}
      onOpenChange={handleClose}
      title="Rate & Review Order"
      description="Share your experience with this order"
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
            disabled={isSubmitting || rating === 0 || !comment.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </>
      }
    >
      <div className="space-y-6 mt-4">
        {/* Rating Stars */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Your Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRating(star);
                }}
                className="focus:outline-none"
                disabled={isSubmitting}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? "fill-[#FFC107] text-[#FFC107]"
                      : "text-gray-500 hover:text-[#FFC107]"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-400">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Review Comment */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300">
            Your Review
          </label>
          <Textarea
            placeholder="Share your experience with this order..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#2A2A2A] border-[#444] text-white placeholder-gray-400 resize-none"
            rows={4}
            maxLength={500}
            disabled={isSubmitting}
          />
          <div className="text-xs text-gray-500 text-right">
            {comment.length}/500
          </div>
        </div>

        {/* Anonymous Review Option */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked)}
              onClick={(e) => e.stopPropagation()}
              className="border-[#444] data-[state=checked]:bg-[#FFC107] data-[state=checked]:border-[#FFC107]"
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium text-gray-300 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              Post review anonymously
            </label>
          </div>
          {isAnonymous && (
            <p className="text-xs text-gray-400">
              Your name will appear as "
              {user?.name
                ? user.name.length <= 2
                  ? user.name.charAt(0) + "*****"
                  : user.name.charAt(0) +
                    "*****" +
                    user.name.charAt(user.name.length - 1)
                : "*****"}
              " instead of your full name
            </p>
          )}
        </div>
      </div>
    </CustomAlertDialog>
  );
};

ReviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
  }).isRequired,
  productId: PropTypes.string.isRequired,
  onReviewSubmitted: PropTypes.func,
};

export default ReviewModal;
