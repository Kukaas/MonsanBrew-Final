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
import { userAPI } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { Separator } from "@/components/ui/separator";
import CustomAlertDialog from '@/components/custom/CustomAlertDialog';
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { getRoleColor, getRoleIcon, getStatusColor, getStatusIcon } from '@/lib/utils';
import Form from '@/components/custom/Form';
import FormInput from '@/components/custom/FormInput';
import CustomSelect from '@/components/custom/CustomSelect';

const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "rider", label: "Rider" },
    { value: "customer", label: "Customer" },
    { value: "frontdesk", label: "Front Desk" }
];
const statusOptions = ["Verified", "Not Verified"];

export default function Users() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteId, setDeleteId] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusChangingUser, setStatusChangingUser] = useState(null);
    const [newStatus, setNewStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    // Modal state for create user
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("customer");
    const [formError, setFormError] = useState("");
    const [creating, setCreating] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await userAPI.getAllUsers();
            return res.data?.users || res.users || [];
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    const { mutate: createUser } = useMutation({
        mutationFn: async (newUser) => await userAPI.createUser(newUser),
        onSuccess: () => {
            setCreating(false);
            queryClient.invalidateQueries(['users']);
            setName("");
            setEmail("");
            setRole("customer");
            setFormError("");
            setCreateOpen(false);
            toast.success("User created successfully!");
        },
        onError: (err) => {
            setCreating(false);
            let msg = "Failed to create user";
            if (err?.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err?.message) {
                msg = err.message;
            } else if (typeof err === 'string') {
                msg = err;
            }
            setFormError(msg);
            toast.error(msg);
        }
    });

    const { mutate: deleteUser } = useMutation({
        mutationFn: async (id) => await userAPI.deleteUser(id),
        onSuccess: () => {
            toast.success("User deleted successfully!");
            setDeleteId(null);
            setDeleteOpen(false);
            setDeleteItem(null);
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Failed to delete user";
            toast.error(errorMessage);
            setDeleteId(null);
            setDeleteOpen(false);
            setDeleteItem(null);
        }
    });

    const { mutate: updateUser } = useMutation({
        mutationFn: async ({ id, data }) => await userAPI.updateUser(id, data),
        onSuccess: () => {
            toast.success("User status updated!");
            setStatusDialogOpen(false);
            setStatusChangingUser(null);
            setNewStatus(null);
            queryClient.invalidateQueries(['users']);
        },
        onError: (error) => {
            const errorMessage = error.response?.data?.message || "Failed to update user status";
            toast.error(errorMessage);
            setStatusDialogOpen(false);
            setStatusChangingUser(null);
            setNewStatus(null);
        },
        onSettled: () => {
            setStatusLoading(false);
        }
    });

    const handleCreateUser = (e) => {
        e.preventDefault();
        setFormError("");
        if (!name.trim()) return setFormError("Full name is required");
        if (!email.trim()) return setFormError("Email is required");
        const emailRegex = /^[^\s@]+@[^\\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return setFormError("Please enter a valid email address");
        setCreating(true);
        createUser({
            name: name.trim(),
            email: email.trim(),
            role
        });
    };

    const mappedData = (data || []).map(item => ({
        ...item,
        id: item._id,
        onEdit: () => navigate(`/admin/users/${item._id}/edit`),
        renderActions: (row) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent disablePortal>
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <Separator />
                    <DropdownMenuItem onClick={() => navigate(`/admin/users/${row.id}`)}>View</DropdownMenuItem>
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
        {
            accessorKey: "name",
            header: "Name",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div>
                        <div className="font-medium text-white">{row.name}</div>
                        <div className="text-sm text-gray-400">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            render: (row) => (
                <div className="flex justify-center">
                    <Badge className={`${getRoleColor(row.role)} border rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 w-fit`}>
                        {getRoleIcon(row.role)}
                        {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                    </Badge>
                </div>
            ),
            meta: { filterOptions: roleOptions.map(r => r.value) },
            accessorFn: row => row.role
        },
        {
            id: "status",
            header: "Status",
            render: (row) => (
                <div className="flex justify-center items-center w-full">
                    <Badge className={`${getStatusColor(row.isVerified ? 'completed' : 'cancelled')} border rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 w-fit`}>
                        {getStatusIcon(row.isVerified ? 'completed' : 'cancelled')}
                        {row.isVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                </div>
            ),
            meta: { filterOptions: statusOptions },
            accessorFn: row => row.isVerified ? "Verified" : "Not Verified"
        },
        {
            accessorKey: "contactNumber",
            header: "Contact",
            render: (row) => (
                <span className="text-white">{row.contactNumber || 'N/A'}</span>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            render: (row) => (
                <span className="text-white">
                    {new Date(row.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </span>
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
                title="User Management" 
                description="Manage user accounts, roles, and permissions."
                action={
                    <Button variant="yellow" size="lg" onClick={() => setCreateOpen(true)}>
                        Add User
                    </Button>
                }
            >
                <DataTable 
                    columns={columns} 
                    data={mappedData} 
                    loading={isLoading} 
                    rowKey="id" 
                />
                {/* CREATE USER MODAL */}
                <CustomAlertDialog
                    open={createOpen}
                    onOpenChange={creating ? undefined : setCreateOpen}
                    title="Add User"
                    description="Enter the user's full name, email, and role. The password will be generated and sent to their email."
                    actions={
                        <>
                            <AlertDialogCancel
                                className="h-10 border border-[#FFC107] bg-[#232323] text-white text-lg font-bold"
                                disabled={creating}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button type="submit" form="add-user-form" variant="yellow" size="lg" loading={creating} disabled={creating}>
                                {creating ? 'Adding...' : 'Add'}
                            </Button>
                        </>
                    }
                >
                    <Form id="add-user-form" onSubmit={handleCreateUser}>
                        <FormInput
                            label="Full Name"
                            name="name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={creating}
                            autoFocus
                            error={formError}
                            placeholder="Enter full name"
                            variant="dark"
                        />
                        <FormInput
                            label="Email Address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={creating}
                            error={formError}
                            placeholder="Enter email address"
                            variant="dark"
                        />
                        <div className="flex flex-col gap-1 mt-2">
                            <label htmlFor="role" className="font-bold text-[#FFC107]">Role *</label>
                            <CustomSelect
                                id="role"
                                value={role}
                                onChange={setRole}
                                options={roleOptions}
                                placeholder="Select user role"
                                name="role"
                                error={formError}
                                variant="dark"
                                disabled={creating}
                            />
                        </div>
                        {formError && <div className="text-red-500 text-sm mt-2">{formError}</div>}
                    </Form>
                </CustomAlertDialog>
                {/* Delete User Dialog */}
                <CustomAlertDialog
                    open={deleteOpen}
                    onOpenChange={deleting ? undefined : setDeleteOpen}
                    title="Delete User"
                    description={`Are you sure you want to delete "${deleteItem?.name}"? This action cannot be undone.`}
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
                                    deleteUser(deleteItem._id, {
                                        onSuccess: () => {
                                            setDeleting(false);
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
                    title="Change User Status"
                    description={`Are you sure you want to mark "${statusChangingUser?.name}" as ${newStatus ? 'Verified' : 'Not Verified'}?`}
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
                                    updateUser({
                                        id: statusChangingUser._id,
                                        data: { isVerified: newStatus },
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