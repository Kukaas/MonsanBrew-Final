import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import RiderLayout from '@/layouts/RiderLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Package, User, CheckCircle, Camera } from 'lucide-react';
import { getStatusColor, getStatusLabel, getStatusIcon } from '@/lib/utils';
import { toast } from 'sonner';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from '@/components/custom/ImageUpload';

export default function Orders() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [completingOrder, setCompletingOrder] = useState(null);
    const [deliveryProofImage, setDeliveryProofImage] = useState('');
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const [completeLoading, setCompleteLoading] = useState(false);

    // Fetch rider's active orders (out for delivery)
    const { data: activeOrders = [], isLoading: activeLoading, error: activeError } = useQuery({
        queryKey: ['rider-active-orders', user?._id],
        queryFn: async () => {
            if (!user?._id) return [];
            const response = await orderAPI.getOrdersByRider(user._id);
            return (response.orders || []).filter(order => order.status === 'out_for_delivery');
        },
        enabled: !!user?._id,
        staleTime: 1000 * 30, // 30 seconds
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    // Fetch rider's completed orders
    const { data: completedOrders = [], isLoading: completedLoading, error: completedError } = useQuery({
        queryKey: ['rider-completed-orders', user?._id],
        queryFn: async () => {
            if (!user?._id) return [];
            const response = await orderAPI.getOrdersByRider(user._id);
            return (response.orders || []).filter(order => order.status === 'completed');
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
            setDeliveryProofImage('');
            queryClient.invalidateQueries(['rider-active-orders', user?._id]);
            queryClient.invalidateQueries(['rider-completed-orders', user?._id]);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || "Failed to complete order";
            toast.error(errorMessage);
            console.error('Complete order error:', error);
            setCompleteDialogOpen(false);
            setCompletingOrder(null);
            setDeliveryProofImage('');
        },
        onSettled: () => {
            setCompleteLoading(false);
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

    const handleImageUpload = (base64Image) => {
        setDeliveryProofImage(base64Image);
    };

    const handleCompleteOrder = () => {
        if (!deliveryProofImage) {
            toast.error('Please upload a delivery proof image');
            return;
        }
        setCompleteLoading(true);
        completeOrder({
            orderId: completingOrder._id,
            riderId: user._id,
            deliveryProofImage,
        });
    };

    const renderOrderCard = (order, isActive = false) => (
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-[#444]">
                    <span className="text-white font-bold">Total: ₱{order.total?.toFixed(2)}</span>
                    {isActive ? (
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
                    ) : (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30 rounded-full px-3 py-1 text-xs font-medium w-full sm:w-auto text-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Delivered
                        </Badge>
                    )}
                </div>

                {/* Delivery Proof Image (for completed orders) */}
                {order.deliveryProofImage && (
                    <div className="pt-2 border-t border-[#444]">
                        <div className="flex items-center gap-2 text-white mb-2">
                            <Camera className="w-4 h-4 text-[#FFC107]" />
                            <span className="font-medium">Delivery Proof:</span>
                        </div>
                        <img
                            src={order.deliveryProofImage}
                            alt="Delivery Proof"
                            className="w-full h-32 object-cover rounded-lg border border-[#444]"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );

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

    if (activeError || completedError) {
        return (
            <RiderLayout>
                <div className="min-h-screen bg-[#232323] flex flex-col items-center justify-center py-10 px-2">
                    <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md w-full">
                        <CheckCircle size={80} strokeWidth={2.5} className="mb-4 text-red-500" />
                        <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">Error Loading Orders</div>
                        <div className="text-gray-500 mb-6 text-center">Failed to load your orders. Please try again.</div>
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
                        <h1 className="text-2xl font-bold text-white mb-2">My Orders</h1>
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
                                    <Package size={80} strokeWidth={2.5} className="mb-4" style={{ color: '#FFC107', filter: 'drop-shadow(0 0 8px #FFC10788)' }} />
                                    <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">No Active Orders</div>
                                    <div className="text-gray-500 mb-6 text-center">You don't have any orders currently out for delivery.</div>
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
                                    {activeOrders.map((order) => renderOrderCard(order, true))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="completed" className="mt-6">
                            {completedOrders.length === 0 ? (
                                <div className="bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-10 max-w-md mx-auto">
                                    <CheckCircle size={80} strokeWidth={2.5} className="mb-4" style={{ color: '#FFC107', filter: 'drop-shadow(0 0 8px #FFC10788)' }} />
                                    <div className="text-2xl font-extrabold text-[#232323] mb-2 text-center">No Completed Orders</div>
                                    <div className="text-gray-500 mb-6 text-center">You haven't completed any orders yet.</div>
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
                                    {completedOrders.map((order) => renderOrderCard(order, false))}
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
                    description={`Upload a photo as proof of delivery for order #${completingOrder?._id?.substring(0, 8)}...`}
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={completeLoading}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                variant="yellow"
                                size="lg"
                                loading={completeLoading}
                                disabled={completeLoading || !deliveryProofImage}
                                onClick={handleCompleteOrder}
                            >
                                {completeLoading ? 'Completing...' : 'Complete Order'}
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