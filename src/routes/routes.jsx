import React from "react";
import Login from "../pages/Auth/Login/Login";
import { Routes, Route } from "react-router-dom";
import VerifyOtp from "../pages/Auth/VerifyLogin/VerifyLogin";
import ResetPassword from "../pages/Auth/ResetPassword/ResetPassword";
// import Dashboard from "../pages/Dashboard/Dashboard";
import IpBlocked from "../pages/Error/IpBlocked";
import AccountDisabled from "../pages/Error/AccountDeactivated";
import ForgotPassword from "../pages/Auth/ForgetPassword/ForgotPassword";
// import ListUser from "../pages/UserManagement/ListUser";

function AppRoutes() {

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route path="/verify-login" element={<VerifyOtp />} />
      <Route path="/ip-blocked" element={<IpBlocked />} />
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      <Route path="/account-disabled" element={<AccountDisabled />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* <Route path="/users" element={<ListUser />} /> */}
     
    </Routes>
  );
}

export default AppRoutes;
