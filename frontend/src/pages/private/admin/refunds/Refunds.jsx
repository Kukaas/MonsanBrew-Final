import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import DataTable from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { orderAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import CustomAlertDialog from "@/components/custom/CustomAlertDialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import StatusBadge from "@/components/custom/StatusBadge";
import { Textarea } from "@/components/ui/textarea";

const refundStatusOptions = ["Requested", "Approved", "Rejected", "Processed"];
const paymentMethodOptions = ["COD", "GCash"];

export default function Refunds() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusChangingOrder, setStatusChangingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: async () => {
      const res = await orderAPI.getRefundRequests();
      return res.data?.orders || res.orders || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const { mutate: updateRefundStatus } = useMutation({
    mutationFn: async ({ orderId, status, refundAmount, rejectionMessage }) => {
      switch (status) {
        case "refund_approved":
          return await orderAPI.approveRefund(orderId, refundAmount);
        case "refund_rejected":
          return await orderAPI.rejectRefund(orderId, rejectionMessage);
        case "refund_processed":
          return await orderAPI.processRefund(orderId);
        default:
          throw new Error("Invalid status");
      }
    },
    onSuccess: () => {
      toast.success("Refund status updated successfully!");
      setStatusDialogOpen(false);
      setShowRejectionDialog(false);
      setStatusChangingOrder(null);
      setNewStatus(null);
      setRejectionMessage("");
      queryClient.invalidateQueries(["admin-refunds"]);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.error || "Failed to update refund status";
      toast.error(errorMessage);
      console.error("Update refund status error:", error);
      setStatusDialogOpen(false);
      setShowRejectionDialog(false);
      setStatusChangingOrder(null);
      setNewStatus(null);
      setRejectionMessage("");
    },
    onSettled: () => {
      setStatusLoading(false);
    },
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
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "refund_approved":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "refund_rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "refund_processed":
        return <RotateCcw className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRefundStatusTextColor = (status) => {
    switch (status) {
      case "refund_requested":
        return "text-yellow-400";
      case "refund_approved":
        return "text-green-400";
      case "refund_rejected":
        return "text-red-400";
      case "refund_processed":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const mappedData = (data || []).map((item) => ({
    ...item,
    id: item._id,
    customerName: item.userId?.name || "Unknown",
    customerEmail: item.userId?.email || "Unknown",
    statusLabel: getRefundStatusLabel(item.refundStatus),
    paymentMethodLabel: item.paymentMethod?.toUpperCase() || "Unknown",
    refundAmountFormatted: `₱${item.refundAmount?.toFixed(2) || "0.00"}`,
    dateCreated: new Date(
      item.refundRequestDate || item.createdAt
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    renderActions: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent disablePortal>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <Separator />
          <DropdownMenuItem
            onClick={() => navigate(`/admin/refunds/${row.id}`)}
          >
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }));

  const columns = [
    {
      accessorKey: "id",
      header: "Order ID",
      render: (row) => (
        <span className="font-mono text-sm">{row.id?.substring(0, 8)}...</span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      render: (row) => (
        <div>
          <div className="font-medium">{row.customerName}</div>
          <div className="text-sm text-gray-500">{row.customerEmail}</div>
        </div>
      ),
    },
    {
      id: "refundStatus",
      header: "Refund Status",
      render: (row) => {
        const isDisabled =
          row.refundStatus === "refund_processed" ||
          row.refundStatus === "refund_rejected";

        if (isDisabled) {
          return (
            <Badge
              className={`${getRefundStatusColor(
                row.refundStatus
              )} border rounded-full px-3 py-1 text-xs font-medium`}
            >
              {row.statusLabel}
            </Badge>
          );
        }

        return (
          <div className="flex justify-center items-center w-full">
            <Select
              value={row.refundStatus}
              onValueChange={(value) => {
                setStatusChangingOrder(row);
                setNewStatus(value);
                if (value === "refund_rejected") {
                  setShowRejectionDialog(true);
                } else {
                  setStatusDialogOpen(true);
                }
              }}
              disabled={
                statusLoading &&
                statusChangingOrder &&
                statusChangingOrder._id === row._id
              }
            >
              <SelectTrigger className="w-[170px] bg-[#232323] border border-[#444] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-[#BDBDBD] rounded-md py-2 px-3 text-base font-medium transition-colors disabled:opacity-60">
                <span
                  className={`flex items-center gap-1 ${getRefundStatusTextColor(
                    row.refundStatus
                  )}`}
                >
                  {getRefundStatusIcon(row.refundStatus)} {row.statusLabel}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-[#232323] border border-[#444] text-white rounded-md shadow-lg">
                {row.refundStatus === "refund_requested" && (
                  <>
                    <SelectItem value="refund_approved">
                      <span
                        className={`flex items-center gap-1 ${getRefundStatusTextColor(
                          "refund_approved"
                        )}`}
                      >
                        {getRefundStatusIcon("refund_approved")} Approve
                      </span>
                    </SelectItem>
                    <SelectItem value="refund_rejected">
                      <span
                        className={`flex items-center gap-1 ${getRefundStatusTextColor(
                          "refund_rejected"
                        )}`}
                      >
                        {getRefundStatusIcon("refund_rejected")} Reject
                      </span>
                    </SelectItem>
                  </>
                )}
                {row.refundStatus === "refund_approved" && (
                  <SelectItem value="refund_processed">
                    <span
                      className={`flex items-center gap-1 ${getRefundStatusTextColor(
                        "refund_processed"
                      )}`}
                    >
                      {getRefundStatusIcon("refund_processed")} Process
                    </span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        );
      },
      meta: { filterOptions: refundStatusOptions },
      accessorFn: (row) => row.statusLabel,
    },
    {
      accessorKey: "refundAmountFormatted",
      header: "Refund Amount",
      render: (row) => (
        <span className="font-medium text-green-400">
          {row.refundAmountFormatted}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethodLabel",
      header: "Payment",
      render: (row) => <StatusBadge status={row.paymentMethod} />,
      meta: { filterOptions: paymentMethodOptions },
      accessorFn: (row) => row.paymentMethodLabel,
    },
    {
      accessorKey: "dateCreated",
      header: "Request Date",
      render: (row) => (
        <span className="text-sm text-gray-500">{row.dateCreated}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      render: (row) => row.renderActions(row),
    },
  ];

  return (
    <AdminLayout>
      <PageLayout
        title="Refunds"
        description="View and manage customer refund requests, approve or reject them based on the situation."
      >
        <DataTable
          columns={columns}
          data={mappedData}
          loading={isLoading}
          rowKey="id"
        />
        {/* Status Change Dialog */}
        <CustomAlertDialog
          open={statusDialogOpen}
          onOpenChange={statusLoading ? undefined : setStatusDialogOpen}
          title="Update Refund Status"
          description={`Are you sure you want to ${
            newStatus === "refund_approved"
              ? "approve"
              : newStatus === "refund_rejected"
              ? "reject"
              : "process"
          } the refund for order ${statusChangingOrder?.id?.substring(
            0,
            8
          )}...?`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={statusLoading}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="yellow"
                size="lg"
                loading={statusLoading}
                disabled={statusLoading}
                onClick={() => {
                  setStatusLoading(true);
                  updateRefundStatus(
                    {
                      orderId: statusChangingOrder._id,
                      status: newStatus,
                      refundAmount: statusChangingOrder.refundAmount,
                    },
                    {
                      onSettled: () => setStatusLoading(false),
                    }
                  );
                }}
              >
                {statusLoading ? "Updating..." : "Confirm"}
              </Button>
            </>
          }
        />

        {/* Rejection Dialog with Textarea */}
        <CustomAlertDialog
          open={showRejectionDialog}
          onOpenChange={statusLoading ? undefined : setShowRejectionDialog}
          title="Reject Refund"
          description={`Please provide a reason for rejecting the refund for order ${statusChangingOrder?.id?.substring(
            0,
            8
          )}...`}
          actions={
            <>
              <AlertDialogCancel className="h-10" disabled={statusLoading}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="yellow"
                size="lg"
                loading={statusLoading}
                disabled={statusLoading || !rejectionMessage.trim()}
                onClick={() => {
                  setStatusLoading(true);
                  updateRefundStatus(
                    {
                      orderId: statusChangingOrder._id,
                      status: "refund_rejected",
                      rejectionMessage: rejectionMessage.trim(),
                      refundAmount: statusChangingOrder.refundAmount,
                    },
                    {
                      onSettled: () => setStatusLoading(false),
                    }
                  );
                }}
              >
                {statusLoading ? "Rejecting..." : "Reject Refund"}
              </Button>
            </>
          }
        >
          <div className="mt-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className="min-h-[100px] bg-[#232323] border border-[#444] text-white placeholder:text-[#BDBDBD] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
              disabled={statusLoading}
            />
          </div>
        </CustomAlertDialog>
      </PageLayout>
    </AdminLayout>
  );
}
