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
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { addonsAPI } from "@/services/api";
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import Form from '@/components/custom/Form';
import FormInput from '@/components/custom/FormInput';
import { toast } from "sonner";
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/custom/ImageUpload';

export default function AddOns() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [formError, setFormError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editAddon, setEditAddon] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteAddon, setDeleteAddon] = useState(null);
    const queryClient = useQueryClient();
    const [image, setImage] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [editImage, setEditImage] = useState("");
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['addons'],
        queryFn: async () => {
            try {
                const res = await addonsAPI.getAll();
                return res || [];
            } catch {
                return [];
            }
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (newAddon) => {
            return await addonsAPI.create(newAddon);
        },
        onSuccess: () => {
            setAdding(false);
            queryClient.invalidateQueries(['addons']);
            setName("");
            setPrice("");
            setFormError("");
            setOpen(false);
            toast.success("Add-on added successfully!")
        },
        onError: (error) => {
            setAdding(false);
            setFormError(error?.response?.data?.error || "Failed to add add-on");
        }
    });

    const { mutate: updateMutate } = useMutation({
        mutationFn: async ({ id, name, price, image }) => {
            return await addonsAPI.update(id, { name, price, image });
        },
        onSuccess: () => {
            setUpdating(false);
            queryClient.invalidateQueries(['addons']);
            setEditOpen(false);
            setEditAddon(null);
            setEditName("");
            setEditPrice("");
            setImage("");
            setEditImage("");
            toast.success("Add-on updated successfully!");
        },
        onError: (error) => {
            setUpdating(false);
            setFormError(error?.response?.data?.error || "Failed to update add-on");
        }
    });

    const { mutate: deleteMutate } = useMutation({
        mutationFn: async (id) => {
            return await addonsAPI.delete(id);
        },
        onSuccess: () => {
            setDeleting(false);
            queryClient.invalidateQueries(['addons']);
            setDeleteOpen(false);
            setDeleteAddon(null);
            toast.success("Add-on deleted successfully!");
        },
        onError: (error) => {
            setDeleting(false);
            toast.error(error?.response?.data?.error || "Failed to delete add-on");
        }
    });

    const handleAddAddon = (e) => {
        e.preventDefault();
        setFormError("");
        if (!name.trim()) {
            setFormError("Add-on name is required");
            return;
        }
        if (!price || isNaN(price)) {
            setFormError("Valid price is required");
            return;
        }
        setAdding(true);
        mutate({ name: name.trim(), price: Number(price), image });
    };

    const handleEditAddon = (e) => {
        e.preventDefault();
        setFormError("");
        if (!editName.trim()) {
            setFormError("Add-on name is required");
            return;
        }
        if (!editPrice || isNaN(editPrice)) {
            setFormError("Valid price is required");
            return;
        }
        setUpdating(true);
        updateMutate({ id: editAddon._id, name: editName.trim(), price: Number(editPrice), image: editImage });
    };

    const mappedData = (data || []).map(item => ({ ...item, id: item._id }));

    const columns = [
        { accessorKey: "name", header: "Add-on Name" },
        {
            accessorKey: "price",
            header: "Price",
            render: row => <span>{`₱${Number(row.price).toFixed(2)}`}</span>,
        },
        {
            accessorKey: "image",
            header: "Image",
            render: row => row.image ? (
                <img
                    src={row.image}
                    alt="Add-on"
                    className="h-12 w-12 object-cover rounded border border-[#FFC107] mx-auto cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setPreviewImage(row.image)}
                />
            ) : <span className="text-[#BDBDBD]">No Image</span>,
        },
        {
            id: "actions",
            header: "",
            render: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <IconDotsVertical />
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
                                setEditAddon(row);
                                setEditName(row.name);
                                setEditPrice(row.price);
                                setEditImage(row.image || "");
                                setEditOpen(true);
                            }}>
                            {updating && editAddon && editAddon._id === row._id ? 'Saving...' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500"
                            disabled={deleting}
                            onClick={() => {
                                setDeleteAddon(row);
                                setDeleteOpen(true);
                            }}>
                            {deleting && deleteAddon && deleteAddon._id === row._id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AdminLayout>
            <PageLayout
                title="Add Ons"
                description="Manage your add-ons here."
                action={
                    <Button variant="yellow" size="lg" onClick={() => setOpen(true)}>
                        Add Add-on
                    </Button>
                }
            >
                <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />

                {/* ADD DIALOG */}
                <CustomAlertDialog
                    open={open}
                    onOpenChange={adding ? undefined : (val => {
                        setOpen(val);
                        if (!val) setImage("");
                    })}
                    title="Add Add-on"
                    description="Enter a new add-on name and price."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10 border border-[#FFC107] bg-[#232323] text-white text-lg font-bold"
                                disabled={adding}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="add-addon-form" variant="yellow" size="lg" loading={adding} disabled={adding}>
                                {adding ? 'Adding...' : 'Add'}
                            </Button>
                        </>
                    }
                >
                    <Form id="add-addon-form" onSubmit={handleAddAddon}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Add-on Name"
                                name="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                disabled={adding}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Extra Cheese, Syrup"
                                variant="dark"
                            />
                            <FormInput
                                label="Price"
                                name="price"
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                disabled={adding}
                                placeholder="Enter Price"
                                error={formError}
                                variant="dark"
                            />
                            <div>
                                <ImageUpload label="Image" value={image} onChange={setImage} disabled={adding} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* EDIT DIALOG */}
                <CustomAlertDialog
                    open={editOpen}
                    onOpenChange={updating ? undefined : setEditOpen}
                    title="Edit Add-on"
                    description="Update the add-on name and price."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={updating}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="edit-addon-form" variant="yellow" size="lg" loading={updating} disabled={updating}>
                                {updating ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    }
                >
                    <Form id="edit-addon-form" onSubmit={handleEditAddon}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Add-on Name"
                                name="editName"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                disabled={updating}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Extra Cheese, Syrup"
                                variant="dark"
                            />
                            <FormInput
                                label="Price"
                                name="editPrice"
                                type="number"
                                value={editPrice}
                                onChange={e => setEditPrice(e.target.value)}
                                disabled={updating}
                                error={formError}
                                variant="dark"
                            />
                            <div>
                                <ImageUpload label="Image" value={editImage} onChange={setEditImage} disabled={updating} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* DELETE DIALOG */}
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={deleting ? undefined : setDeleteOpen}
                    title="Delete Add-on"
                    description={`Are you sure you want to delete "${deleteAddon?.name}"? This action cannot be undone.`}
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
                                onClick={() => { setDeleting(true); deleteMutate(deleteAddon._id); }}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </>
                    }
                />

                {/* IMAGE PREVIEW MODAL */}
                <CustomAlertDialog
                    open={!!previewImage}
                    onOpenChange={open => { if (!open) setPreviewImage(""); }}
                    title="Image Preview"
                    description=""
                    actions={
                        <Button variant="yellow" size="lg" onClick={() => setPreviewImage("")}>Close</Button>
                    }
                >
                    {previewImage && (
                        <div className="flex justify-center items-center py-4" style={{ height: '40vh', overflow: 'auto' }}>
                            <img src={previewImage} alt="Preview" className="max-h-full max-w-full rounded border border-[#FFC107] shadow-lg mx-auto" />
                        </div>
                    )}
                </CustomAlertDialog>
            </PageLayout>
        </AdminLayout>
    );
}
