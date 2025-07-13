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
import { MoreVertical } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { orderAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import StatusBadge from '@/components/custom/StatusBadge';
import { getStatusColor, getStatusLabel, getStatusIcon, getStatusTextColor } from "@/lib/utils";

const statusOptions = ["Pending", "Approved", "Preparing", "Waiting for Rider", "Out for Delivery", "Completed", "Cancelled"];
const paymentMethodOptions = ["COD", "GCash"];



export default function Orders() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusChangingOrder, setStatusChangingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: async () => {
            const res = await orderAPI.getAllOrders();
            return res.data?.orders || res.orders || [];
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    const { mutate: updateOrderStatus } = useMutation({
        mutationFn: async ({ orderId, status }) => {
            return await orderAPI.updateOrderStatus(orderId, status);
        },
        onSuccess: () => {
            toast.success("Order status updated successfully!");
            setStatusDialogOpen(false);
            setStatusChangingOrder(null);
            setNewStatus(null);
            queryClient.invalidateQueries(['admin-orders']);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.error || "Failed to update order status";
            toast.error(errorMessage);
            console.error('Update order status error:', error);
            setStatusDialogOpen(false);
            setStatusChangingOrder(null);
            setNewStatus(null);
        },
        onSettled: () => {
            setStatusLoading(false);
        }
    });

    const mappedData = (data || []).map(item => ({
        ...item,
        id: item._id,
        customerName: item.userId?.name || 'Unknown',
        customerEmail: item.userId?.email || 'Unknown',
        riderName: item.riderId?.name || 'Unassigned',
        riderContact: item.riderId?.contactNumber || '',
        statusLabel: getStatusLabel(item.status),
        paymentMethodLabel: item.paymentMethod?.toUpperCase() || 'Unknown',
        totalFormatted: `₱${item.total?.toFixed(2) || '0.00'}`,
        dateCreated: new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        renderActions: (row) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent disablePortal>
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <Separator />
                    <DropdownMenuItem onClick={() => navigate(`/admin/orders/${row.id}`)}>
                        View Details
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }));

    const columns = [
        {
            accessorKey: "id",
            header: "Order ID",
            render: (row) => (
                <span className="font-mono text-sm">
                    {row.id?.substring(0, 8)}...
                </span>
            )
        },
        {
            accessorKey: "customerName",
            header: "Customer",
            render: (row) => (
                <div>
                    <div className="font-medium">{row.customerName}</div>
                    <div className="text-sm text-gray-500">{row.customerEmail}</div>
                </div>
            )
        },
        {
            accessorKey: "riderName",
            header: "Rider",
            render: (row) => (
                <div>
                    <div className="font-medium">{row.riderName}</div>
                    {row.riderContact && (
                        <div className="text-sm text-gray-500">{row.riderContact}</div>
                    )}
                </div>
            )
        },
        {
            id: "status",
            header: "Status",
            render: (row) => {
                const isDisabled = row.status === 'cancelled' || row.status === 'out_for_delivery' || row.status === 'completed';

                if (isDisabled) {
                    return (
                        <Badge className={`${getStatusColor(row.status)} border rounded-full px-3 py-1 text-xs font-medium`}>
                            {row.statusLabel}
                        </Badge>
                    );
                }

                return (
                    <div className="flex justify-center items-center w-full">
                        <Select
                            value={row.status}
                            onValueChange={(value) => {
                                setStatusChangingOrder(row);
                                setNewStatus(value);
                                setStatusDialogOpen(true);
                            }}
                            disabled={statusLoading && statusChangingOrder && statusChangingOrder._id === row._id}
                        >
                            <SelectTrigger className="w-[170px] bg-[#232323] border border-[#444] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-[#BDBDBD] rounded-md py-2 px-3 text-base font-medium transition-colors disabled:opacity-60">
                                <span className={`flex items-center gap-1 ${getStatusTextColor(row.status)}`}>
                                    {getStatusIcon(row.status)} {row.statusLabel}
                                </span>
                            </SelectTrigger>
                            <SelectContent className="bg-[#232323] border border-[#444] text-white rounded-md shadow-lg">
                                <SelectItem value="preparing">
                                    <span className={`flex items-center gap-1 ${getStatusTextColor('preparing')}`}>
                                        {getStatusIcon('preparing')} Preparing
                                    </span>
                                </SelectItem>
                                <SelectItem value="waiting_for_rider">
                                    <span className={`flex items-center gap-1 ${getStatusTextColor('waiting_for_rider')}`}>
                                        {getStatusIcon('waiting_for_rider')} Waiting for Rider
                                    </span>
                                </SelectItem>
                                <SelectItem value="out_for_delivery">
                                    <span className={`flex items-center gap-1 ${getStatusTextColor('out_for_delivery')}`}>
                                        {getStatusIcon('out_for_delivery')} Out for Delivery
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );
            },
            meta: { filterOptions: statusOptions },
            accessorFn: row => row.statusLabel
        },
        {
            accessorKey: "paymentMethodLabel",
            header: "Payment",
            render: (row) => (
                <StatusBadge status={row.paymentMethod} />
            ),
            meta: { filterOptions: paymentMethodOptions },
            accessorFn: row => row.paymentMethodLabel
        },
        {
            accessorKey: "totalFormatted",
            header: "Total",
            render: (row) => (
                <span className="font-medium">{row.totalFormatted}</span>
            )
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
                title="Orders"
                description="View and manage all customer orders, track their status, and process payments."
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
                    title="Change Order Status"
                    description={`Are you sure you want to change the status of order ${statusChangingOrder?.id?.substring(0, 8)}... to ${getStatusLabel(newStatus)}?`}
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={statusLoading}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                variant="yellow"
                                size="lg"
                                loading={statusLoading}
                                disabled={statusLoading}
                                onClick={() => {
                                    setStatusLoading(true);
                                    updateOrderStatus({
                                        orderId: statusChangingOrder._id,
                                        status: newStatus,
                                    }, {
                                        onSettled: () => setStatusLoading(false)
                                    });
                                }}
                            >
                                {statusLoading ? 'Updating...' : 'Confirm'}
                            </Button>
                        </>
                    }
                />
            </PageLayout>
        </AdminLayout>
    );
}
