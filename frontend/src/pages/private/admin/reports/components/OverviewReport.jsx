import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { reportsAPI } from "@/services/api";
import FormInput from "@/components/custom/FormInput";
import DataTable from "@/components/custom/DataTable";
import { Button } from "@/components/ui/button";

export default function OverviewReport() {
  const [filters, setFilters] = useState({ startDate: "", endDate: "", status: "all" });

  const { data: summaryData } = useQuery({
    queryKey: ["reports-summary", filters],
    queryFn: async () => {
      const res = await reportsAPI.getSummary({ startDate: filters.startDate, endDate: filters.endDate });
      return res.data || res;
    },
  });

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["reports-orders", filters],
    queryFn: async () => {
      const res = await reportsAPI.getOrders(filters);
      return res.data || res;
    },
  });

  const orders = ordersData?.orders || [];
  const mapped = orders.map((o) => ({
    id: o._id,
    date: new Date(o.createdAt).toLocaleString(),
    customer: o.userId?.name || "Unknown",
    status: o.status,
    total: o.total,
    items: o.items?.length || 0,
  }));

  const columns = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "customer", header: "Customer" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "total", header: "Total", render: (row) => `₱${Number(row.total || 0).toFixed(2)}` },
    { accessorKey: "items", header: "Items" },
  ];

  function exportCSV() {
    const headers = ["Date", "Customer", "Status", "Total", "Items"];
    const rows = orders.map((o) => {
      const dt = new Date(o.createdAt);
      const pad = (n) => String(n).padStart(2, "0");
      // Include time, and use a comma-safe format
      const dateStr = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
      return [
        dateStr,
        o.userId?.name || "Unknown",
        o.status,
        typeof o.total === "number" ? o.total.toFixed(2) : o.total,
        o.items?.length || 0,
      ];
    });
    // Append footer with Delivery Fees (₱15 each) and Total Sales (Net)
    const orderCount = Number(summaryData?.summary?.orderCount || 0);
    const deliveryFees = (orderCount * 15).toFixed(2);
    const netSales = Number(summaryData?.summary?.netSales || 0).toFixed(2);
    rows.push(["", "", "", "", ""]);
    rows.push(["", "", "Delivery Fees (₱15 each)", deliveryFees, ""]);
    rows.push(["", "", "Total Sales (Net)", netSales, ""]);
    const escape = (val) => {
      const s = String(val ?? "");
      const needsQuote = /[",\n]/.test(s);
      const safe = s.replace(/"/g, '""');
      return needsQuote ? `"${safe}"` : safe;
    };
    const csv = [[...headers].map(escape), ...rows.map((row) => row.map(escape))]
      .map((row) => row.join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const rangeLabel = filters.startDate && filters.endDate ? `_${filters.startDate}_to_${filters.endDate}` : "";
    link.setAttribute("download", `sales_orders${rangeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput label="Start Date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} variant="dark" />
        <FormInput label="End Date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} variant="dark" />
        <div className="flex items-end">
          <Button variant="yellow" onClick={exportCSV} disabled={mapped.length === 0}>Export CSV</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Orders" value={summaryData?.summary?.orderCount || 0} />
        <SummaryCard title="Gross Sales" value={`₱${Number(summaryData?.summary?.grossSales || 0).toFixed(2)}`} />
        <SummaryCard title="Refunds" value={`₱${Number(summaryData?.summary?.totalRefunds || 0).toFixed(2)}`} />
        <SummaryCard title="Net Sales" value={`₱${Number(summaryData?.summary?.netSales || 0).toFixed(2)}`} />
      </div>
      <DataTable columns={columns} data={mapped} loading={isLoading} rowKey="id" />
    </>
  );
}

export function SummaryCard({ title, value }) {
  return (
    <div className="bg-[#181818] rounded-2xl border border-[#232323] p-4">
      <div className="text-[#BDBDBD] text-sm mb-1">{title}</div>
      <div className="text-white text-2xl font-extrabold">{value}</div>
    </div>
  );
}

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};


