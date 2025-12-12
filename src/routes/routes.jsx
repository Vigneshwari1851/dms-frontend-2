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
        <Route index element={<Dashboard />} />    
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="deals" element={<DealsList />} />
        <Route path="create-deal" element={<CreateDeal />} />
        <Route path="users" element={<ListUser />} />
        <Route path="users/add-user" element={<AddUser />} />  
        <Route path="users/details/:id" element={<ViewUser />} /> 
        <Route path="deal-review" element={<DealReview />} />
        <Route path="view-slip" element={<ViewSlip />} />
        <Route path="edit-deal/:id" element={<EditDeal />} />
         <Route path="reconciliation" element={<ReconciliationList />} />
        <Route path="reports" element={<ListReport />} />
        <Route path="reconciliation" element={<ReconciliationList />} />
        <Route path="reconciliation/add-reconciliation" element={<AddReconciliation />} />
        <Route path="reconciliation/details/:id" element={<ViewReconciliation />} />
      </Route>
    </Routes>
  );
}
