import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsAPI } from "@/services/api";
import FormInput from "@/components/custom/FormInput";
import CustomSelect from "@/components/custom/CustomSelect";
import DataTable from "@/components/custom/DataTable";

export default function DeliveryReport() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "", riderId: "" });

  const { data } = useQuery({
    queryKey: ["reports-delivery", filters],
    queryFn: async () => {
      const res = await reportsAPI.getDeliveryPerformance(filters);
      return res.data || res;
    },
  });

  const { data: ridersData } = useQuery({
    queryKey: ["reports-riders", { startDate: filters.startDate, endDate: filters.endDate }],
    queryFn: async () => {
      const res = await reportsAPI.getRiderPerformance({ startDate: filters.startDate, endDate: filters.endDate });
      return res.data || res;
    },
  });

  let rows = (data?.riders || []).map((r) => ({
    id: r.rider?._id ? String(r.rider._id) : String(Math.random()),
    rider: r.rider?.name || r.rider?.email || "Unknown",
    avgRating: Number(r.avgRating || 0).toFixed(1),
    reviews: r.reviews || 0,
  }));
  if (filters.riderId) {
    rows = rows.filter((row) => row.id === filters.riderId);
  }
  const riderOptions = (ridersData?.riders || [])
    .filter((r) => !!r.rider?._id)
    .map((r) => ({
      value: String(r.rider._id),
      label: r.rider?.name || r.rider?.email || "Unknown",
    }));

  const columns = [
    { accessorKey: "rider", header: "Rider" },
    { accessorKey: "avgRating", header: "Avg Rating" },
    { accessorKey: "reviews", header: "Reviews" },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput label="Start Date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} variant="dark" />
        <FormInput label="End Date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} variant="dark" />
        {/* <CustomSelect
          label="Rider"
          value={filters.riderId || "all"}
          onChange={(v) => setFilters((f) => ({ ...f, riderId: v === "all" ? "" : v }))}
          options={[{ value: "all", label: "All Riders" }, ...riderOptions]}
          placeholder="Select rider"
          className="w-full"
          variant="dark"
        /> */}
      </div>
      <DataTable columns={columns} data={rows} loading={false} rowKey="id" />
    </>
  );
}


