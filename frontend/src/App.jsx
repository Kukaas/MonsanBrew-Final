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
import Menus from './pages/private/customer/Menus';

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
    case 'customer': return <Navigate to="/menus" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={
          <RequireAuth allowedRoles={["admin"]}>
            <AdminDashboard />
          </RequireAuth>
        } />
        <Route path="/rider/dashboard" element={
          <RequireAuth allowedRoles={["rider"]}>
            <RiderDashboard />
          </RequireAuth>
        } />
        <Route path="/menus" element={
          <RequireAuth allowedRoles={["customer"]}>
            <Menus />
          </RequireAuth>
        } />
        <Route path="/frontdesk/dashboard" element={
          <RequireAuth allowedRoles={["frontdesk"]}>
            <FrontdeskDashboard />
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
