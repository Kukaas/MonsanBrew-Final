import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import OrderStatusBadge from './OrderStatusBadge';
import CustomAlertDialog from '../custom/CustomAlertDialog';
import ReviewModal from '../reviews/ReviewModal';
import { orderAPI } from '@/services/api';

const OrderCard = ({ order, onOrderUpdate }) => {
    const navigate = useNavigate();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Use mutation for cancelling orders, similar to ProductDetail.jsx pattern
    const cancelOrderMutation = useMutation({
        mutationFn: async ({ orderId, reason }) => {
            return await orderAPI.cancelOrder(orderId, reason);
        },
        onSuccess: () => {
            toast.success('Order cancelled successfully');
            setShowCancelModal(false);
            setCancellationReason('');
            setCancelLoading(false);
            // Notify parent component to refresh orders
            if (onOrderUpdate) {
                onOrderUpdate();
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to cancel order');
            setCancelLoading(false);
        }
    });

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        setCancelLoading(true);
        cancelOrderMutation.mutate({
            orderId: order._id,
            reason: cancellationReason
        });
    };

    const canCancelOrder = order.status === 'pending' && order.paymentMethod === 'cod';

    const handleCardClick = () => {
        navigate(`/order/${order._id}`);
    };

    const handleButtonClick = (e) => {
        e.stopPropagation(); // Prevent card click when clicking buttons
    };

    return (
        <Card
            className="mb-4 bg-white border border-gray-200 shadow-sm rounded-2xl cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Order #{order._id?.slice(-8)}</span>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="space-y-3">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                                src={item.image || '/placeholder.png'}
                                alt={item.productName}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-800">{item.productName}</div>
                                {item.size && <div className="text-xs text-gray-500">Size: {item.size}</div>}
                                {item.addOns && item.addOns.length > 0 && (
                                    <div className="text-xs text-[#FFC107] font-medium">
                                        Add-ons: {item.addOns.map(addon => addon.name).join(', ')}
                                    </div>
                                )}
                                <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-sm font-bold text-gray-800">
                                ₱{((item.price + (item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0)) * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Payment: <span className="font-medium">{order.paymentMethod.toUpperCase()}</span>
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

                {order.status === 'completed' && !order.isReviewed && (
                    <div className="mt-3 flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                                handleButtonClick(e);
                                // Use the first item for the review (one review per order)
                                const firstItem = order.items[0];
                                if (firstItem && firstItem.productId) {
                                    // Extract the string ID from productId (handle both string and object cases)
                                    const productIdString = typeof firstItem.productId === 'string' 
                                        ? firstItem.productId 
                                        : firstItem.productId._id || firstItem.productId;
                                    
                                    console.log('Selected product for review:', {
                                        productId: productIdString,
                                        productName: firstItem.productName,
                                        orderItems: order.items.map(item => ({
                                            productId: typeof item.productId === 'string' 
                                                ? item.productId 
                                                : item.productId._id || item.productId,
                                            productName: item.productName
                                        }))
                                    });
                                    setSelectedProductId(productIdString);
                                    setShowReviewModal(true);
                                } else {
                                    toast.error('Product information not found');
                                }
                            }}
                        >
                            Rate & Review Order
                        </Button>
                        <Button
                            variant="yellow"
                            size="sm"
                            className="flex-1"
                            onClick={handleButtonClick}
                        >
                            Buy Again
                        </Button>
                    </div>
                )}

                {order.status === 'completed' && order.isReviewed && (
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
                                onClick={() => {
                                    setShowCancelModal(false);
                                    setCancellationReason('');
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
                                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
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
            </CardContent>
        </Card>
    );
};

export default OrderCard;
