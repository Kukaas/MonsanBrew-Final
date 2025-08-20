import { useState } from "react";
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
import { expensesAPI } from "@/services/api";
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
import { useLocation } from 'react-router-dom';

function useExpensesQuery() {
  return new URLSearchParams(useLocation().search);
}

const categoryOptions = [
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'salary', label: 'Salary' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'ingredients', label: 'Ingredients' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'other', label: 'Other' },
];

const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'gcash', label: 'GCash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
];

export default function Expenses() {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("utilities");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [date, setDate] = useState("");
    const [receipt, setReceipt] = useState("");
    const [formError, setFormError] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editDescription, setEditDescription] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [editCategory, setEditCategory] = useState("utilities");
    const [editPaymentMethod, setEditPaymentMethod] = useState("cash");
    const [editDate, setEditDate] = useState("");
    const [editReceipt, setEditReceipt] = useState("");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const queryClient = useQueryClient();
    const [previewImage, setPreviewImage] = useState("");
    const [adding, setAdding] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const query = useExpensesQuery();
    const highlightedId = query.get('highlight');

    const { data, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            try {
                const res = await expensesAPI.getAll();
                return res.data || res;
            } catch {
                return { expenses: [], pagination: { total: 0, pages: 0 } };
            }
        },
    });

    const { mutate } = useMutation({
        mutationFn: async (newItem) => {
            return await expensesAPI.create(newItem);
        },
        onSuccess: () => {
            setAdding(false);
            queryClient.invalidateQueries(['expenses']);
            setDescription("");
            setAmount("");
            setCategory("utilities");
            setPaymentMethod("cash");
            setDate("");
            setReceipt("");
            setFormError("");
            setOpen(false);
            toast.success("Expense added successfully!")
        },
        onError: (error) => {
            setAdding(false);
            setFormError(error?.response?.data?.error || "Failed to add expense");
        }
    });

    const { mutate: updateMutate } = useMutation({
        mutationFn: async ({ id, description, amount, category, paymentMethod, date, receipt }) => {
            return await expensesAPI.update(id, { description, amount, category, paymentMethod, date, receipt });
        },
        onSuccess: () => {
            setUpdating(false);
            queryClient.invalidateQueries(['expenses']);
            setEditOpen(false);
            setEditItem(null);
            setEditDescription("");
            setEditAmount("");
            setEditCategory("utilities");
            setEditPaymentMethod("cash");
            setEditDate("");
            setEditReceipt("");
            setReceipt("");
            toast.success("Expense updated successfully!");
        },
        onError: (error) => {
            setUpdating(false);
            setFormError(error?.response?.data?.error || "Failed to update expense");
        }
    });

    const { mutate: deleteMutate } = useMutation({
        mutationFn: async (id) => {
            return await expensesAPI.delete(id);
        },
        onSuccess: () => {
            setDeleting(false);
            queryClient.invalidateQueries(['expenses']);
            setDeleteOpen(false);
            setDeleteItem(null);
            toast.success("Expense deleted successfully!");
        },
        onError: (error) => {
            setDeleting(false);
            toast.error(error?.response?.data?.error || "Failed to delete expense");
        }
    });

    const handleAdd = (e) => {
        e.preventDefault();
        setFormError("");
        if (!description.trim()) {
            setFormError("Description is required");
            return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            setFormError("Valid amount is required");
            return;
        }
        setAdding(true);
        mutate({
            description: description.trim(),
            amount: Number(amount),
            category,
            paymentMethod,
            date: date || new Date().toISOString().split('T')[0],
            receipt
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setFormError("");
        if (!editDescription.trim()) {
            setFormError("Description is required");
            return;
        }
        if (!editAmount || isNaN(editAmount) || editAmount <= 0) {
            setFormError("Valid amount is required");
            return;
        }
        setUpdating(true);
        updateMutate({
            id: editItem._id,
            description: editDescription.trim(),
            amount: Number(editAmount),
            category: editCategory,
            paymentMethod: editPaymentMethod,
            date: editDate || editItem.date,
            receipt: editReceipt
        });
    };

    const expenses = data?.expenses || [];
    const mappedData = expenses.map(item => ({ ...item, id: item._id }));

    const columns = [
        { accessorKey: "description", header: "Description" },
        {
            accessorKey: "amount",
            header: "Amount",
            cell: ({ row }) => `₱${row.original.amount?.toFixed(2) || "0.00"}`,
        },
        {
            accessorKey: "category",
            header: "Category",
            render: row => {
                const found = categoryOptions.find(opt => opt.value === row.category);
                return found ? found.label : row.category;
            },
            meta: { filterOptions: categoryOptions.map(opt => opt.label) }
        },
        {
            accessorKey: "paymentMethod",
            header: "Payment Method",
            render: row => {
                const found = paymentMethodOptions.find(opt => opt.value === row.paymentMethod);
                return found ? found.label : row.paymentMethod;
            },
            meta: { filterOptions: paymentMethodOptions.map(opt => opt.label) }
        },
        {
            accessorKey: "date",
            header: "Date",
            render: row => dayjs(row.date).format('MMMM D, YYYY'),
            meta: { filterType: 'date' }
        },
        {
            accessorKey: "receipt",
            header: "Receipt",
            render: row => row.receipt ? (
                <img
                    src={row.receipt}
                    alt="Receipt"
                    className="h-12 w-12 object-cover rounded border border-[#FFC107] mx-auto cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => setPreviewImage(row.receipt)}
                />
            ) : <span className="text-[#BDBDBD]">No Receipt</span>,
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
                                setEditItem(row);
                                setEditDescription(row.description);
                                setEditAmount(row.amount);
                                setEditCategory(row.category);
                                setEditPaymentMethod(row.paymentMethod);
                                setEditDate(row.date ? dayjs(row.date).format('YYYY-MM-DD') : "");
                                setEditReceipt(row.receipt || "");
                                setEditOpen(true);
                            }}>
                            {updating && editItem && editItem._id === row._id ? 'Saving...' : 'Edit'}
                        </DropdownMenuItem>
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
            ),
        },
    ];

    return (
        <AdminLayout>
            <PageLayout
                title="Expenses"
                description="Track and manage your business expenses here."
                action={
                    <Button variant="yellow" size="lg" onClick={() => setOpen(true)}>
                        Add Expense
                    </Button>
                }
            >
                <DataTable columns={columns} data={mappedData} loading={isLoading} rowKey="id" highlightedId={highlightedId} />

                {/* ADD DIALOG */}
                <CustomAlertDialog
                    open={open}
                    onOpenChange={adding ? undefined : (val => {
                        setOpen(val);
                        if (!val) setReceipt("");
                    })}
                    title="Add Expense"
                    description="Enter a new expense record."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10 border border-[#FFC107] bg-[#232323] text-white text-lg font-bold"
                                disabled={adding}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="add-expense-form" variant="yellow" size="lg" loading={adding} disabled={adding}>
                                {adding ? 'Adding...' : 'Add'}
                            </Button>
                        </>
                    }
                >
                    <Form id="add-expense-form" onSubmit={handleAdd}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Description"
                                name="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={adding}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Electricity bill, Coffee beans purchase"
                                variant="dark"
                            />
                            <FormInput
                                label="Amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                disabled={adding}
                                error={formError}
                                placeholder="Enter amount"
                                variant="dark"
                            />
                            <CustomSelect
                                label="Category"
                                value={category}
                                onChange={setCategory}
                                options={categoryOptions}
                                placeholder="Select category"
                                disabled={adding}
                                name="category"
                            />
                            <CustomSelect
                                label="Payment Method"
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                                options={paymentMethodOptions}
                                placeholder="Select payment method"
                                disabled={adding}
                                name="paymentMethod"
                            />
                            <CustomDatePicker
                                label="Date"
                                value={date}
                                onChange={setDate}
                                placeholder="Select date"
                                disabled={adding}
                                name="date"
                            />
                            <div>
                                <ImageUpload label="Receipt" value={receipt} onChange={setReceipt} disabled={adding} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* EDIT DIALOG */}
                <CustomAlertDialog
                    open={editOpen}
                    onOpenChange={updating ? undefined : setEditOpen}
                    title="Edit Expense"
                    description="Update the expense record."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10"
                                disabled={updating}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="edit-expense-form" variant="yellow" size="lg" loading={updating} disabled={updating}>
                                {updating ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    }
                >
                    <Form id="edit-expense-form" onSubmit={handleEdit}>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label="Description"
                                name="editDescription"
                                value={editDescription}
                                onChange={e => setEditDescription(e.target.value)}
                                disabled={updating}
                                autoFocus
                                error={formError}
                                placeholder="e.g. Electricity bill, Coffee beans purchase"
                                variant="dark"
                            />
                            <FormInput
                                label="Amount"
                                name="editAmount"
                                type="number"
                                step="0.01"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                disabled={updating}
                                error={formError}
                                placeholder="Enter amount"
                                variant="dark"
                            />
                            <CustomSelect
                                label="Category"
                                value={editCategory}
                                onChange={setEditCategory}
                                options={categoryOptions}
                                placeholder="Select category"
                                disabled={updating}
                                name="editCategory"
                            />
                            <CustomSelect
                                label="Payment Method"
                                value={editPaymentMethod}
                                onChange={setEditPaymentMethod}
                                options={paymentMethodOptions}
                                placeholder="Select payment method"
                                disabled={updating}
                                name="editPaymentMethod"
                            />
                            <CustomDatePicker
                                label="Date"
                                value={editDate}
                                onChange={setEditDate}
                                placeholder="Select date"
                                disabled={updating}
                                name="editDate"
                            />
                            <div>
                                <ImageUpload label="Receipt" value={editReceipt} onChange={setEditReceipt} disabled={updating} error={formError} />
                            </div>
                        </div>
                    </Form>
                </CustomAlertDialog>

                {/* DELETE DIALOG */}
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={deleting ? undefined : setDeleteOpen}
                    title="Delete Expense"
                    description={`Are you sure you want to delete "${deleteItem?.description}"? This action cannot be undone.`}
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
                                onClick={() => { setDeleting(true); deleteMutate(deleteItem._id); }}
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
                    title="Receipt Preview"
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
