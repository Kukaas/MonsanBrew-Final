import Order from "../models/order.model.js";
import Product from "../models/products.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import Inventory from "../models/inventory.model.js";
import Expense from "../models/expense.model.js";

// Get dashboard summary statistics
export const getDashboardSummary = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Build status filter
    let statusFilter = {};
    if (status && status !== "all") {
      statusFilter = { status };
    }

    // Combine filters
    const orderFilter = { ...dateFilter, ...statusFilter };

    // Get total orders
    const totalOrders = await Order.countDocuments(orderFilter);

    // Get total sales (include completed and refund orders but adjust for processed refunds)
    const completedOrdersFilter = {
      ...orderFilter,
      status: { $in: ["completed", "refund"] },
    };

    // Calculate sales with refund adjustments and exclude delivery fee for non-walk-in
    const salesWithRefunds = await Order.aggregate([
      { $match: completedOrdersFilter },
      {
        $addFields: {
          // Calculate refunded amount for processed refunds only
          refundedAmount: {
            $cond: {
              if: { $eq: ["$refundStatus", "refund_processed"] },
              then: { $ifNull: ["$refundAmount", 0] },
              else: 0,
            },
          },
          // Delivery fee only for non-walk-in orders
          deliveryFeeToSubtract: {
            $cond: { if: { $eq: ["$isWalkInOrder", true] }, then: 0, else: 15 },
          },
        },
      },
      {
        $addFields: {
          // Calculate adjusted total (original total minus refunded amount and conditional delivery fee)
          adjustedTotal: {
            $subtract: ["$total", { $add: ["$refundedAmount", "$deliveryFeeToSubtract"] }],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$adjustedTotal" } } },
    ]);

    // Get total products
    const totalProducts = await Product.countDocuments({
      isDeleted: { $ne: true },
    });

    // Get total users
    const totalUsers = await User.countDocuments();

    // Get total reviews
    const totalReviews = await Review.countDocuments();

    // Get low stock items
    const lowStockItems = await Inventory.countDocuments({
      status: "low_stock",
    });

    // Get out of stock items
    const outOfStockItems = await Inventory.countDocuments({
      status: "out_of_stock",
    });

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // Get processed refund orders
    const processedRefundOrders = await Order.countDocuments({
      refundStatus: "refund_processed",
    });

    // Get total expenses for the period
    const totalExpenses = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get orders by status for status breakdown
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Get top selling products
    const topProducts = await Product.find({ isDeleted: { $ne: true } })
      .sort({ totalSold: -1 })
      .limit(5)
      .select("productName totalSold averageRating");

    res.status(200).json({
      summary: {
        totalOrders,
        totalSales: salesWithRefunds.length > 0 ? salesWithRefunds[0].total : 0,
        totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        netProfit: (salesWithRefunds.length > 0 ? salesWithRefunds[0].total : 0) - (totalExpenses.length > 0 ? totalExpenses[0].total : 0),
        totalReviews,
        pendingOrders,
        processedRefundOrders,
      },
      ordersByStatus,
      topProducts,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard summary." });
  }
};

// Get sales data for charts
export const getSalesData = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let dateFormat;
    let groupByField;

    switch (groupBy) {
      case "day":
        dateFormat = "%Y-%m-%d";
        groupByField = {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        };
        break;
      case "week":
        dateFormat = "%Y-W%U";
        groupByField = {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        };
        break;
      case "month":
        dateFormat = "%Y-%m";
        groupByField = {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        };
        break;
      default:
        dateFormat = "%Y-%m-%d";
        groupByField = {
          $dateToString: { format: dateFormat, date: "$createdAt" },
        };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "refund"] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: {
          // Calculate refunded amount for processed refunds only
          refundedAmount: {
            $cond: {
              if: { $eq: ["$refundStatus", "refund_processed"] },
              then: { $ifNull: ["$refundAmount", 0] },
              else: 0,
            },
          },
          deliveryFeeToSubtract: {
            $cond: { if: { $eq: ["$isWalkInOrder", true] }, then: 0, else: 15 },
          },
        },
      },
      {
        $addFields: {
          // Calculate adjusted total (original total minus refunded amount and conditional delivery fee)
          adjustedTotal: {
            $subtract: ["$total", { $add: ["$refundedAmount", "$deliveryFeeToSubtract"] }],
          },
        },
      },
      {
        $group: {
          _id: groupByField,
          sales: { $sum: "$adjustedTotal" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get expenses data for the same period
    const expensesData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: groupByField,
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Fill in missing dates with zero values
    const filledData = [];
    const current = new Date(start);

    while (current <= end) {
      const dateKey = current.toISOString().split("T")[0]; // YYYY-MM-DD format
      const existingSalesData = salesData.find((item) => item._id === dateKey);
      const existingExpensesData = expensesData.find((item) => item._id === dateKey);

      filledData.push({
        date: dateKey,
        sales: existingSalesData ? existingSalesData.sales : 0,
        expenses: existingExpensesData ? existingExpensesData.expenses : 0,
        orders: existingSalesData ? existingSalesData.orders : 0,
      });

      current.setDate(current.getDate() + 1);
    }

    res.status(200).json({ salesData: filledData });
  } catch (err) {
    console.error("Sales data error:", err);
    res.status(500).json({ error: "Failed to fetch sales data." });
  }
};

// New: Get sales data by week
export const getSalesDataWeekly = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required." });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Group by year and week number
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "refund"] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: {
          // Calculate refunded amount for processed refunds only
          refundedAmount: {
            $cond: {
              if: { $eq: ["$refundStatus", "refund_processed"] },
              then: { $ifNull: ["$refundAmount", 0] },
              else: 0,
            },
          },
          deliveryFeeToSubtract: {
            $cond: { if: { $eq: ["$isWalkInOrder", true] }, then: 0, else: 15 },
          },
        },
      },
      {
        $addFields: {
          // Calculate adjusted total (original total minus refunded amount and conditional delivery fee)
          adjustedTotal: {
            $subtract: ["$total", { $add: ["$refundedAmount", "$deliveryFeeToSubtract"] }],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $isoWeek: "$createdAt" },
          },
          sales: { $sum: "$adjustedTotal" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.week": 1 },
      },
    ]);
    // Get expenses data for the same period
    const expensesData = await Expense.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            week: { $isoWeek: "$date" },
          },
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Fill missing weeks
    const filledData = [];
    let current = new Date(start);
    let weekSet = new Set(
      salesData.map((item) => `${item._id.year}-W${item._id.week}`)
    );
    while (current <= end) {
      const year = current.getFullYear();
      const week = getISOWeek(current);
      const key = `${year}-W${week}`;
      const existingSales = salesData.find(
        (item) => item._id.year === year && item._id.week === week
      );
      const existingExpenses = expensesData.find(
        (item) => item._id.year === year && item._id.week === week
      );
      filledData.push({
        week: key,
        sales: existingSales ? existingSales.sales : 0,
        expenses: existingExpenses ? existingExpenses.expenses : 0,
        orders: existingSales ? existingSales.orders : 0,
      });
      current.setDate(current.getDate() + 7);
    }
    res.status(200).json({ salesData: filledData });
  } catch (err) {
    console.error("Sales data weekly error:", err);
    res.status(500).json({ error: "Failed to fetch weekly sales data." });
  }
};

