import Order from "../models/order.model.js";
import Product from "../models/products.model.js";
import Review from "../models/review.model.js";

// Build date range filter helper
function buildDateFilter(startDate, endDate) {
  if (startDate && endDate) {
    return {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  }
  return {};
}

// GET /api/reports/summary?startDate&endDate
export const getReportsSummary = async (req, res) => {
  try {
    const { startDate, endDate, productId, riderId } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);
    const riderFilter = riderId ? { riderId } : {};

    // Orders in range
    // If productId is provided, restrict orders to those containing the product
    let orders = [];
    if (productId) {
      orders = await Order.find({
        ...dateFilter,
        ...riderFilter,
        "items.productId": productId,
      }).lean();
    } else {
      orders = await Order.find({
        ...dateFilter,
        ...riderFilter,
      }).lean();
    }

    const DELIVERY_FEE = 15;

    let orderCount = 0;
    let grossSales = 0;
    let netSales = 0;
    let totalRefunds = 0;

    for (const o of orders) {
      orderCount += 1;
      grossSales += o.total || 0;
      const refunded = o.refundStatus === "refund_processed" ? (o.refundAmount || 0) : 0;
      totalRefunds += refunded;
      // Exclude delivery fee and subtract processed refunds
      netSales += Math.max(0, (o.total || 0) - DELIVERY_FEE - refunded);
    }

    const avgOrderValue = orderCount > 0 ? netSales / orderCount : 0;

    // Top selling products (use products.totalSold to keep it fast)
    // If riderId filter is present, compute top products based on that rider's delivered orders in range
    let topProducts = [];
    if (riderId) {
      const ordersByRider = await Order.find({
        ...dateFilter,
        riderId,
      })
        .select("items")
        .lean();
      const productIdToQty = new Map();
      for (const o of ordersByRider) {
        for (const item of (o.items || [])) {
          const pid = item.productId?.toString();
          if (!pid) continue;
          const qty = Number(item.quantity || 1);
          productIdToQty.set(pid, (productIdToQty.get(pid) || 0) + qty);
        }
      }
      const sorted = Array.from(productIdToQty.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const ids = sorted.map(([pid]) => pid);
      const products = await Product.find({ _id: { $in: ids }, isDeleted: { $ne: true } })
        .select("productName averageRating")
        .lean();
      const idToProduct = new Map(products.map((p) => [p._id.toString(), p]));
      topProducts = sorted.map(([pid, totalQty]) => {
        const p = idToProduct.get(pid);
        return {
          _id: pid,
          productName: p?.productName || "Unknown",
          totalSold: totalQty,
          averageRating: p?.averageRating || 0,
        };
      });
    } else {
      topProducts = await Product.find({ isDeleted: { $ne: true } })
        .sort({ totalSold: -1 })
        .limit(10)
        .select("productName totalSold averageRating");
    }

    res.json({
      summary: {
        orderCount,
        grossSales,
        totalRefunds,
        netSales,
        avgOrderValue,
      },
      topProducts,
    });
  } catch (err) {
    console.error("Reports summary error:", err);
    res.status(500).json({ error: "Failed to generate reports summary." });
  }
};

// GET /api/reports/orders?startDate&endDate&status
export const getOrdersReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);
    const statusFilter = status && status !== "all" ? { status } : {};
    const filter = { ...dateFilter, ...statusFilter };

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("items.productId", "productName image")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    console.error("Orders report error:", err);
    res.status(500).json({ error: "Failed to fetch orders report." });
  }
};

// GET /api/reports/delivery-performance?startDate&endDate
export const getDeliveryPerformance = async (req, res) => {
  try {
    const { startDate, endDate, riderId } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    // Use reviews' deliveryRating (1-5) as the source of delivery performance
    const match = { ...dateFilter, deliveryRating: { $gte: 1 } };
    if (riderId) match.riderId = riderId;

    // Overall average delivery rating
    const overallAgg = await Review.aggregate([
      { $match: match },
      { $group: { _id: null, avg: { $avg: "$deliveryRating" }, total: { $sum: 1 } } },
    ]);
    const overallAvg = overallAgg[0]?.avg || 0;
    const total = overallAgg[0]?.total || 0;

    // Per-rider aggregation
    const riderAgg = await Review.aggregate([
      { $match: match },
      { $group: { _id: "$riderId", avgRating: { $avg: "$deliveryRating" }, reviews: { $sum: 1 } } },
      { $sort: { avgRating: -1 } },
    ]);
    const populated = await Review.populate(riderAgg, {
      path: "_id",
      model: "User",
      select: "name email",
    });
    const riders = populated.map((r) => ({
      rider: r._id,
      avgRating: Math.round((r.avgRating || 0) * 10) / 10,
      reviews: r.reviews,
    }));

    res.json({
      overallAvgDeliveryRating: Math.round(overallAvg * 10) / 10,
      totalDeliveryReviews: total,
      riders,
    });
  } catch (err) {
    console.error("Delivery performance error:", err);
    res.status(500).json({ error: "Failed to fetch delivery performance." });
  }
};

// GET /api/reports/feedback?startDate&endDate&limit=10
export const getFeedbackReport = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const reviews = await Review.find(dateFilter)
      .populate("productId", "productName image")
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const totalReviews = await Review.countDocuments(dateFilter);
    const averageRatingAgg = await Review.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const averageRating = averageRatingAgg[0]?.avg || 0;

    const ratingBreakdownAgg = await Review.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of ratingBreakdownAgg) ratingBreakdown[r._id] = r.count;

    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingBreakdown,
      recentReviews: reviews,
    });
  } catch (err) {
    console.error("Feedback report error:", err);
    res.status(500).json({ error: "Failed to fetch feedback report." });
  }
};

// GET /api/reports/feedback/product/:productId?startDate&endDate
export const getProductFeedback = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    if (!productId) return res.status(400).json({ error: "Product ID required" });
    const dateFilter = buildDateFilter(startDate, endDate);
    const filter = { ...dateFilter, productId };

    const totalReviews = await Review.countDocuments(filter);
    const averageRatingAgg = await Review.aggregate([
      { $match: { ...filter, productId: new (require('mongoose')).Types.ObjectId(productId) } },
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);
    const averageRating = averageRatingAgg[0]?.avg || 0;
    const reviews = await Review.find(filter)
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      reviews,
    });
  } catch (err) {
    console.error("Product feedback report error:", err);
    res.status(500).json({ error: "Failed to fetch product feedback." });
  }
};

// GET /api/reports/delivery-performance/riders?startDate&endDate
export const getRiderPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = buildDateFilter(startDate, endDate);

    const aggregation = await Review.aggregate([
      { $match: { ...dateFilter, deliveryRating: { $gte: 1 } } },
      {
        $group: {
          _id: "$riderId",
          avgRating: { $avg: "$deliveryRating" },
          reviews: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    // Populate rider info
    const populated = await Review.populate(aggregation, {
      path: "_id",
      model: "User",
      select: "name email",
    });

    const riders = populated.map((r) => ({
      rider: r._id,
      avgRating: Math.round(r.avgRating * 10) / 10,
      reviews: r.reviews,
    }));

    res.json({ riders });
  } catch (err) {
    console.error("Rider performance report error:", err);
    res.status(500).json({ error: "Failed to fetch rider performance." });
  }
};


