import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/public/Login.jsx";
import Register from "./pages/public/Register.jsx";
import VerifyEmail from "./pages/public/VerifyEmail.jsx";
import ResetPassword from "./pages/public/ResetPassword.jsx";
import AdminDashboard from "./pages/private/admin/Dashboard.jsx";
import Home from "./pages/private/rider/Home.jsx";
import RiderOrders from "./pages/private/rider/Orders.jsx";
import Profile from "./pages/private/Profile.jsx";
import FrontdeskDashboard from "./pages/private/frontdesk/Dashboard.jsx";
import { useAuth } from "./context/AuthContext";
import PropTypes from "prop-types";
import Menus from "./pages/Menus";
import Products from "./pages/private/admin/products/Products";
import AddOns from "./pages/private/admin/add-ons/AddOns";
import RawMaterials from "./pages/private/admin/raw-materials/RawMaterials.jsx";
import ProductCategory from "./pages/private/admin/category/ProductCategory";
import CreateProduct from "./pages/private/admin/products/CreateProduct.jsx";
import EditProduct from "./pages/private/admin/products/EditProduct.jsx";
import ViewProduct from "./pages/private/admin/products/ViewProduct.jsx";
import AdminOrders from "./pages/private/admin/orders/Orders.jsx";
import OrderDetails from "./pages/private/admin/orders/OrderDetails.jsx";
import Users from "./pages/private/admin/users/Users.jsx";
import EditUser from "./pages/private/admin/users/EditUser.jsx";
import AdminRefunds from "./pages/private/admin/refunds/Refunds.jsx";
import AdminRefundDetails from "./pages/private/admin/refunds/RefundDetails.jsx";
import ProductDetail from "./pages/private/customer/ProductDetail";
import Cart from "./pages/private/customer/Cart";
import Favorites from "./pages/private/customer/Favorites.jsx";
import Checkout from "./pages/private/customer/Checkout.jsx";
import Address from "./pages/private/customer/Address.jsx";
import Orders from "./pages/private/customer/Orders.jsx";
import OrderDetail from "./pages/private/customer/OrderDetail.jsx";
import ChangePassword from "./pages/public/ChangePassword.jsx";
import Ingredients from "./pages/private/admin/ingredients/Ingredients.jsx";
import CreateIngredient from "./pages/private/admin/ingredients/CreateIngredient.jsx";
import ViewIngredient from "./pages/private/admin/ingredients/ViewIngredient.jsx";
import Expenses from "./pages/private/admin/expenses/Expenses.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Menus />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "rider":
      return <Navigate to="/rider/dashboard" replace />;
    case "frontdesk":
      return <Navigate to="/frontdesk/dashboard" replace />;
    case "customer":
      if (location.search.includes("is_from_login=true")) {
        return <Menus />;
      }
      return <Navigate to="/?is_from_login=true" replace />;
    default:
      return <Menus />;
  }
}

function RequireAuth(
  {
    children,
    allowedRoles,
  }
) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/login" replace />;

  // Check if user needs to change password (for non-customer roles)
  if (
    user.role !== "customer" &&
    !user.hasChangedPassword &&
    location.pathname !== "/change-password"
  ) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    case "rider":
      return <Navigate to="/rider/dashboard" replace />;
    case "frontdesk":
      return <Navigate to="/frontdesk/dashboard" replace />;
    case "customer":
      return <Navigate to="/?is_from_login=true" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/change-password"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminOrders />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/orders/:orderId"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <OrderDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products/create"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <CreateProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <EditProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <ViewProduct />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <ProductCategory />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/add-ons"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AddOns />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/raw-materials"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <RawMaterials />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/ingredients"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Ingredients />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/ingredients/create"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <CreateIngredient />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/ingredients/:id"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <ViewIngredient />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/expenses"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Expenses />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/users"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <Users />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/users/:id/edit"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <EditUser />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/refunds"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminRefunds />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/refunds/:orderId"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminRefundDetails />
            </RequireAuth>
          }
        />

        <Route
          path="/rider/dashboard"
          element={
            <RequireAuth allowedRoles={["rider"]}>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/rider/orders"
          element={
            <RequireAuth allowedRoles={["rider"]}>
              <RiderOrders />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth
              allowedRoles={["admin", "customer", "frontdesk", "rider"]}
            >
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <RequireAuth
              allowedRoles={["admin", "customer", "frontdesk", "rider"]}
            >
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="/menus" element={<Menus />} />
        <Route
          path="/frontdesk/dashboard"
          element={
            <RequireAuth allowedRoles={["frontdesk"]}>
              <FrontdeskDashboard />
            </RequireAuth>
          }
        />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route
          path="/cart"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="/favorites/:userId"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <Favorites />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/:userId"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route
          path="/profile/address"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <Address />
            </RequireAuth>
          }
        />
        <Route
          path="/order/user/:userId"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="/order/:orderId"
          element={
            <RequireAuth allowedRoles={["customer"]}>
              <OrderDetail />
            </RequireAuth>
          }
        />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
