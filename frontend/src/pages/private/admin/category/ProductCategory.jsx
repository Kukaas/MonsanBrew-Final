import React, { useState, useRef } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import PageLayout from "@/layouts/PageLayout";
import DataTable from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from 'lucide-react';
import { categoryAPI } from "@/services/api";
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import Form from '@/components/custom/Form';
import FormInput from '@/components/custom/FormInput';
import { toast } from "sonner";
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Separator } from "@/components/ui/separator";

export default function ProductCategory() {
    const [open, setOpen] = useState(false);
    const [category, setCategory] = useState("");
    const [formError, setFormError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState(null);
    const queryClient = useQueryClient();
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const res = await categoryAPI.getAll();
                return res || [];
            } catch {
                return [];
            }
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (newCategory) => {
            return await categoryAPI.create({ category: newCategory });
        },
        onSuccess: () => {
            setAdding(false);
            queryClient.invalidateQueries(['categories']);
            setCategory("");
            setFormError("");
            setOpen(false);
            toast.success("Category added successfully!")
        },
        onError: (error) => {
            setAdding(false);
            setFormError(error?.response?.data?.error || "Failed to add category");
        }
    });

    const { mutate: updateMutate } = useMutation({
        mutationFn: async ({ id, category }) => {
            return await categoryAPI.update(id, { category });
        },
        onSuccess: () => {
            setUpdating(false);
            queryClient.invalidateQueries(['categories']);
            setEditOpen(false);
            setEditCategory(null);
            setEditValue("");
            toast.success("Category updated successfully!");
        },
        onError: (error) => {
            setUpdating(false);
            setFormError(error?.response?.data?.error || "Failed to update category");
        }
    });

    const { mutate: deleteMutate } = useMutation({
        mutationFn: async (id) => {
            return await categoryAPI.delete(id);
        },
        onSuccess: () => {
            setDeleting(false);
            queryClient.invalidateQueries(['categories']);
            setDeleteOpen(false);
            setDeleteCategory(null);
            toast.success("Category deleted successfully!");
        },
        onError: (error) => {
            setDeleting(false);
            toast.error(error?.response?.data?.error || "Failed to delete category");
        }
    });

    const handleAddCategory = (e) => {
        e.preventDefault();
        setFormError("");
        if (!category.trim()) {
            setFormError("Category name is required");
            return;
        }
        setAdding(true);
        mutate(category.trim());
    };

    const handleEditCategory = (e) => {
        e.preventDefault();
        setFormError("");
        if (!editValue.trim()) {
            setFormError("Category name is required");
            return;
        }
        setUpdating(true);
        updateMutate({ id: editCategory._id, category: editValue.trim() });
    };

    const mappedData = (data || []).map(item => ({ ...item, id: item._id }));

    const columns = [
        { accessorKey: "category", header: "Category Name" },
        {
            accessorKey: "createdAt",
            header: "Created At",
            render: row => dayjs(row.createdAt).format('MMMM D, YYYY'),
        },
        {
            accessorKey: "updatedAt",
            header: "Updated At",
            render: row => dayjs(row.updatedAt).format('MMMM D, YYYY'),
        },
        {
            id: "actions",
            header: "",
            render: (row) => (
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
                        <DropdownMenuItem
                            disabled={updating}
                            onClick={() => {
                                setEditCategory(row);
                                setEditValue(row.category);
                                setEditOpen(true);
                            }}>
                            {updating && editCategory && editCategory._id === row._id ? 'Saving...' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500"
                            disabled={deleting}
                            onClick={() => {
                                setDeleteCategory(row);
                                setDeleteOpen(true);
                            }}>
                            {deleting && deleteCategory && deleteCategory._id === row._id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AdminLayout>
            <PageLayout
                title="Product Categories"
                description="Manage your product categories here."
                action={
                    <Button variant="yellow" size="lg" onClick={() => setOpen(true)}>
                        Add Category
                    </Button>
                }
            >
                <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />

                {/* ADD DIALOG */}
                <CustomAlertDialog
                    open={open}
                    onOpenChange={adding ? undefined : setOpen}
                    title="Add Category"
                    description="Enter a new product category name."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10 border border-[#FFC107] bg-[#232323] text-white text-lg font-bold"
                                disabled={adding}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="add-category-form" variant="yellow" size="lg" loading={adding} disabled={adding}>
                                {adding ? 'Adding...' : 'Add'}
                            </Button>
                        </>
                    }
                >
                    <Form id="add-category-form" onSubmit={handleAddCategory}>
                        <FormInput
                            label="Category Name"
                            name="category"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            disabled={adding}
                            autoFocus
                            error={formError}
                            placeholder="e.g. Bread, Coffee, Dairy"
                            variant="dark"
                        />
                    </Form>
                </CustomAlertDialog>

                {/* EDIT DIALOG */}
                <CustomAlertDialog
                    open={editOpen}
                    onOpenChange={updating ? undefined : setEditOpen}
                    title="Edit Category"
                    description="Update the product category name."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={updating}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="edit-category-form" variant="yellow" size="lg" loading={updating} disabled={updating}>
                                {updating ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    }
                >
                    <Form id="edit-category-form" onSubmit={handleEditCategory}>
                        <FormInput
                            label="Category Name"
                            name="editCategory"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            disabled={updating}
                            autoFocus
                            error={formError}
                            placeholder="e.g. Bread, Coffee, Dairy"
                            variant="dark"
                        />
                    </Form>
                </CustomAlertDialog>

                {/* DELETE DIALOG */}
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={deleting ? undefined : setDeleteOpen}
                    title="Delete Category"
                    description={`Are you sure you want to delete "${deleteCategory?.category}"? This action cannot be undone.`}
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
                                onClick={() => { setDeleting(true); deleteMutate(deleteCategory._id); }}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                />
            </PageLayout>
        </AdminLayout>
    );
}