// Helper to get ISO week number
function getISOWeek(date) {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
  const yearStart = new Date(tmp.getFullYear(), 0, 1);
  return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
}

// New: Get sales data by month
export const getSalesDataMonthly = async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    // Group by month in the given year
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "refund"] },
          createdAt: {
            $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $addFields: {
          // Calculate refunded amount for processed refunds only
          refundedAmount: {
            $cond: {
              if: { $eq: ["$refundStatus", "refund_processed"] },
              then: { $ifNull: ["$refundAmount", 0] },
              else: 0,
            },
          },
          deliveryFeeToSubtract: {
            $cond: { if: { $eq: ["$isWalkInOrder", true] }, then: 0, else: 15 },
          },
        },
      },
      {
        $addFields: {
          // Calculate adjusted total (original total minus refunded amount and conditional delivery fee)
          adjustedTotal: {
            $subtract: ["$total", { $add: ["$refundedAmount", "$deliveryFeeToSubtract"] }],
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          sales: { $sum: "$adjustedTotal" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.month": 1 },
      },
    ]);
    // Get expenses data for the same year
    const expensesData = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${targetYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${targetYear}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Fill missing months
    const filledData = [];
    for (let m = 1; m <= 12; m++) {
      const existingSales = salesData.find((item) => item._id.month === m);
      const existingExpenses = expensesData.find((item) => item._id.month === m);
      filledData.push({
        month: m,
        sales: existingSales ? existingSales.sales : 0,
        expenses: existingExpenses ? existingExpenses.expenses : 0,
        orders: existingSales ? existingSales.orders : 0,
      });
    }
    res.status(200).json({ salesData: filledData });
  } catch (err) {
    console.error("Sales data monthly error:", err);
    res.status(500).json({ error: "Failed to fetch monthly sales data." });
  }
};

// Get recent orders for dashboard table
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find({})
      .populate("userId", "name email")
      .populate("items.productId", "name image")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({ recentOrders });
  } catch (err) {
    console.error("Recent orders error:", err);
    res.status(500).json({ error: "Failed to fetch recent orders." });
  }
};

// Get low stock inventory items
export const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $or: [{ status: "low_stock" }, { status: "out_of_stock" }],
    }).sort({ stock: 1 });

    res.status(200).json({ lowStockItems });
  } catch (err) {
    console.error("Low stock items error:", err);
    res.status(500).json({ error: "Failed to fetch low stock items." });
  }
};
