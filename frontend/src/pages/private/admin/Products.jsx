import React from "react";
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
import { IconCircleCheckFilled, IconDotsVertical, IconLoader } from "@tabler/icons-react";

const columns = [
    { accessorKey: "name", header: "Product Name" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "price", header: "Price", render: row => `₱${row.price}` },
    {
        id: "status",
        header: "Status",
        render: (row) => (
            <Badge variant="outline" className="px-1.5">
                {row.stock > 0 ? (
                    <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
                ) : (
                    <IconLoader className="text-red-500" />
                )}
                {row.stock > 0 ? <span className="text-green-500">Available</span> : <span className="text-red-500">Not Available</span>}
            </Badge>
        ),
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
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

const data = [
    { id: 1, name: "Coffee Beans", category: "Beverage", price: 250, stock: 0 },
    { id: 2, name: "Espresso Shot", category: "Beverage", price: 80, stock: 200 },
    { id: 3, name: "Mug", category: "Merchandise", price: 150, stock: 40 },
    { id: 4, name: "Tumbler", category: "Merchandise", price: 350, stock: 25 },
    { id: 5, name: "Cold Brew", category: "Beverage", price: 180, stock: 60 },
    { id: 6, name: "Tea", category: "Beverage", price: 120, stock: 90 },
    { id: 7, name: "Cookie", category: "Snack", price: 60, stock: 150 },
    { id: 8, name: "Brownie", category: "Snack", price: 70, stock: 80 },
    { id: 9, name: "Sandwich", category: "Snack", price: 110, stock: 50 },
    { id: 10, name: "Matcha Latte", category: "Beverage", price: 160, stock: 0 },
    { id: 11, name: "Mocha", category: "Beverage", price: 170, stock: 65 },
    { id: 12, name: "Bagel", category: "Snack", price: 90, stock: 30 },
];

export default function Products() {
    return (
        <AdminLayout>
            <PageLayout title="Products" description="Manage your product inventory, pricing, and stock levels here.">
                <DataTable columns={columns} data={data} />
            </PageLayout>
        </AdminLayout>
    );
}
