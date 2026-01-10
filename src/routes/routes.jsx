import React from "react";
import { Routes, Route, Router } from "react-router-dom";

import Login from "../pages/Auth/Login/Login";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
import Dashboard from "../pages/Dashboard/Dashboard";
import IpBlocked from "../pages/Error/IpBlocked";
import AccountDisabled from "../pages/Error/AccountDeactivated";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword";
import CreateDeal from "../pages/Deal/CreateDeal";
import DealsList from "../pages/Deal/DealsList";
import DealReview from "../components/deal/DealReviewPage"
import AppLayout from "../components/layout/AppLayout";
import ListUser from "../pages/User/ListUser";
import AddUser from "../pages/User/AddUser";
import ViewUser from "../pages/User/ViewUser";
import ViewSlip from "../pages/Deal/ViewSlip";
import EditDeal from "../pages/Deal/EditDeal";
import ReconciliationList from "../pages/Reconciliation/ReconciliationList";
import ListReport from "../pages/Report/ListReport";
import AddReconciliation from "../pages/Reconciliation/AddReconciliation";
import ViewReconciliation from "../pages/Reconciliation/ViewReconciliation";
import ListCustomer from "../pages/Customer/ListCustomer";
import AddCustomer from "../pages/Customer/AddCustomer";
import ViewCustomer from "../pages/Customer/ViewCustomer";
import MyProfile from "../pages/User/MyProfile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-login" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes (with layout) */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="deals" element={<DealsList />} />
        <Route path="deals/create-deal" element={<CreateDeal />} />
        <Route path="users" element={<ListUser />} />
        <Route path="users/add-user" element={<AddUser />} />
        <Route path="users/details/:id" element={<ViewUser />} />
        <Route path="deal-review" element={<DealReview />} />
        <Route path="view-slip" element={<ViewSlip />} />
        <Route path="deals/edit-deal/:id" element={<EditDeal />} />
        <Route path="reconciliation" element={<ReconciliationList />} />
        <Route path="reports" element={<ListReport />} />
        {/* <Route path="reconciliation" element={<ReconciliationList />} /> */}
        <Route path="reconciliation/add-reconciliation" element={<AddReconciliation />} />
        <Route path="reconciliation/details/:id" element={<ViewReconciliation />} />
        <Route path="customer-info" element={<ListCustomer />} />
        <Route path="customer-info/add-customer" element={<AddCustomer />} />
        <Route path="customer-info/view/:id" element={<ViewCustomer />} />
        <Route path="users/my-profile" element={<MyProfile />} />
        <Route path="/reconciliation/edit/:id" element={<AddReconciliation />} />
      </Route>
    </Routes>
  );
}
