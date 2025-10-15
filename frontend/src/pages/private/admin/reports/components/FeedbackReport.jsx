import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsAPI } from "@/services/api";
import FormInput from "@/components/custom/FormInput";
import DataTable from "@/components/custom/DataTable";

export default function FeedbackReport() {
    const [filters, setFilters] = useState({ startDate: "", endDate: "", search: "" });

    const { data, isLoading } = useQuery({
        queryKey: ["reports-feedback", filters],
        queryFn: async () => {
            const res = await reportsAPI.getFeedback({
                startDate: filters.startDate,
                endDate: filters.endDate,
                limit: 100,
            });
            return res.data || res;
        },
    });

    let rows = (data?.recentReviews || []).map((r) => ({
        id: r._id,
        date: new Date(r.createdAt).toLocaleString(),
        product: r.productId?.productName || "Product",
        customer: r.userId?.name || r.userId?.email || "Customer",
        rating: r.rating,
        comment: r.comment || "",
    }));

    if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        rows = rows.filter((row) =>
            row.product.toLowerCase().includes(q) ||
            row.customer.toLowerCase().includes(q) ||
            row.comment.toLowerCase().includes(q)
        );
    }

    const columns = [
        { accessorKey: "date", header: "Date" },
        { accessorKey: "product", header: "Product" },
        { accessorKey: "customer", header: "Customer" },
        { accessorKey: "rating", header: "Rating" },
        { accessorKey: "comment", header: "Comment" },
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <FormInput label="Start Date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} variant="dark" />
                <FormInput label="End Date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} variant="dark" />
                <FormInput label="Search" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search product, customer, comment" variant="dark" />
            </div>
            <DataTable columns={columns} data={rows} loading={isLoading} rowKey="id" />
        </>
    );
}


