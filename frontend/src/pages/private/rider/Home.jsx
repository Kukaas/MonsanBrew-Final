import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import RiderLayout from '@/layouts/RiderLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Package, User, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { getStatusColor, getStatusLabel, getStatusIcon } from '@/lib/utils';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import { AlertDialogCancel } from '@/components/ui/alert-dialog';

export default function Home() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [acceptingOrder, setAcceptingOrder] = useState(null);
    const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(false);

    // Fetch orders waiting for rider
    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ['orders-waiting-for-rider'],
        queryFn: async () => {
            const response = await orderAPI.getOrdersWaitingForRider();
            return response.orders || [];
        },
        staleTime: 1000 * 30, // 30 seconds
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    // Accept order mutation
    const { mutate: acceptOrder } = useMutation({
        mutationFn: async ({ orderId, riderId }) => {
            return await orderAPI.acceptOrder(orderId, riderId);
        },
        onSuccess: () => {
            toast.success("Order accepted successfully!");
            setAcceptDialogOpen(false);
            setAcceptingOrder(null);
            queryClient.invalidateQueries(['orders-waiting-for-rider']);
            queryClient.invalidateQueries(['rider-orders', user?._id]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || "Failed to accept order";
            toast.error(errorMessage);
            console.error('Accept order error:', error);
            setAcceptDialogOpen(false);
            setAcceptingOrder(null);
        },
        onSettled: () => {
            setAcceptLoading(false);
        }
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    if (isLoading) {
        return (
            <RiderLayout>
                <div className="min-h-screen bg-[#232323] p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white mb-2">Available Orders</h1>
                            <p className="text-gray-400">Orders waiting to be accepted</p>
                        </div>
                        <div className="grid gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="bg-[#2A2A2A] border-[#444] animate-pulse">
                                    <CardContent className="p-6">
                                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-4"></div>
                                        <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </RiderLayout>
        );
    }

    if (error) {
        return (
            <RiderLayout>
                <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
                        <Package size={80} strokeWidth={2.5} className="mb-4 text-red-500" />
                        <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">Error Loading Orders</div>
                        <div className="text-gray-500 mb-6 text-center">Failed to load available orders. Please try again.</div>
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
                        <h1 className="text-2xl font-bold text-white mb-2">Available Orders</h1>
                        <p className="text-gray-400">Orders waiting to be accepted</p>
                    </div>

                    {orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md mx-auto">
                            <Package size={80} strokeWidth={2.5} className="mb-4" style={{ color: '#FFC107', filter: 'drop-shadow(0 0 8px #FFC10788)' }} />
                            <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">No Orders Available</div>
                            <div className="text-gray-500 mb-6 text-center">There are currently no orders waiting to be accepted.</div>
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
                            {orders.map((order) => (
                                <Card key={order._id} className="bg-[#2A2A2A] border-[#444] hover:border-[#FFC107] transition-colors">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-white text-lg">
                                                    Order #{order._id.substring(0, 8)}...
                                                </CardTitle>
                                                <p className="text-gray-400 text-sm">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </div>
                                            <Badge className={`${getStatusColor(order.status)} border rounded-full px-3 py-1 text-xs font-medium`}>
                                                {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Customer Info */}
                                        <div className="flex items-center gap-2 text-white">
                                            <User className="w-4 h-4 text-[#FFC107]" />
                                            <span className="font-medium">{order.userId?.name || 'Unknown Customer'}</span>
                                        </div>

                                        {/* Contact Info */}
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Phone className="w-4 h-4 text-[#FFC107]" />
                                            <span>{order.userId?.contactNumber || order.address?.contactNumber || 'No contact number'}</span>
                                        </div>

                                        {/* Address */}
                                        <div className="flex items-start gap-2 text-gray-300">
                                            <MapPin className="w-4 h-4 text-[#FFC107] mt-0.5" />
                                            <span className="text-sm">{formatAddress(order.address)}</span>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-white">
                                                <Package className="w-4 h-4 text-[#FFC107]" />
                                                <span className="font-medium">Order Items:</span>
                                            </div>
                                            <div className="ml-6 space-y-1">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="text-gray-300 text-sm">
                                                        • {item.quantity}x {item.productName} - ₱{item.price}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center pt-2 border-t border-[#444]">
                                            <span className="text-white font-bold">Total: ₱{order.total?.toFixed(2)}</span>
                                            <Button
                                                variant="yellow"
                                                size="sm"
                                                onClick={() => {
                                                    setAcceptingOrder(order);
                                                    setAcceptDialogOpen(true);
                                                }}
                                                disabled={acceptLoading}
                                            >
                                                <Truck className="w-4 h-4 mr-2" />
                                                Accept Order
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Accept Order Dialog */}
                <CustomAlertDialog
                    open={acceptDialogOpen}
                    onOpenChange={acceptLoading ? undefined : setAcceptDialogOpen}
                    title="Accept Order"
                    description={`Are you sure you want to accept order #${acceptingOrder?._id?.substring(0, 8)}...? This will assign the order to you for delivery.`}
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={acceptLoading}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                variant="yellow"
                                size="lg"
                                loading={acceptLoading}
                                disabled={acceptLoading}
                                onClick={() => {
                                    setAcceptLoading(true);
                                    acceptOrder({
                                        orderId: acceptingOrder._id,
                                        riderId: user._id,
                                    });
                                }}
                            >
                                {acceptLoading ? 'Accepting...' : 'Accept Order'}
                            </Button>
                        </>
                    }
                />
            </div>
        </RiderLayout>
    );
} 