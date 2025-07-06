import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import VerifyEmail from './pages/public/VerifyEmail.jsx';
import ResetPassword from './pages/public/ResetPassword.jsx';
import AdminDashboard from './pages/private/admin/Dashboard.jsx';
import RiderDashboard from './pages/private/rider/Dashboard.jsx';
import FrontdeskDashboard from './pages/private/frontdesk/Dashboard.jsx';
import { useAuth } from './context/AuthContext';
import React from 'react';
import Menus from './pages/Menus';
import Products from './pages/private/admin/products/Products';
import AddOns from './pages/private/admin/add-ons/AddOns';
import RawMaterials from './pages/private/admin/raw-materials/RawMaterials.jsx';
import ProductCategory from './pages/private/admin/category/ProductCategory';
import CreateProduct from './pages/private/admin/products/CreateProduct.jsx';
import EditProduct from './pages/private/admin/products/EditProduct.jsx';
import ViewProduct from './pages/private/admin/products/ViewProduct.jsx';
import ProductDetail from './pages/private/customer/ProductDetail';
import Cart from './pages/private/customer/Cart';

function RootRedirect() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Menus />;

  switch (user.role) {
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'rider': return <Navigate to="/rider/dashboard" replace />;
    case 'frontdesk': return <Navigate to="/frontdesk/dashboard" replace />;
    case 'customer':
      if (location.search.includes('is_from_login=true')) {
        return <Menus />;
      }
      return <Navigate to="/?is_from_login=true" replace />;
    default: return <Menus />;
  }
}

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin/dashboard" replace />;
    case 'rider': return <Navigate to="/rider/dashboard" replace />;
    case 'frontdesk': return <Navigate to="/frontdesk/dashboard" replace />;
    case 'customer': return <Navigate to="/?is_from_login=true" replace />;
    default: return <Navigate to="/login" replace />;
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

        <Route path="/admin/dashboard" element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        } />
        <Route path="/admin/products" element={
          <RequireAuth allowedRoles={["admin"]}>
            <Products />
          </RequireAuth>
        } />
        <Route path="/admin/products/create" element={
          <RequireAuth allowedRoles={["admin"]}>
            <CreateProduct />
          </RequireAuth>
        } />
        <Route path="/admin/products/:id/edit" element={
          <RequireAuth allowedRoles={["admin"]}>
            <EditProduct />
          </RequireAuth>
        } />
        <Route path="/admin/products/:id" element={
          <RequireAuth allowedRoles={["admin"]}>
            <ViewProduct />
          </RequireAuth>
        } />

        <Route path="/admin/categories" element={
          <RequireAuth allowedRoles={["admin"]}>
            <ProductCategory />
          </RequireAuth>
        } />

        <Route path="/admin/add-ons" element={
          <RequireAuth allowedRoles={["admin"]}>
            <AddOns />
          </RequireAuth>
        } />

        <Route path="/admin/raw-materials" element={
          <RequireAuth allowedRoles={["admin"]}>
            <RawMaterials />
          </RequireAuth>
        } />

        <Route path="/rider/dashboard" element={
          <RequireAuth allowedRoles={["rider"]}>
            <RiderDashboard />
          </RequireAuth>
        } />
        <Route path="/menus" element={<Menus />} />
        <Route path="/frontdesk/dashboard" element={
          <RequireAuth allowedRoles={["frontdesk"]}>
            <FrontdeskDashboard />
          </RequireAuth>
        } />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={
          <RequireAuth allowedRoles={["customer"]}>
            <Cart />
          </RequireAuth>
        } />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
