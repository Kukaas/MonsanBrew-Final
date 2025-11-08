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

  // Filter to only completed orders for summary calculations
  const completedOrders = orders.filter((o) =>
    o.status?.toLowerCase() === "completed"
  );

  // Calculate summary from completed orders only
  // Note: o.total already includes delivery fee (e.g., 145 + 15 = 160)
  const completedOrderCount = completedOrders.length;
  const DELIVERY_FEE = 15;
  const completedGrossSales = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0); // Gross = total (includes delivery fee)
  const totalRefunds = Number(summaryData?.summary?.totalRefunds || 0);
  // Net sales = (total - delivery fee) - refunds, matching backend calculation
  const completedNetSales = completedOrders.reduce((sum, o) => {
    const refunded = o.refundStatus === "refund_processed" ? (Number(o.refundAmount) || 0) : 0;
    return sum + Math.max(0, (Number(o.total) || 0) - DELIVERY_FEE - refunded);
  }, 0);

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
    // Filter to only completed orders
    const completedOrders = orders.filter((o) =>
      o.status?.toLowerCase() === "completed"
    );

    const headers = ["Date", "Customer", "Status", "Total", "Items"];
    const rows = completedOrders.map((o) => {
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
    // Calculate totals from completed orders only
    // Note: o.total already includes delivery fee
    const orderCount = completedOrders.length;
    const DELIVERY_FEE = 15;
    const grossSales = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0); // Gross = total (includes delivery fee)
    const deliveryFees = (orderCount * DELIVERY_FEE).toFixed(2);
    // Net sales = (total - delivery fee) - refunds, matching backend calculation
    const totalRefunds = completedOrders.reduce((sum, o) => {
      const refunded = o.refundStatus === "refund_processed" ? (Number(o.refundAmount) || 0) : 0;
      return sum + refunded;
    }, 0);
    const netSales = completedOrders.reduce((sum, o) => {
      const refunded = o.refundStatus === "refund_processed" ? (Number(o.refundAmount) || 0) : 0;
      return sum + Math.max(0, (Number(o.total) || 0) - DELIVERY_FEE - refunded);
    }, 0);
    rows.push(["", "", "", "", ""]);
    rows.push(["", "", "Delivery Fees (₱15 each)", deliveryFees, ""]);
    rows.push(["", "", "Gross Sales", grossSales.toFixed(2), ""]);
    rows.push(["", "", "Refunds", totalRefunds.toFixed(2), ""]);
    rows.push(["", "", "Total Sales (Net)", netSales.toFixed(2), ""]);
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

  function handlePrint() {
    // Filter to only completed orders
    const completedOrders = orders.filter((o) =>
      o.status?.toLowerCase() === "completed"
    );

    const printWindow = window.open("", "_blank");

    // Calculate totals from completed orders only
    // Note: o.total already includes delivery fee
    const orderCount = completedOrders.length;
    const DELIVERY_FEE = 15;
    const grossSales = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0); // Gross = total (includes delivery fee)
    const deliveryFees = orderCount * DELIVERY_FEE;
    // Net sales = (total - delivery fee) - refunds, matching backend calculation
    const totalRefunds = completedOrders.reduce((sum, o) => {
      const refunded = o.refundStatus === "refund_processed" ? (Number(o.refundAmount) || 0) : 0;
      return sum + refunded;
    }, 0);
    const netSales = completedOrders.reduce((sum, o) => {
      const refunded = o.refundStatus === "refund_processed" ? (Number(o.refundAmount) || 0) : 0;
      return sum + Math.max(0, (Number(o.total) || 0) - DELIVERY_FEE - refunded);
    }, 0);

    const dateRange = filters.startDate && filters.endDate
      ? `${filters.startDate} to ${filters.endDate}`
      : "All Time";

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
              color: #000;
            }
            .date-range {
              text-align: center;
              margin-bottom: 30px;
              color: #666;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 8px;
              background: #f9f9f9;
            }
            .summary-title {
              font-size: 12px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: bold;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #000;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              font-weight: bold;
            }
            .print-date {
              text-align: right;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>Sales Report</h1>
          <div class="date-range">Period: ${dateRange}</div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-title">Orders</div>
              <div class="summary-value">${orderCount}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Gross Sales</div>
              <div class="summary-value">₱${grossSales.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Refunds</div>
              <div class="summary-value">₱${totalRefunds.toFixed(2)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-title">Net Sales</div>
              <div class="summary-value">₱${netSales.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              ${completedOrders.map((o) => {
      const dt = new Date(o.createdAt);
      const dateStr = dt.toLocaleString();
      return `
                  <tr>
                    <td>${dateStr}</td>
                    <td>${o.userId?.name || "Unknown"}</td>
                    <td>${o.status}</td>
                    <td>₱${Number(o.total || 0).toFixed(2)}</td>
                    <td>${o.items?.length || 0}</td>
                  </tr>
                `;
    }).join("")}
            </tbody>
          </table>

          <div class="footer">
            <div class="footer-row">
              <span>Delivery Fees (₱15 each):</span>
              <span>₱${deliveryFees.toFixed(2)}</span>
            </div>
            <div class="footer-row">
              <span>Gross Sales:</span>
              <span>₱${grossSales.toFixed(2)}</span>
            </div>
            <div class="footer-row">
              <span>Refunds:</span>
              <span>₱${totalRefunds.toFixed(2)}</span>
            </div>
            <div class="footer-row">
              <span>Total Sales (Net):</span>
              <span>₱${netSales.toFixed(2)}</span>
            </div>
          </div>

          <div class="print-date">
            Printed on: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
      // Optionally close the window after printing
      // printWindow.close();
    }, 250);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <FormInput label="Start Date" type="date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} variant="dark" />
        <FormInput label="End Date" type="date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} variant="dark" />
        <div className="flex items-end gap-2">
          <Button
            variant="yellow"
            onClick={exportCSV}
            disabled={orders.filter((o) => o.status?.toLowerCase() === "completed").length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="yellow-outline"
            onClick={handlePrint}
            disabled={orders.filter((o) => o.status?.toLowerCase() === "completed").length === 0}
          >
            Print
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="Orders" value={completedOrderCount} />
        <SummaryCard title="Gross Sales" value={`₱${completedGrossSales.toFixed(2)}`} />
        <SummaryCard title="Refunds" value={`₱${Number(summaryData?.summary?.totalRefunds || 0).toFixed(2)}`} />
        <SummaryCard title="Net Sales" value={`₱${completedNetSales.toFixed(2)}`} />
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


