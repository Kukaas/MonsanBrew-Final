import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, MapPin, CreditCard, Clock, Package, Truck, Camera } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor, getStatusLabel, getStatusIcon, getStatusTextColor } from "@/lib/utils";
import StatusBadge from '@/components/custom/StatusBadge';

export default function OrderDetails() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const { data: order, isLoading, error } = useQuery({
        queryKey: ["admin-order", orderId],
        queryFn: async () => {
            const res = await orderAPI.getOrderById(orderId);
            return res.data?.order || res.order || res;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    if (isLoading) return (
        <AdminLayout>
            <PageLayout title="Order Details" description="View comprehensive order information and manage status.">
                <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded" />
                </div>
                <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-4 sm:p-8 md:p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 items-stretch shadow-2xl backdrop-blur-md">
                    {/* Order Info section */}
                    <div className="flex-shrink-0 flex flex-col w-full md:w-[350px] lg:w-[500px]">
                        <div className="bg-[#232323] rounded-2xl border-4 border-[#FFC107] p-6">
                            <Skeleton className="h-8 w-48 mb-6 rounded" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-64 rounded" />
                                <Skeleton className="h-6 w-48 rounded" />
                                <Skeleton className="h-6 w-56 rounded" />
                                <Skeleton className="h-6 w-40 rounded" />
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Skeleton className="h-10 w-32 rounded" />
                            <Skeleton className="h-10 w-32 rounded" />
                        </div>
                    </div>
                    {/* Details section */}
                    <div className="flex-1 flex flex-col gap-8 md:gap-12 justify-center">
                        <div>
                            <Skeleton className="h-8 w-48 mb-6 rounded" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-64 rounded" />
                                <Skeleton className="h-6 w-48 rounded" />
                                <Skeleton className="h-6 w-56 rounded" />
                            </div>
                        </div>
                        <div className="border-t border-[#232323] my-4" />
                        <div>
                            <Skeleton className="h-8 w-48 mb-6 rounded" />
                            <div className="space-y-3">
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </AdminLayout>
    );

    if (error) return (
        <AdminLayout>
            <PageLayout title="Order Details" description="View comprehensive order information and manage status.">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="yellow" size="icon" className="shadow-lg hover:scale-105 transition-transform duration-200" onClick={() => navigate('/admin/orders')}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-extrabold text-2xl text-white tracking-wide">Go back</span>
                </div>
                <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-12 rounded-3xl border border-[#232323] flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <div className="text-center">
                        <h3 className="text-[#FFC107] text-2xl font-extrabold mb-4">Order Not Found</h3>
                        <p className="text-[#BDBDBD] text-lg">The order you're looking for doesn't exist or has been removed.</p>
                    </div>
                </div>
            </PageLayout>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <PageLayout title="Order Details" description="View comprehensive order information and manage status.">
                <div className="mb-8 flex items-center gap-4">
                    <Button variant="yellow" size="icon" className="shadow-lg hover:scale-105 transition-transform duration-200" onClick={() => navigate('/admin/orders')}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <span className="font-extrabold text-2xl text-white tracking-wide">Go back</span>
                </div>
                <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-12 md:gap-20 items-stretch shadow-2xl backdrop-blur-md">
                    {/* Order Items section - LEFT SIDE */}
                    <div className="flex-1 flex flex-col">
                        {/* Order Items - HIGHLIGHTED AS MOST IMPORTANT */}
                        <div className="bg-gradient-to-br from-[#FFC107]/10 to-[#FFD600]/5 border-2 border-[#FFC107]/30 rounded-2xl p-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-[#FFC107] p-3 rounded-full">
                                    <Package className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-[#FFC107] text-3xl font-extrabold tracking-widest uppercase drop-shadow-lg">Order Items</h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
                            </div>
                            {order.items && order.items.length > 0 ? (
                                <div className="space-y-6">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm">
                                            <div className="flex items-start gap-6">
                                                {item.productId?.image && (
                                                    <div className="flex-shrink-0">
                                                        <img
                                                            src={item.productId.image}
                                                            alt={item.productName || item.productId?.name}
                                                            className="w-24 h-24 object-cover rounded-xl border-3 border-[#FFC107] shadow-lg"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="text-white font-bold text-2xl leading-tight">{item.productName || item.productId?.name}</h4>
                                                        <div className="text-right">
                                                            <div className="bg-[#FFC107] text-black px-4 py-2 rounded-full font-bold text-xl shadow-lg">
                                                                ₱{item.price?.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        {item.size && (
                                                            <div className="bg-[#232323] rounded-lg p-3 border border-[#444]">
                                                                <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">Size</span>
                                                                <span className="text-white font-medium text-lg">{item.size}</span>
                                                            </div>
                                                        )}
                                                        <div className="bg-[#232323] rounded-lg p-3 border border-[#444]">
                                                            <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">Quantity</span>
                                                            <span className="text-white font-medium text-lg">{item.quantity}</span>
                                                        </div>
                                                        <div className="bg-[#232323] rounded-lg p-3 border border-[#444]">
                                                            <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">Total</span>
                                                            <span className="text-white font-medium text-lg">₱{(item.price * item.quantity)?.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    {item.addOns && item.addOns.length > 0 && (
                                                        <div className="bg-[#232323]/60 rounded-lg p-4 border border-[#444]">
                                                            <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block mb-2">Add-ons</span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.addOns.map((addon, addonIdx) => (
                                                                    <span key={addonIdx} className="bg-[#FFC107]/20 text-[#FFC107] px-3 py-1 rounded-full text-sm font-medium border border-[#FFC107]/30">
                                                                        {addon.name} {addon.price && `(+₱${addon.price})`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Order Total Summary */}
                                    <div className="border-t-2 border-[#FFC107]/30 pt-6 mt-8">
                                        <div className="flex justify-between items-center bg-[#232323] rounded-xl p-6 border-2 border-[#FFC107]">
                                            <span className="text-[#FFC107] font-bold text-2xl uppercase tracking-wide">Order Total:</span>
                                            <span className="text-[#FFC107] font-extrabold text-3xl">₱{order.total?.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Delivery Proof Image */}
                                    {order.deliveryProofImage && order.status === 'completed' && (
                                        <div className="border-t-2 border-[#FFC107]/30 pt-6 mt-8">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="bg-[#FFC107] p-3 rounded-full">
                                                    <Camera className="w-8 h-8 text-black" />
                                                </div>
                                                <h3 className="text-[#FFC107] text-3xl font-extrabold tracking-widest uppercase drop-shadow-lg">Delivery Proof</h3>
                                                <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
                                            </div>
                                            <div className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm">
                                                <div className="bg-[#232323] rounded-xl p-4 border border-[#444]">
                                                    <img
                                                        src={order.deliveryProofImage}
                                                        alt="Delivery Proof"
                                                        className="w-full h-64 object-cover rounded-lg border border-[#444]"
                                                    />
                                                </div>
                                                <div className="text-center mt-4">
                                                    <span className="text-gray-400 text-sm">Proof of delivery uploaded by rider</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Package className="w-16 h-16 text-[#BDBDBD] mx-auto mb-4" />
                                    <span className="text-[#BDBDBD] text-xl">No items found</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Order Info and Details section - RIGHT SIDE */}
                    <div className="flex-shrink-0 flex flex-col w-full md:w-[500px] gap-12">
                        {/* Order Summary Card */}
                        <div className="relative bg-gradient-to-br from-[#232323] to-[#1a1a1a] rounded-2xl border-4 border-[#FFC107] p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Package className="w-8 h-8 text-[#FFC107]" />
                                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Order #{order._id?.substring(0, 8)}</h3>
                            </div>
                            <div className="space-y-4 text-lg">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-[#FFC107]" />
                                    <div>
                                        <span className="font-bold text-[#FFC107]">Customer: </span>
                                        <span className="text-white font-medium">{order.userId?.name || 'Unknown'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-[#FFC107]" />
                                    <div>
                                        <span className="font-bold text-[#FFC107]">Ordered: </span>
                                        <span className="text-white font-medium">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-[#FFC107]" />
                                    <div>
                                        <span className="font-bold text-[#FFC107]">Total: </span>
                                        <span className="text-white font-medium text-xl">₱{order.total?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Badge className={`${getStatusColor(order.status)} border rounded-full px-6 py-3 text-lg font-semibold shadow-md`}>
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(order.status)} {getStatusLabel(order.status)}
                                    </span>
                                </Badge>
                                <StatusBadge status={order.paymentMethod} />
                            </div>
                            {order.cancellationReason && (
                                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <h4 className="text-red-400 font-semibold mb-2">Cancellation Reason:</h4>
                                    <p className="text-red-300">{order.cancellationReason}</p>
                                </div>
                            )}
                        </div>
                        {/* Customer Info */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <User className="w-7 h-7 text-[#FFC107]" />
                                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Customer Information</h3>
                            </div>
                            <div className="space-y-5 text-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
                                    <div>
                                        <span className="font-bold text-[#FFC107] block mb-1">Name:</span>
                                        <span className="text-white font-medium">{order.userId?.name || 'Unknown'}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-[#FFC107] block mb-1">Contact:</span>
                                        <span className="text-white font-medium">{order.address?.contactNumber || 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="font-bold text-[#FFC107] block mb-1">Email:</span>
                                    <span className="text-white font-medium break-all">{order.userId?.email || 'Unknown'}</span>
                                </div>
                                {order.paymentMethod === 'gcash' && order.referenceNumber && (
                                    <div>
                                        <span className="font-bold text-[#FFC107] block mb-1">Reference #:</span>
                                        <span className="text-white font-medium">{order.referenceNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rider Information */}
                        {(order.riderId || order.status === 'waiting_for_rider' || order.status === 'out_for_delivery' || order.status === 'completed') && (
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Truck className="w-7 h-7 text-[#FFC107]" />
                                    <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Rider Information</h3>
                                </div>
                                <div className="space-y-5 text-lg">
                                    {order.riderId ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
                                                <div>
                                                    <span className="font-bold text-[#FFC107] block mb-1">Name:</span>
                                                    <span className="text-white font-medium">{order.riderId.name || 'Unknown'}</span>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-[#FFC107] block mb-1">Contact:</span>
                                                    <span className="text-white font-medium">{order.riderId.contactNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-bold text-[#FFC107] block mb-1">Email:</span>
                                                <span className="text-white font-medium break-all">{order.riderId.email || 'Unknown'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <span className="text-gray-400 font-medium">No rider assigned yet</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}



                        <div className="border-t border-[#232323] my-4" />
                        {/* Delivery Address */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <MapPin className="w-7 h-7 text-[#FFC107]" />
                                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Delivery Address</h3>
                            </div>
                            <div className="text-lg text-white">
                                <p className="font-medium">
                                    {order.address?.lotNo && `${order.address.lotNo}, `}
                                    {order.address?.purok && `${order.address.purok}, `}
                                    {order.address?.street && `${order.address.street}, `}
                                    {order.address?.barangay && `${order.address.barangay}, `}
                                    {order.address?.municipality && `${order.address.municipality}, `}
                                    {order.address?.province}
                                </p>
                                {order.address?.landmark && (
                                    <p className="mt-2 text-[#BDBDBD]">
                                        <span className="font-bold text-[#FFC107]">Landmark: </span>
                                        {order.address.landmark}
                                    </p>
                                )}
                                {order.deliveryInstructions && (
                                    <p className="mt-2 text-[#BDBDBD]">
                                        <span className="font-bold text-[#FFC107]">Instructions: </span>
                                        {order.deliveryInstructions}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Payment Proof */}
                        {order.paymentMethod === 'gcash' && order.proofImage && (
                            <>
                                <div className="border-t border-[#232323] my-4" />
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <CreditCard className="w-7 h-7 text-[#FFC107]" />
                                        <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">Payment Proof</h3>
                                    </div>
                                    <div className="bg-[#232323] rounded-xl p-6 border border-[#333]">
                                        <img
                                            src={order.proofImage}
                                            alt="Payment Proof"
                                            className="max-w-full h-auto rounded-lg border-2 border-[#FFC107]"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </PageLayout>
        </AdminLayout>
    );
}
