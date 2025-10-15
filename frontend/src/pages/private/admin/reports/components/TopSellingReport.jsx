import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsAPI, productAPI } from "@/services/api";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import DataTable from "@/components/custom/DataTable";

export default function TopSellingReport() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "", productId: "" });

  const { data } = useQuery({
    queryKey: ["reports-summary-top", filters],
    queryFn: async () => {
      const res = await reportsAPI.getSummary(filters);
      return res.data || res;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const res = await productAPI.getAll();
      return res.data || res;
    },
  });

  const top = (data?.topProducts || []).map((p) => ({
    id: p._id,
    productName: p.productName,
    totalSold: p.totalSold || 0,
    averageRating: typeof p.averageRating === "number" ? Number(p.averageRating).toFixed(1) : "0.0",
  }));

  const columns = [
    { accessorKey: "productName", header: "Product" },
    { accessorKey: "totalSold", header: "Sold" },
    { accessorKey: "averageRating", header: "Avg Rating" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput label="Start Date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} variant="dark" />
        <FormInput label="End Date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} variant="dark" />
        <CustomSelect
          label="Product"
          value={filters.productId || "all"}
          onChange={(v) => setFilters((f) => ({ ...f, productId: v === "all" ? "" : v }))}
          options={[
            { value: "all", label: "All Products" },
            ...(
              (productsData?.map ? productsData : productsData?.products || [])
                .filter((p) => !!p?._id && !!p?.productName)
                .map((p) => ({ value: p._id, label: p.productName }))
            )
          ]}
          placeholder="Select product"
          className="w-full"
        />
      </div>
      <DataTable columns={columns} data={top} loading={false} rowKey="id" />
    </>
  );
}


