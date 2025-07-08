import React, { useState, useEffect } from "react";
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
import { CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { productAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Separator } from "@/components/ui/separator";
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { categoryAPI } from "@/services/api";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

const statusOptions = ["Available", "Not Available"];
const sizeOptions = ["Small", "Medium", "Large", "Extra Large"];

export default function Products() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusChangingProduct, setStatusChangingProduct] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        categoryAPI.getAll().then(res => {
            const cats = (res.data || res || []).map(c => c.category);
            setCategoryOptions(cats);
        });
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await productAPI.getAll();
            return res.data || res || [];
        },
    });
    const { mutate: deleteProduct } = useMutation({
        mutationFn: async (id) => await productAPI.delete(id),
        onSuccess: () => {
            toast.success("Product deleted successfully!");
            setDeleteId(null);
            queryClient.invalidateQueries(['products']);
        },
        onError: () => {
            toast.error("Failed to delete product");
            setDeleteId(null);
        }
    });
    const { mutate: updateProduct } = useMutation({
        mutationFn: async ({ id, data }) => await productAPI.update(id, data),
        onSuccess: () => {
            toast.success("Product status updated!");
            setStatusDialogOpen(false);
            setStatusChangingProduct(null);
            setNewStatus(null);
            queryClient.invalidateQueries(['products']);
        },
        onError: () => {
            toast.error("Failed to update product status");
            setStatusDialogOpen(false);
            setStatusChangingProduct(null);
            setNewStatus(null);
        }
    });

    const mappedData = (data || []).map(item => ({
        ...item,
        id: item._id,
        onEdit: () => navigate(`/admin/products/${item._id}/edit`),
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
                    <DropdownMenuItem onClick={() => navigate(`/admin/products/${row.id}`)}>View</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => row.onEdit(row)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500"
                        disabled={deleting}
                        onClick={() => {
                            setDeleteItem(row);
                            setDeleteOpen(true);
                        }}>
                        {deleting && deleteItem && deleteItem._id === row._id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }));

    const columns = [
        { accessorKey: "productName", header: "Product Name" },
        { accessorKey: "category", header: "Category", render: row => row.category?.category || "", meta: { filterOptions: categoryOptions }, accessorFn: row => row.category?.category || "" },
        {
            id: "status",
            header: "Status",
            render: (row) => (
                <div className="flex justify-center items-center w-full">
                    <Select
                        value={row.isAvailable ? "Available" : "Not Available"}
                        onValueChange={(value) => {
                            setStatusChangingProduct(row);
                            setNewStatus(value === "Available");
                            setStatusDialogOpen(true);
                        }}
                        disabled={statusLoading && statusChangingProduct && statusChangingProduct._id === row._id}
                    >
                        <SelectTrigger className="w-[170px] bg-[#232323] border border-[#444] focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400 text-white placeholder:text-[#BDBDBD] rounded-md py-2 px-3 text-base font-medium transition-colors disabled:opacity-60">
                            {row.isAvailable ? (
                                <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Available
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-500">
                                    <XCircle className="w-4 h-4 text-red-500" /> Not Available
                                </span>
                            )}
                        </SelectTrigger>
                        <SelectContent className="bg-[#232323] border border-[#444] text-white rounded-md shadow-lg">
                            <SelectItem value="Available">
                                <span className="flex items-center gap-1 text-green-500">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Available
                                </span>
                            </SelectItem>
                            <SelectItem value="Not Available">
                                <span className="flex items-center gap-1 text-red-500">
                                    <XCircle className="w-4 h-4 text-red-500" /> Not Available
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            ),
            meta: { filterOptions: statusOptions },
            accessorFn: row => row.isAvailable ? "Available" : "Not Available"
        },
        {
            id: "actions",
            header: "",
            render: (row) => row.renderActions(row),
        },
    ];

    return (
        <AdminLayout>
            <PageLayout title="Products" description="Manage your product inventory, pricing, and stock levels here."
                action={<Button variant="yellow" size="lg" onClick={() => navigate('/admin/products/create')}>Add Product</Button>}
            >
                <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={deleting ? undefined : setDeleteOpen}
                    title="Delete Product"
                    description={`Are you sure you want to delete "${deleteItem?.productName}"? This action cannot be undone.`}
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={deleting}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                variant="yellow"
                                size="lg"
                                loading={deleting}
                                disabled={deleting}
                                onClick={() => {
                                    setDeleting(true);
                                    deleteProduct(deleteItem._id, {
                                        onSuccess: () => {
                                            setDeleting(false);
                                            setDeleteOpen(false);
                                            setDeleteItem(null);
                                        },
                                        onError: () => {
                                            setDeleting(false);
                                        }
                                    });
                                }}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                />
                {/* Status Change Dialog */}
                <CustomAlertDialog
                    open={statusDialogOpen}
                    onOpenChange={statusLoading ? undefined : setStatusDialogOpen}
                    title="Change Product Status"
                    description={`Are you sure you want to mark "${statusChangingProduct?.productName}" as ${newStatus ? 'Available' : 'Not Available'}?`}
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
                                    updateProduct({
                                        id: statusChangingProduct._id,
                                        data: { isAvailable: newStatus },
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
