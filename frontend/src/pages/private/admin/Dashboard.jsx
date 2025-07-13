import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/layouts/AdminLayout";
import DashCard from "@/components/custom/DashCard";
import DataTable from "@/components/custom/DataTable";
import CustomSelect from "@/components/custom/CustomSelect";
import CustomDateRangePicker from "@/components/custom/CustomDateRangePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Star,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Calendar,
  Filter,
} from "lucide-react";
import { dashboardAPI } from "@/services/api";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import DashboardAreaChart from "@/components/custom/DashboardAreaChart";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/layouts/PageLayout";

// Helper to generate all months
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fillMonths(data, keys = []) {
  const monthMap = Object.fromEntries(data.map((item) => [item.month, item]));
  return MONTHS.map((month) => {
    const base = { month };
    keys.forEach((key) => {
      base[key] = monthMap[month]?.[key] ?? 0;
    });
    return base;
  });
}

// Helper to generate all days in a range
function fillDays(data, fromDate, toDate, keys = []) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const result = [];
  const dayMap = Object.fromEntries(data.map((item) => [item.day, item]));
  let current = new Date(start);
  while (current <= end) {
    const day = current.getDate();
    const label = day.toString();
    const base = { day: label };
    keys.forEach((key) => {
      base[key] = dayMap[label]?.[key] ?? 0;
    });
    result.push(base);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

// Helper to generate all week labels in a range (e.g., 'Week 1', 'Week 2', ...)
function fillWeeks(data, fromDate, toDate, keys = []) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const result = [];
  const weekMap = Object.fromEntries(data.map((item) => [item.week, item]));
  let current = new Date(start);
  let weekNum = 1;
  while (current <= end) {
    const label = `Week ${weekNum}`;
    const base = { week: label };
    keys.forEach((key) => {
      base[key] = weekMap[label]?.[key] ?? 0;
    });
    result.push(base);
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  return result;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  // Always use the current month for the date range
  const firstDayOfMonth = dayjs().startOf("month").toDate();
  const lastDayOfMonth = dayjs().endOf("month").toDate();
  const [dateRange, setDateRange] = useState({
    from: firstDayOfMonth,
    to: lastDayOfMonth,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("day");

  // When user tries to change the date range, always reset to current month
  // Allow user to change the date range
  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Dashboard summary query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["dashboard-summary", dateRange, statusFilter],
    queryFn: async () => {
      const filters = {};
      if (dateRange?.from)
        filters.startDate = dayjs(dateRange.from).format("YYYY-MM-DD");
      if (dateRange?.to)
        filters.endDate = dayjs(dateRange.to).format("YYYY-MM-DD");
      if (statusFilter !== "all") filters.status = statusFilter;

      const res = await dashboardAPI.getSummary(filters);
      return res.data || res;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Sales data query
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["dashboard-sales", dateRange, groupBy],
    queryFn: async () => {
      if (groupBy === "month") {
        // Use new monthly endpoint, pass the year from the selected date range or current year
        const year = dateRange?.from
          ? dayjs(dateRange.from).year()
          : dayjs().year();
        const res = await dashboardAPI.getSalesDataMonthly(year);
        return res.data || res;
      }
      if (groupBy === "week") {
        // Use new weekly endpoint, pass the selected date range
        if (!dateRange?.from || !dateRange?.to) return { salesData: [] };
        const startDate = dayjs(dateRange.from).format("YYYY-MM-DD");
        const endDate = dayjs(dateRange.to).format("YYYY-MM-DD");
        const res = await dashboardAPI.getSalesDataWeekly(startDate, endDate);
        return res.data || res;
      }
      if (!dateRange?.from || !dateRange?.to) return { salesData: [] };
      const startDate = dayjs(dateRange.from).format("YYYY-MM-DD");
      const endDate = dayjs(dateRange.to).format("YYYY-MM-DD");
      const res = await dashboardAPI.getSalesData(startDate, endDate, groupBy);
      return res.data || res;
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Recent orders query
  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["dashboard-recent-orders"],
    queryFn: async () => {
      const res = await dashboardAPI.getRecentOrders(5);
      return res.data || res;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Low stock items query
  const { data: lowStockData, isLoading: lowStockLoading } = useQuery({
    queryKey: ["dashboard-low-stock"],
    queryFn: async () => {
      const res = await dashboardAPI.getLowStockItems();
      return res.data || res;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const summary = summaryData?.summary || {};
  const ordersByStatus = summaryData?.ordersByStatus || [];
  const topProducts = summaryData?.topProducts || [];
  const recentOrders = recentOrdersData?.recentOrders || [];
  const lowStockItems = lowStockData?.lowStockItems || [];
  const salesChartData = salesData?.salesData || [];

  // Format sales data for chart
  let formattedSalesData = salesChartData.map((item) => ({
    ...item,
    month: dayjs(item.date).format("MMMM"),
    date: dayjs(item.date).format("YYYY-MM-DD"),
    day: dayjs(item.date).date().toString(),
    week: item.week || "",
  }));
  if (groupBy === "month") {
    // Use month number from API and map to month name
    formattedSalesData = (salesChartData || []).map((item) => ({
      ...item,
      month:
        typeof item.month === "number"
          ? dayjs()
              .month(item.month - 1)
              .format("MMMM")
          : item.month,
    }));
    formattedSalesData = fillMonths(formattedSalesData, ["sales", "orders"]);
  } else if (groupBy === "day") {
    formattedSalesData = fillDays(
      formattedSalesData,
      dateRange.from,
      dateRange.to,
      ["sales", "orders"]
    );
  } else if (groupBy === "week") {
    // Use week label from API, do not fill weeks (backend already fills)
    formattedSalesData = (salesChartData || []).map((item) => ({
      ...item,
      week: item.week,
      date: item.week, // Ensure date is set to week label for chart
    }));
  }

  // Format orders by status for chart (no change needed for months)
  const formattedOrdersByStatus = ordersByStatus.map((item) => ({
    status: item._id?.replace("_", " ").toUpperCase() || "Unknown",
    count: item.count,
  }));

  // Recent orders table columns
  const recentOrdersColumns = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }) => row.original._id.substring(0, 8) + "...",
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => row.original.userId?.name || "Unknown",
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => `₱${row.original.total?.toFixed(2) || "0.00"}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`${getStatusColor(
            row.original.status
          )} border rounded-full px-3 py-1 text-xs font-medium`}
        >
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => dayjs(row.original.createdAt).format("MMM D, YYYY"),
    },
  ];

  // Low stock items table columns
  const lowStockColumns = [
    {
      accessorKey: "productName",
      header: "Product Name",
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => `${row.original.stock} ${row.original.unit || "pcs"}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`${getStatusColor(
            row.original.status
          )} border rounded-full px-3 py-1 text-xs font-medium`}
        >
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "preparing", label: "Preparing" },
    { value: "waiting_for_rider", label: "Waiting for Rider" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const groupByOptions = [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
  ];

  // Custom tooltip formatter
  const formatTooltip = (value, name) => {
    if (name === "sales") {
      return [`₱${value.toLocaleString()}`, "Sales"];
    }
    return [value, name];
  };

  return (
    <AdminLayout>
      <PageLayout
        title="Dashboard"
        description="Welcome to your admin dashboard. Monitor your business performance and manage operations."
      >
        {/* Filters */}
        <Card className="bg-[#242424]  border-[#292929]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CustomDateRangePicker
                label="Date Range"
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Select date range"
              />
              <CustomSelect
                label="Order Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Select status"
              />
              <CustomSelect
                label="Chart Grouping"
                value={groupBy}
                onChange={setGroupBy}
                options={groupByOptions}
                placeholder="Select grouping"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-3">
          <DashCard
            title="Total Orders"
            value={summary.totalOrders?.toLocaleString() || "0"}
            icon={ShoppingCart}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-blue-400/30"
            iconBgColor="bg-blue-400/20"
            iconColor="text-blue-400"
          />
          <DashCard
            title="Total Sales"
            value={`₱${summary.totalSales?.toLocaleString() || "0"}`}
            icon={DollarSign}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-green-400/30"
            iconBgColor="bg-green-400/20"
            iconColor="text-green-400"
          />
          <DashCard
            title="Total Products"
            value={summary.totalProducts?.toLocaleString() || "0"}
            icon={Package}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-purple-400/30"
            iconBgColor="bg-purple-400/20"
            iconColor="text-purple-400"
          />
          <DashCard
            title="Total Users"
            value={summary.totalUsers?.toLocaleString() || "0"}
            icon={Users}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-orange-400/30"
            iconBgColor="bg-orange-400/20"
            iconColor="text-orange-400"
          />
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashCard
            title="Total Reviews"
            value={summary.totalReviews?.toLocaleString() || "0"}
            icon={Star}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-yellow-400/30"
            iconBgColor="bg-yellow-400/20"
            iconColor="text-yellow-400"
          />
          <DashCard
            title="Low Stock Items"
            value={summary.lowStockItems?.toLocaleString() || "0"}
            icon={AlertTriangle}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-red-400/30"
            iconBgColor="bg-red-400/20"
            iconColor="text-red-400"
          />
          <DashCard
            title="Pending Orders"
            value={summary.pendingOrders?.toLocaleString() || "0"}
            icon={TrendingUp}
            gradientFrom="from-[#232323]"
            gradientTo="to-[#1a1a1a]"
            borderColor="border-indigo-400/30"
            iconBgColor="bg-indigo-400/20"
            iconColor="text-indigo-400"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Sales Chart (Full Width) */}
          <DashboardAreaChart
            data={
              groupBy === "month"
                ? formattedSalesData.map((item) => ({
                    ...item,
                    date: item.month,
                  }))
                : groupBy === "day"
                ? formattedSalesData.map((item) => ({
                    ...item,
                    date: item.day,
                  }))
                : groupBy === "week"
                ? formattedSalesData
                : formattedSalesData
            }
            config={{
              sales: {
                label: "Sales",
                color: "#F59E0B", // yellowish (amber)
              },
            }}
            title="Sales Overview"
            description="Sales and order trends for the selected period"
            areaKeys={["sales"]}
            dateKey={
              groupBy === "month"
                ? "month"
                : groupBy === "day"
                ? "day"
                : groupBy === "week"
                ? "week"
                : "date"
            }
            defaultTimeRange={
              groupBy === "month" ? "90d" : groupBy === "week" ? "30d" : "7d"
            }
            timeRangeOptions={[
              { value: "90d", label: "Last 3 months" },
              { value: "30d", label: "Last 30 days" },
              { value: "7d", label: "Last 7 days" },
            ]}
          />
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 gap-6 w-full">
          {/* Recent Orders */}
          <Card className="bg-[#242424] border-[#292929]">
            <CardHeader>
              <CardTitle className="text-white">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={recentOrdersColumns}
                data={recentOrders.map((order) => ({
                  ...order,
                  id: order._id,
                }))}
                loading={ordersLoading}
                rowProps={(row) => ({
                  style: { cursor: "pointer" },
                  onClick: () => navigate(`/admin/orders/${row.original._id}`),
                })}
              />
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card className="bg-[#242424] border-[#292929]">
            <CardHeader>
              <CardTitle className="text-white">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={lowStockColumns}
                data={lowStockItems.map((item) => ({ ...item, id: item._id }))}
                loading={lowStockLoading}
                rowProps={(row) => ({
                  style: { cursor: "pointer" },
                  onClick: () =>
                    navigate(
                      `/admin/raw-materials?highlight=${row.original._id}`
                    ),
                })}
              />
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <Card className="bg-[#242424] border-[#292929]">
            <CardHeader>
              <CardTitle className="text-white">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="bg-[#2A2A2A] p-4 rounded-lg border border-[#333]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold truncate">
                        {product.productName}
                      </h4>
                      <span className="text-yellow-500 font-bold">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-[#BDBDBD]">
                      <p>Total Sold: {product.totalSold || 0}</p>
                      <p>
                        Rating: {product.averageRating?.toFixed(1) || "0.0"} ⭐
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </PageLayout>
    </AdminLayout>
  );
}
