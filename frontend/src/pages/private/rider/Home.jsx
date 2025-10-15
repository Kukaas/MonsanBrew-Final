import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import RiderLayout from "@/layouts/RiderLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Package,
  User,
  Truck,
  Clock,
  CheckCircle,
  DollarSign,
  Navigation,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import DashCard from "@/components/custom/DashCard";
import DeliveryNavigation from "@/components/custom/DeliveryNavigation";

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [acceptingOrder, setAcceptingOrder] = useState(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);

  // Fetch orders waiting for rider
  const {
    data: availableOrders = [],
    isLoading: availableLoading,
    isFetching: availableFetching,
    refetch: refetchAvailableOrders,
  } = useQuery({
    queryKey: ["orders-waiting-for-rider"],
    queryFn: async () => {
      const response = await orderAPI.getOrdersWaitingForRider();
      return response.orders || [];
    },
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  // Fetch rider's active orders
  const { data: activeOrders = [], isLoading: activeLoading } = useQuery({
    queryKey: ["rider-active-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await orderAPI.getOrdersByRider(user._id);
      return (response.orders || []).filter(
        (order) => order.status === "out_for_delivery"
      );
    },
    enabled: !!user?._id,
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  // Fetch rider's completed orders (last 7 days for stats)
  const { data: completedOrders = [], isLoading: completedLoading } = useQuery({
    queryKey: ["rider-completed-orders", user?._id],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await orderAPI.getOrdersByRider(user._id);
      return (response.orders || []).filter(
        (order) => order.status === "completed"
      );
    },
    enabled: !!user?._id,
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
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
      queryClient.invalidateQueries(["orders-waiting-for-rider"]);
      queryClient.invalidateQueries(["rider-active-orders", user?._id]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to accept order";
      toast.error(errorMessage);
      console.error("Accept order error:", error);
      setAcceptDialogOpen(false);
      setAcceptingOrder(null);
    },
    onSettled: () => {
      setAcceptLoading(false);
    },
  });

  // Calculate statistics
  const today = new Date();
  const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentCompletedOrders = completedOrders.filter(
    (order) => new Date(order.updatedAt) >= last7Days
  );

  // Fixed delivery fee of ₱15 per delivery
  const deliveryFee = 15;
  const totalEarnings = recentCompletedOrders.length * deliveryFee;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const isLoading = availableLoading || activeLoading || completedLoading;

  if (isLoading) {
    return (
      <RiderLayout>
        <div className="min-h-screen bg-[#232323] p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card
                  key={i}
                  className="bg-[#2A2A2A] border-[#444] animate-pulse"
                >
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-600 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions Skeleton */}
            <Card className="bg-[#2A2A2A] border-[#444] animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-gray-600 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Orders Skeleton */}
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card
                  key={i}
                  className="bg-[#2A2A2A] border-[#444] animate-pulse"
                >
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
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

  return (
    <RiderLayout>
      <div className="min-h-screen bg-[#232323] p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name?.split(" ")[0] || "Rider"}! 👋
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DashCard
              title="Active Orders"
              value={activeOrders.length}
              icon={Truck}
              gradientFrom="from-[#232323]"
              gradientTo="to-[#1a1a1a]"
              borderColor="border-[#FFC107]/30"
              iconBgColor="bg-[#FFC107]/20"
              iconColor="text-[#FFC107]"
            />

            <DashCard
              title="Completed (7d)"
              value={recentCompletedOrders.length}
              icon={CheckCircle}
              gradientFrom="from-[#232323]"
              gradientTo="to-[#1a1a1a]"
              borderColor="border-green-500/30"
              iconBgColor="bg-green-500/20"
              iconColor="text-green-500"
            />

            <DashCard
              title="Available"
              value={availableOrders.length}
              icon={Package}
              gradientFrom="from-[#232323]"
              gradientTo="to-[#1a1a1a]"
              borderColor="border-blue-500/30"
              iconBgColor="bg-blue-500/20"
              iconColor="text-blue-500"
            />

            <DashCard
              title="Earnings (7d)"
              value={`₱${totalEarnings.toFixed(0)}`}
              icon={DollarSign}
              gradientFrom="from-[#232323]"
              gradientTo="to-[#1a1a1a]"
              borderColor="border-[#FFC107]/30"
              iconBgColor="bg-[#FFC107]/20"
              iconColor="text-[#FFC107]"
            />
          </div>

          {/* Quick Actions */}
          <Card className="bg-[#2A2A2A] border-[#444]">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#FFC107]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to="/rider/orders">
                  <Button variant="yellow" className="w-full h-12">
                    <Truck className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Button
                  variant="yellow-outline"
                  className="w-full h-12"
                  onClick={() => {
                    refetchAvailableOrders();
                  }}
                  disabled={availableLoading || availableFetching}
                  loading={availableLoading || availableFetching}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  {availableLoading || availableFetching
                    ? "Refreshing..."
                    : "Refresh Orders"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#FFC107]" />
                  Active Deliveries ({activeOrders.length})
                </h2>
                <Link to="/rider/orders">
                  <Button variant="link" className="text-[#FFC107] p-0 h-auto">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {activeOrders.slice(0, 2).map((order) => (
                  <Card
                    key={order._id}
                    className="bg-[#2A2A2A] border-[#444] hover:border-[#FFC107] transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">
                            Order #{order._id.substring(0, 8)}...
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge className="bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/30">
                          <Truck className="w-3 h-3 mr-1" />
                          Out for Delivery
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <User className="w-4 h-4 text-[#FFC107]" />
                          <span>
                            {order.userId?.name || "Unknown Customer"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-[#FFC107]" />
                          <span className="truncate">
                            {formatAddress(order.address)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#444]">
                          <span className="text-white font-bold">
                            ₱{order.total?.toFixed(2)}
                          </span>
                          <Link to="/rider/orders">
                            <Button variant="yellow" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                        {order.address?.latitude && order.address?.longitude && (
                          <div className="mt-3">
                            <DeliveryNavigation
                              deliveryAddress={formatAddress(order.address)}
                              deliveryCoordinates={{
                                latitude: order.address.latitude,
                                longitude: order.address.longitude,
                              }}
                              restaurantCoordinates={{
                                latitude: 13.32383,
                                longitude: 121.845809,
                              }}
                              className="bg-[#232323] border-[#444]"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Orders Section */}
          {availableLoading || availableFetching ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#232323] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FFC107]" />
                  Available Orders
                </h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FFC107] rounded-full animate-pulse"></div>
                  <span className="text-[#FFC107] text-sm font-medium">
                    Loading...
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="bg-gray-100 animate-pulse shadow rounded-2xl"
                  >
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : availableOrders.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#232323] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#FFC107]" />
                  Available Orders ({availableOrders.length})
                </h2>
              </div>
              <div className="space-y-4">
                {availableOrders.slice(0, 3).map((order) => (
                  <Card
                    key={order._id}
                    className="bg-white border-2 border-[#FFC107] hover:shadow-lg transition-shadow duration-200 rounded-2xl"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-[#232323] font-semibold">
                            Order #{order._id.substring(0, 8)}...
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                          <Package className="w-3 h-3 mr-1" />
                          Available
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#232323]">
                          <User className="w-4 h-4 text-[#FFC107]" />
                          <span>
                            {order.userId?.name || "Unknown Customer"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 text-[#FFC107]" />
                          <span className="truncate">
                            {formatAddress(order.address)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#FFC107]/30">
                          <span className="text-[#232323] font-bold">
                            ₱{order.total?.toFixed(2)}
                          </span>
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
                            Accept
                          </Button>
                        </div>
                        {order.address?.latitude && order.address?.longitude && (
                          <div className="mt-3">
                            <DeliveryNavigation
                              deliveryAddress={formatAddress(order.address)}
                              deliveryCoordinates={{
                                latitude: order.address.latitude,
                                longitude: order.address.longitude,
                              }}
                              restaurantCoordinates={{
                                latitude: 13.32383,
                                longitude: 121.845809,
                              }}
                              className="bg-white border-[#FFC107]/30"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {availableOrders.length > 3 && (
                  <div className="text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      And {availableOrders.length - 3} more orders available
                    </p>
                    <Button
                      variant="yellow-outline"
                      className="w-full"
                      onClick={() => refetchAvailableOrders()}
                    >
                      View All Available Orders
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Empty State */}
          {!availableLoading &&
            !availableFetching &&
            availableOrders.length === 0 &&
            activeOrders.length === 0 && (
              <Card className="bg-white rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Package size={60} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-[#232323] text-lg font-semibold mb-2">
                    No Orders Available
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    There are currently no orders waiting to be accepted or in
                    progress.
                  </p>
                  <Button
                    variant="yellow"
                    onClick={() => refetchAvailableOrders()}
                  >
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Accept Order Dialog */}
        <CustomAlertDialog
          open={acceptDialogOpen}
          onOpenChange={acceptLoading ? undefined : setAcceptDialogOpen}
          title="Accept Order"
          description={`Are you sure you want to accept order #${acceptingOrder?._id?.substring(
            0,
            8
          )}...? This will assign the order to you for delivery.`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={acceptLoading}>
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
                Accept Order
              </Button>
            </>
          }
        />
      </div>
    </RiderLayout>
  );
}
