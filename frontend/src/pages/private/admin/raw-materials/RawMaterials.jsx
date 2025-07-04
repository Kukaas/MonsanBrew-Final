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
import { rawMaterialsAPI } from "@/services/api";
import dayjs from 'dayjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import Form from '@/components/custom/Form';
import FormInput from '@/components/custom/FormInput';
import { toast } from "sonner";
import { AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Separator } from "@/components/ui/separator";
import ImageUpload from '@/components/custom/ImageUpload';
import CustomSelect from '@/components/custom/CustomSelect';
import CustomDatePicker from '@/components/custom/CustomDatePicker';
import StatusBadge from '@/components/custom/StatusBadge';

const statusOptions = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'expired', label: 'Expired' },
    { value: 'low_stock', label: 'Low Stock' },
];

const unitOptions = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'kilograms', label: 'Kilograms' },
    { value: 'grams', label: 'Grams' },
    { value: 'liters', label: 'Liters' },
    { value: 'milliliters', label: 'Milliliters' },
    { value: 'packs', label: 'Packs' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'cans', label: 'Cans' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'trays', label: 'Trays' },
    { value: 'sachets', label: 'Sachets' },
    { value: 'dozens', label: 'Dozens' },
];

export default function RawMaterials() {
    const [open, setOpen] = useState(false);
    const [productName, setProductName] = useState("");
    const [stock, setStock] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [status, setStatus] = useState("in_stock");
    const [unit, setUnit] = useState('pieces');
    const [formError, setFormError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editProductName, setEditProductName] = useState("");
    const [editStock, setEditStock] = useState("");
    const [editExpirationDate, setEditExpirationDate] = useState("");
    const [editStatus, setEditStatus] = useState("in_stock");
    const [editUnit, setEditUnit] = useState('pieces');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const queryClient = useQueryClient();
    const [image, setImage] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [editImage, setEditImage] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['raw-materials'],
        queryFn: async () => {
            try {
                const res = await rawMaterialsAPI.getAll();
                return res || [];
            } catch {
                return [];
            }
        },
    });

    const { mutate, isLoading: isAdding } = useMutation({
        mutationFn: async (newItem) => {
            return await rawMaterialsAPI.create(newItem);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['raw-materials']);
            setProductName("");
            setStock("");
            setExpirationDate("");
            setStatus("in_stock");
            setUnit("pieces");
            setFormError("");
            setOpen(false);
            toast.success("Raw material added successfully!")
        },
        onError: (error) => {
            setFormError(error?.response?.data?.error || "Failed to add raw material");
        }
    });

    const { mutate: updateMutate, isLoading: isUpdating } = useMutation({
        mutationFn: async ({ id, productName, stock, expirationDate, status, image, unit }) => {
            return await rawMaterialsAPI.update(id, { productName, stock, expirationDate, status, image, unit });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['raw-materials']);
            setEditOpen(false);
            setEditItem(null);
            setEditProductName("");
            setEditStock("");
            setEditExpirationDate("");
            setEditStatus("in_stock");
            setEditUnit("pieces");
            setImage("");
            setEditImage("");
            toast.success("Raw material updated successfully!");
        },
        onError: (error) => {
            setFormError(error?.response?.data?.error || "Failed to update raw material");
        }
    });

    const { mutate: deleteMutate, isLoading: isDeleting } = useMutation({
        mutationFn: async (id) => {
            return await rawMaterialsAPI.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['raw-materials']);
            setDeleteOpen(false);
            setDeleteItem(null);
            toast.success("Raw material deleted successfully!");
        },
        onError: (error) => {
            toast.error(error?.response?.data?.error || "Failed to delete raw material");
        }
    });

    const handleAdd = (e) => {
        e.preventDefault();
        setFormError("");
        if (!productName.trim()) {
            setFormError("Product name is required");
            return;
        }
        if (!stock || isNaN(stock)) {
            setFormError("Valid stock is required");
            return;
        }
        mutate({ productName: productName.trim(), stock: Number(stock), expirationDate, status, image, unit });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setFormError("");
        if (!editProductName.trim()) {
            setFormError("Product name is required");
            return;
        }
        if (!editStock || isNaN(editStock)) {
            setFormError("Valid stock is required");
            return;
        }
        updateMutate({ id: editItem._id, productName: editProductName.trim(), stock: Number(editStock), expirationDate: editExpirationDate, status: editStatus, image: editImage, unit: editUnit });
    };

    const mappedData = (data || []).map(item => ({ ...item, id: item._id }));

    const columns = [
        { accessorKey: "productName", header: "Product Name" },
        { accessorKey: "stock", header: "Stock" },
        {
            accessorKey: "unit",
            header: "Unit",
            render: row => {
                const found = unitOptions.find(opt => opt.value === row.unit);
                return found ? found.label : row.unit;
            }
        },
        {
            accessorKey: "expirationDate",
            header: "Expiration Date",
            render: row => row.expirationDate ? dayjs(row.expirationDate).format('MMMM D, YYYY') : <span className="text-[#BDBDBD]">N/A</span>,
        },
        {
            id: "status",
            header: "Status",
            render: row => <StatusBadge stock={row.stock} status={row.status} />,
        },
        {
            accessorKey: "image",
            header: "Image",
            render: row => row.image ? (
                <img
                    src={row.image}
                    alt="Raw Material"
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
                            disabled={isUpdating}
                            onClick={() => {
                                setEditItem(row);
                                setEditProductName(row.productName);
                                setEditStock(row.stock);
                                setEditExpirationDate(row.expirationDate ? dayjs(row.expirationDate).format('YYYY-MM-DD') : "");
                                setEditStatus(row.status);
                                setEditUnit(row.unit || "pieces");
                                setEditImage(row.image || "");
                                setEditOpen(true);
                            }}>
                            {isUpdating && editItem && editItem._id === row._id ? 'Saving...' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500"
                            disabled={isDeleting}
                            onClick={() => {
                                setDeleteItem(row);
                                setDeleteOpen(true);
                            }}>
                            {isDeleting && deleteItem && deleteItem._id === row._id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <AdminLayout>
            <PageLayout
                title="Raw Materials"
                description="Manage your raw materials here."
                action={
                    <Button variant="yellow" size="lg" onClick={() => setOpen(true)}>
                        Add Raw Material
                    </Button>
                }
            >
                <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" />

                {/* ADD DIALOG */}
                <CustomAlertDialog
                    open={open}
                    onOpenChange={isAdding ? undefined : (val => {
                        setOpen(val);
                        if (!val) setImage("");
                    })}
                    title="Add Raw Material"
                    description="Enter a new raw material."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10 border border-[#FFC107] bg-[#232323] text-white text-lg font-bold"
                                disabled={isAdding}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="add-raw-material-form" variant="yellow" size="lg" loading={isAdding} disabled={isAdding}>
                                {isAdding ? 'Adding...' : 'Add'}
                            </Button>
                        </>
                    }
                >
                    <Form id="add-raw-material-form" onSubmit={handleAdd}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Product Name"
                                name="productName"
                                value={productName}
                                onChange={e => setProductName(e.target.value)}
                                disabled={isAdding}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Buns, Coffee Beans"
                                variant="dark"
                            />
                            <FormInput
                                label="Stock"
                                name="stock"
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                disabled={isAdding}
                                error={formError}
                                placeholder="Enter stock quantity"
                                variant="dark"
                            />
                            <CustomSelect
                                label="Unit"
                                value={unit}
                                onChange={setUnit}
                                options={unitOptions}
                                placeholder="Select unit"
                                disabled={isAdding}
                                name="unit"
                            />
                            <CustomDatePicker
                                label="Expiration Date"
                                value={expirationDate}
                                onChange={setExpirationDate}
                                placeholder="Select date"
                                disabled={isAdding}
                                name="expirationDate"
                            />
                            <CustomSelect
                                label="Status"
                                value={status}
                                onChange={setStatus}
                                options={statusOptions}
                                placeholder="Select status"
                                disabled={isAdding}
                                name="status"
                            />
                            <div>
                                <ImageUpload label="Image" value={image} onChange={setImage} disabled={isAdding} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* EDIT DIALOG */}
                <CustomAlertDialog
                    open={editOpen}
                    onOpenChange={isUpdating ? undefined : setEditOpen}
                    title="Edit Raw Material"
                    description="Update the raw material."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={isUpdating}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="edit-raw-material-form" variant="yellow" size="lg" loading={isUpdating} disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    }
                >
                    <Form id="edit-raw-material-form" onSubmit={handleEdit}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Product Name"
                                name="editProductName"
                                value={editProductName}
                                onChange={e => setEditProductName(e.target.value)}
                                disabled={isUpdating}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Buns, Coffee Beans"
                                variant="dark"
                            />
                            <FormInput
                                label="Stock"
                                name="editStock"
                                type="number"
                                value={editStock}
                                onChange={e => setEditStock(e.target.value)}
                                disabled={isUpdating}
                                error={formError}
                                placeholder="Enter stock quantity"
                                variant="dark"
                            />
                            <CustomSelect
                                label="Unit"
                                value={editUnit}
                                onChange={setEditUnit}
                                options={unitOptions}
                                placeholder="Select unit"
                                disabled={isUpdating}
                                name="editUnit"
                            />
                            <CustomDatePicker
                                label="Expiration Date"
                                value={editExpirationDate}
                                onChange={setEditExpirationDate}
                                placeholder="Select date"
                                disabled={isUpdating}
                                name="editExpirationDate"
                            />
                            <CustomSelect
                                label="Status"
                                value={editStatus}
                                onChange={setEditStatus}
                                options={statusOptions}
                                placeholder="Select status"
                                disabled={isUpdating}
                                name="editStatus"
                            />
                            <div>
                                <ImageUpload label="Image" value={editImage} onChange={setEditImage} disabled={isUpdating} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* DELETE DIALOG */}
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={isDeleting ? undefined : setDeleteOpen}
                    title="Delete Raw Material"
                    description={`Are you sure you want to delete "${deleteItem?.productName}"? This action cannot be undone.`}
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={isDeleting}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                variant="yellow"
                                size="lg"
                                loading={isDeleting}
                                disabled={isDeleting}
                                onClick={() => deleteMutate(deleteItem._id)}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
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
