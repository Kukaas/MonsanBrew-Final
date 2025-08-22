import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderAPI } from "@/services/api";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  MapPin,
  CreditCard,
  Clock,
  Package,
  RotateCcw,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/custom/StatusBadge";
import ImageDisplay from "@/components/custom/ImageDisplay";
import DeliveryNavigation from "@/components/custom/DeliveryNavigation";

export default function RefundDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-refund", orderId],
    queryFn: async () => {
      const res = await orderAPI.getOrderById(orderId);
      return res.data?.order || res.order || res;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const getRefundStatusLabel = (status) => {
    switch (status) {
      case "refund_requested":
        return "Requested";
      case "refund_approved":
        return "Approved";
      case "refund_rejected":
        return "Rejected";
      case "refund_processed":
        return "Processed";
      default:
        return status;
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case "refund_requested":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "refund_approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "refund_rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refund_processed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRefundStatusIcon = (status) => {
    switch (status) {
      case "refund_requested":
        return <AlertTriangle className="w-5 h-5" />;
      case "refund_approved":
        return <CheckCircle className="w-5 h-5" />;
      case "refund_rejected":
        return <XCircle className="w-5 h-5" />;
      case "refund_processed":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (isLoading)
    return (
      <AdminLayout>
        <PageLayout
          title="Refund Details"
          description="View comprehensive refund information and manage status."
        >
          <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-8 w-32 rounded" />
          </div>
          <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-4 sm:p-8 md:p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-20 items-stretch shadow-2xl backdrop-blur-md">
            {/* Order Items section */}
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

  if (error || !order)
    return (
      <AdminLayout>
        <PageLayout
          title="Refund Details"
          description="View comprehensive refund information and manage status."
        >
          <div className="mb-8 flex items-center gap-4">
            <Button
              variant="yellow"
              size="icon"
              className="shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/admin/refunds")}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <span className="font-extrabold text-2xl text-white tracking-wide">
              Go back
            </span>
          </div>
          <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-12 rounded-3xl border border-[#232323] flex items-center justify-center shadow-2xl backdrop-blur-md">
            <div className="text-center">
              <h3 className="text-[#FFC107] text-2xl font-extrabold mb-4">
                Refund Not Found
              </h3>
              <p className="text-[#BDBDBD] text-lg">
                The refund you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
            </div>
          </div>
        </PageLayout>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <PageLayout
        title="Refund Details"
        description="View comprehensive refund information and manage status."
      >
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="yellow"
            size="icon"
            className="shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={() => navigate("/admin/refunds")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <span className="font-extrabold text-2xl text-white tracking-wide">
            Go back
          </span>
        </div>
        <div className="w-full max-w-7xl mx-auto bg-[#181818]/80 p-12 rounded-3xl border border-[#232323] flex flex-col md:flex-row gap-12 md:gap-20 items-stretch shadow-2xl backdrop-blur-md">
          {/* Refund Items section - LEFT SIDE */}
          <div className="flex-1 flex flex-col">
            {/* Refund Information - HIGHLIGHTED AS MOST IMPORTANT */}
            <div className="bg-gradient-to-br from-[#FFC107]/10 to-[#FFD600]/5 border-2 border-[#FFC107]/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-[#FFC107] p-3 rounded-full">
                  <RotateCcw className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-[#FFC107] text-3xl font-extrabold tracking-widest uppercase drop-shadow-lg">
                  Refund Information
                </h3>
                <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
              </div>

              {/* Refund Status */}
              <div className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-white font-bold text-2xl">
                    Refund Status
                  </h4>
                  <Badge
                    className={`${getRefundStatusColor(
                      order.refundStatus
                    )} border rounded-full px-6 py-3 text-lg font-semibold shadow-lg`}
                  >
                    <span className="flex items-center gap-2">
                      {getRefundStatusIcon(order.refundStatus)}{" "}
                      {getRefundStatusLabel(order.refundStatus)}
                    </span>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#232323] rounded-lg p-4 border border-[#444]">
                    <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block mb-2">
                      Refund Amount
                    </span>
                    <span className="text-white font-bold text-2xl">
                      ₱{order.refundAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <div className="bg-[#232323] rounded-lg p-4 border border-[#444]">
                    <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block mb-2">
                      Request Date
                    </span>
                    <span className="text-white font-medium text-lg">
                      {new Date(
                        order.refundRequestDate || order.createdAt
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {order.refundReason && (
                  <div className="mt-6 bg-[#232323] rounded-lg p-4 border border-[#444]">
                    <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block mb-2">
                      Refund Reason
                    </span>
                    <p className="text-white text-lg leading-relaxed">
                      {order.refundReason}
                    </p>
                  </div>
                )}

                {order.refundRejectionMessage && (
                  <div className="mt-6 bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <span className="text-red-400 font-semibold text-sm uppercase tracking-wide block mb-2">
                      Rejection Reason
                    </span>
                    <p className="text-red-300 text-lg leading-relaxed">
                      {order.refundRejectionMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Refunded Items */}
              {order.refundItems && order.refundItems.length > 0 && (
                <div className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#FFC107] p-3 rounded-full">
                      <Package className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase drop-shadow-lg">
                      Refunded Items
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
                  </div>
                  <div className="space-y-6">
                    {order.refundItems.map((refundItem, idx) => (
                      <div
                        key={idx}
                        className="bg-[#232323] rounded-xl p-6 border border-[#444] hover:border-[#FFC107]/50 transition-all duration-300"
                      >
                        <div className="flex items-start gap-6">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-white font-bold text-xl leading-tight">
                                {refundItem.productName}
                              </h4>
                              <div className="text-right">
                                <div className="bg-[#FFC107] text-black px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                  ₱{refundItem.refundAmount?.toFixed(2)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              {refundItem.size && (
                                <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#555]">
                                  <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">
                                    Size
                                  </span>
                                  <span className="text-white font-medium text-lg">
                                    {refundItem.size}
                                  </span>
                                </div>
                              )}
                              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#555]">
                                <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">
                                  Quantity
                                </span>
                                <span className="text-white font-medium text-lg">
                                  {refundItem.quantity}
                                </span>
                              </div>
                              <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#555]">
                                <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block">
                                  Price
                                </span>
                                <span className="text-white font-medium text-lg">
                                  ₱{refundItem.price?.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {refundItem.addOns &&
                              refundItem.addOns.length > 0 && (
                                <div className="bg-[#1a1a1a]/60 rounded-lg p-4 border border-[#555]">
                                  <span className="text-[#FFC107] font-semibold text-sm uppercase tracking-wide block mb-2">
                                    Add-ons
                                  </span>
                                  <div className="flex flex-wrap gap-2">
                                    {refundItem.addOns.map(
                                      (addon, addonIdx) => (
                                        <span
                                          key={addonIdx}
                                          className="bg-[#FFC107]/20 text-[#FFC107] px-3 py-1 rounded-full text-sm font-medium border border-[#FFC107]/30"
                                        >
                                          {addon.name}{" "}
                                          {addon.price && `(+₱${addon.price})`}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Refund Proof Image */}
              {order.refundProofImage && (
                <div className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm mb-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#FFC107] p-3 rounded-full">
                      <Camera className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase drop-shadow-lg">
                      Refund Proof
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
                  </div>
                  <div className="bg-[#232323] rounded-xl p-4 border border-[#444]">
                    <img
                      src={order.refundProofImage}
                      alt="Refund Proof"
                      className="w-full h-64 object-cover rounded-lg border border-[#444]"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-gray-400 text-sm">
                      Proof uploaded by customer for refund request
                    </span>
                  </div>
                </div>
              )}

              {/* Refund Payment Proof Image */}
              {order.refundPaymentProof && (
                <div className="bg-[#1a1a1a]/80 rounded-2xl p-8 border-2 border-[#333] hover:border-[#FFC107]/50 transition-all duration-300 shadow-xl backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#FFC107] p-3 rounded-full">
                      <CreditCard className="w-8 h-8 text-black" />
                    </div>
                    <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase drop-shadow-lg">
                      Refund Payment Proof
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#FFC107] to-transparent"></div>
                  </div>
                  <div className="bg-[#232323] rounded-xl p-4 border border-[#444]">
                    <img
                      src={order.refundPaymentProof}
                      alt="Refund Payment Proof"
                      className="w-full h-64 object-cover rounded-lg border border-[#444]"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <span className="text-gray-400 text-sm">
                      Payment proof uploaded by admin after processing refund
                    </span>
                  </div>
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
                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">
                  Order #{order._id?.substring(0, 8)}
                </h3>
              </div>
              <div className="space-y-4 text-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#FFC107]" />
                  <div>
                    <span className="font-bold text-[#FFC107]">Customer: </span>
                    <span className="text-white font-medium">
                      {order.userId?.name || "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#FFC107]" />
                  <div>
                    <span className="font-bold text-[#FFC107]">Ordered: </span>
                    <span className="text-white font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <StatusBadge status={order.paymentMethod} />
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-7 h-7 text-[#FFC107]" />
                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">
                  Customer Information
                </h3>
              </div>
              <div className="space-y-5 text-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-5">
                  <div>
                    <span className="font-bold text-[#FFC107] block mb-1">
                      Name:
                    </span>
                    <span className="text-white font-medium">
                      {order.userId?.name || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#FFC107] block mb-1">
                      Contact:
                    </span>
                    <span className="text-white font-medium">
                      {order.address?.contactNumber || "N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-[#FFC107] block mb-1">
                    Email:
                  </span>
                  <span className="text-white font-medium break-all">
                    {order.userId?.email || "Unknown"}
                  </span>
                </div>
                {order.paymentMethod === "gcash" && order.referenceNumber && (
                  <div>
                    <span className="font-bold text-[#FFC107] block mb-1">
                      Reference #:
                    </span>
                    <span className="text-white font-medium">
                      {order.referenceNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#232323] my-4" />
            {/* Delivery Address */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-7 h-7 text-[#FFC107]" />
                <h3 className="text-[#FFC107] text-2xl font-extrabold tracking-widest uppercase">
                  Delivery Address
                </h3>
              </div>
              <div className="text-lg text-white mb-6">
                <p className="font-medium">
                  {order.address?.lotNo && `${order.address.lotNo}, `}
                  {order.address?.purok && `${order.address.purok}, `}
                  {order.address?.street && `${order.address.street}, `}
                  {order.address?.barangay && `${order.address.barangay}, `}
                  {order.address?.municipality &&
                    `${order.address.municipality}, `}
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
                    <span className="font-bold text-[#FFC107]">
                      Instructions:{" "}
                    </span>
                    {order.deliveryInstructions}
                  </p>
                )}
              </div>

              {/* Delivery Navigation */}
              {order.address?.latitude && order.address?.longitude && (
                <div className="mb-6">
                  <DeliveryNavigation
                    deliveryAddress={`${order.address?.lotNo ? order.address.lotNo + ', ' : ''}${order.address?.purok ? order.address.purok + ', ' : ''}${order.address?.street ? order.address.street + ', ' : ''}${order.address?.barangay ? order.address.barangay + ', ' : ''}${order.address?.municipality ? order.address.municipality + ', ' : ''}${order.address?.province || ''}`}
                    deliveryCoordinates={{
                      latitude: order.address.latitude,
                      longitude: order.address.longitude
                    }}
                    restaurantCoordinates={{ latitude: 13.323830, longitude: 121.845809 }}
                    className="bg-[#232323] border-[#444]"
                  />
                </div>
              )}
            </div>
            {/* Payment Proof */}
            <ImageDisplay
              imageSrc={
                order.paymentMethod === "gcash" ? order.proofImage : null
              }
              altText="Payment Proof"
              title="Payment Proof"
              description="Uploaded by customer as proof of GCash payment"
              icon="payment"
            />
          </div>
        </div>
      </PageLayout>
    </AdminLayout>
  );
}
