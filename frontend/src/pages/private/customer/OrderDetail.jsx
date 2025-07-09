import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Phone, Clock, CreditCard, Package } from 'lucide-react';
import CustomerLayout from '@/layouts/CustomerLayout';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { toast } from 'sonner';

export default function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch single order details using Tanstack Query
    const { data: order, error, isLoading } = useQuery({
        queryKey: ['order', orderId],
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
            console.error('Error fetching order:', error);
            toast.error('Failed to fetch order details');
        }
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAddress = (address) => {
        if (!address) return 'No address provided';
        const parts = [
            address.lotNo,
            address.purok,
            address.street,
            address.barangay,
            address.municipality,
            address.province
        ].filter(Boolean);
        return parts.join(', ');
    };

    const calculateItemTotal = (item) => {
        const addonPrice = item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
        return (item.price + addonPrice) * item.quantity;
    };

    if (isLoading) {
        return (
            <CustomerLayout>
                <div className="min-h-screen bg-[#232323] flex flex-col items-center py-10 px-4">
                    <div className="w-full max-w-4xl">
                        <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                            <div className="h-8 bg-gray-200 rounded mb-4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
                                <div className="h-20 bg-gray-200 rounded"></div>
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
                                <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
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
                <h1 className="text-xl font-extrabold text-white flex-1 text-center mr-8">Order Details</h1>
            </div>

            {/* Order ID */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6 mt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-base sm:text-lg text-[#232323]">Order #{order._id?.slice(-8)}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={16} />
                            <span>Ordered on {formatDate(order.createdAt)}</span>
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>
                {order.status === 'cancelled' && order.cancellationReason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-red-700 font-medium">Cancellation Reason:</p>
                        <p className="text-red-600 text-sm">{order.cancellationReason}</p>
                    </div>
                )}
            </div>

            {/* Order Items */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
                <div className="font-bold text-base sm:text-lg text-[#232323]">Order Items</div>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                            <img
                                src={item.image || '/placeholder.png'}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-lg border mb-2 sm:mb-0"
                            />
                            <div className="flex-1 min-w-0 w-full">
                                <div className="font-bold text-base sm:text-lg text-[#232323] truncate">{item.productName}</div>
                                {item.size && <div className="text-xs text-gray-500 font-semibold">Size: {item.size}</div>}
                                {item.addOns && item.addOns.length > 0 && (
                                    <div className="text-xs text-[#FFC107] font-bold truncate">
                                        Add-ons: {item.addOns.map(addon => addon.name).join(', ')}
                                    </div>
                                )}
                                <div className="text-[#232323] text-sm sm:text-base font-bold">Qty: {item.quantity}</div>
                            </div>
                            <div className="text-base sm:text-lg font-bold text-[#232323] mt-2 sm:mt-0">
                                ₱ {calculateItemTotal(item).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
                <div className="font-bold text-base sm:text-lg text-[#232323] flex items-center gap-2">
                    <CreditCard size={20} />
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

            {/* Delivery Address */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-6">
                <div className="font-bold text-base sm:text-lg text-[#232323] flex items-center gap-2">
                    <MapPin size={20} />
                    Delivery Address
                </div>
                <div className="space-y-2">
                    {order.address?.contactNumber && (
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-gray-500" />
                            <span className="text-sm">{order.address.contactNumber}</span>
                        </div>
                    )}
                    <p className="text-sm text-gray-700">
                        {formatAddress(order.address)}
                    </p>
                    {order.address?.landmark && (
                        <p className="text-sm text-gray-600 italic">
                            Landmark: {order.address.landmark}
                        </p>
                    )}
                    {order.deliveryInstructions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-700 font-medium text-sm">Delivery Instructions:</p>
                            <p className="text-yellow-600 text-sm">{order.deliveryInstructions}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-4 sm:p-6 shadow flex flex-col gap-4 mb-8">
                <div className="font-bold text-base sm:text-lg text-[#232323]">Order Summary</div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Items Total</span>
                        <span className="font-medium">₱{order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">₱0.00</span>
                    </div>
                    <hr className="my-2 border-gray-300" />
                    <div className="flex justify-between text-2xl font-extrabold text-[#232323]">
                        <span>Total</span>
                        <span>₱{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
