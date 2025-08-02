import React from "react";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
    },
    approved: {
      label: "To Ship",
      color: "bg-blue-100 text-blue-800",
      icon: Package,
    },
    preparing: {
      label: "Preparing",
      color: "bg-orange-100 text-orange-800",
      icon: Package,
    },
    waiting_for_rider: {
      label: "Waiting for Rider",
      color: "bg-indigo-100 text-indigo-800",
      icon: Package,
    },
    out_for_delivery: {
      label: "To Receive",
      color: "bg-purple-100 text-purple-800",
      icon: Truck,
    },
    completed: {
      label: "Completed",
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: XCircle,
    },
    refund: {
      label: "Refund",
      color: "bg-orange-100 text-orange-800",
      icon: RotateCcw,
    },
    processed: {
      label: "Processed",
      color: "bg-blue-100 text-blue-800",
      icon: RotateCcw,
    },
    return_refund: {
      label: "Return/Refund",
      color: "bg-gray-100 text-gray-800",
      icon: RotateCcw,
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <IconComponent size={12} />
      {config.label}
    </Badge>
  );
};

export default OrderStatusBadge;
