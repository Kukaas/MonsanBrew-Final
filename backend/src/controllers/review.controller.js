import Review from "../models/review.model.js";
import Product from "../models/products.model.js";
import Order from "../models/order.model.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { userId, productId, orderId, rating, comment, isAnonymous } =
      req.body;

    // Validate required fields
    if (!userId || !productId || !orderId || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Check if order exists and is completed
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    if (order.status !== "completed") {
      return res
        .status(400)
        .json({ error: "Can only review completed orders." });
    }

    // Check if user owns the order
    if (order.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "You can only review your own orders." });
    }

    // Verify that the product exists in the order (for validation purposes)
    const orderItem = order.items.find((item) => {
      const itemProductId = item.productId?.toString();
      const requestedProductId = productId?.toString();
      return itemProductId === requestedProductId;
    });

    if (!orderItem) {
      return res.status(400).json({
        error: "Product not found in this order.",
        debug: {
          requestedProductId: productId,
          availableProductIds: order.items.map((item) =>
            item.productId?.toString()
          ),
        },
      });
    }

    // Check if review already exists for this order
    const existingReview = await Review.findOne({ userId, orderId });
    if (existingReview) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this order." });
    }

    // Create the review
    const review = new Review({
      userId,
      productId,
      orderId,
      rating,
      comment,
      isAnonymous: isAnonymous || false,
    });

    await review.save();

    // Update product stats
    await updateProductStats(productId);

    // Mark order as reviewed
    order.isReviewed = true;
    await order.save();

    res.status(201).json({
      message: "Review created successfully.",
      review,
    });
  } catch (err) {
    console.error("Create review error:", err);
    res.status(500).json({ error: "Failed to create review." });
  }
};

// Helper function to mask names for anonymous reviews
const maskName = (name) => {
  if (!name) return "*****";

  if (name.length <= 2) {
    // For very short names, just show first letter + asterisks
    return name.charAt(0) + "*****";
  }

  // Show first letter + 5 asterisks + last letter
  const firstChar = name.charAt(0);
  const lastChar = name.charAt(name.length - 1);
  return firstChar + "*****" + lastChar;
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .populate("orderId", "_id createdAt items")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Process reviews to mask anonymous names
    const processedReviews = reviews.map((review) => {
      const reviewObj = review.toObject();
      if (reviewObj.isAnonymous && reviewObj.userId?.name) {
        reviewObj.userId.name = maskName(reviewObj.userId.name);
      }
      return reviewObj;
    });

    const count = await Review.countDocuments({ productId });

    res.status(200).json({
      reviews: processedReviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count,
    });
  } catch (err) {
    console.error("Get product reviews error:", err);
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate("productId", "productName image")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 });

    res.status(200).json({ reviews });
  } catch (err) {
    console.error("Get user reviews error:", err);
    res.status(500).json({ error: "Failed to fetch user reviews." });
  }
};

// Get review for a specific order
export const getOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await Review.findOne({ orderId })
      .populate("userId", "name")
      .populate("productId", "productName image")
      .populate("orderId", "_id createdAt items");

    if (!review) {
      return res
        .status(404)
        .json({ error: "Review not found for this order." });
    }

    // Process review to mask anonymous name
    const reviewObj = review.toObject();
    if (reviewObj.isAnonymous && reviewObj.userId?.name) {
      reviewObj.userId.name = maskName(reviewObj.userId.name);
    }

    res.status(200).json({ review: reviewObj });
  } catch (err) {
    console.error("Get order review error:", err);
    res.status(500).json({ error: "Failed to fetch order review." });
  }
};

// Update product stats (average rating, review count)
const updateProductStats = async (productId) => {
  try {
    const reviews = await Review.find({ productId });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      reviewCount: reviews.length,
    });
  } catch (err) {
    console.error("Update product stats error:", err);
  }
};

// Update product sales count
export const updateProductSales = async (productId, quantity) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.error("Product not found for sales update:", productId);
      return;
    }

    // Calculate new total sold, ensuring it doesn't go below 0
    const newTotalSold = Math.max(0, product.totalSold + quantity);

    await Product.findByIdAndUpdate(productId, {
      totalSold: newTotalSold,
    });
  } catch (err) {
    console.error("Update product sales error:", err);
  }
};

// Get product sales count
export const getProductSales = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return 0;
    }
    return product.totalSold || 0;
  } catch (err) {
    console.error("Get product sales error:", err);
    return 0;
  }
};
