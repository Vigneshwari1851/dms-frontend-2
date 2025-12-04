import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Auth/Login/Login";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/dashboard";
import IpBlocked from "../pages/Error/IpBlocked";
import AccountDisabled from "../pages/Error/AccountDeactivated";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword";
import CreateDeal from "../pages/Deal/CreateDeal";

import AppLayout from "../components/layout/AppLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-login" element={<VerifyOtp />} />
      <Route path="/ip-blocked" element={<IpBlocked />} />
      <Route path="/account-disabled" element={<AccountDisabled />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes (with layout) */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />    {/* default */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-deal" element={<CreateDeal />} />
      </Route>
    </Routes>
  );
}
