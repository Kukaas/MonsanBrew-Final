import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ENV } from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.route.js";
import addonsRoutes from "./src/routes/aaddons.route.js";
import inventoryRoutes from "./src/routes/inventory.route.js";
import ingredientsRoutes from "./src/routes/ingredients.route.js";
import productRoutes from "./src/routes/product.route.js";
import cartRoutes from "./src/routes/cart.route.js";
import userRoutes from "./src/routes/user.route.js";
import orderRoutes from "./src/routes/order.route.js";
import reviewRoutes from "./src/routes/review.routes.js";
import dashboardRoutes from "./src/routes/dashboard.route.js";
import expenseRoutes from "./src/routes/expense.route.js";
import dndRoutes from "./src/routes/dnd.route.js";
import reportsRoutes from "./src/routes/reports.route.js";
import notificationRoutes from "./src/routes/notification.route.js";

const app = express();

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, "https://monsanbrew.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Headers",
    ],
  })
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/addons", addonsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dnd", dndRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});

export default app;
