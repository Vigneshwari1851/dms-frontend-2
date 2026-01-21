import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import AppRoutes from "./routes/routes";
import { setAuthToken } from "./api/auth";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {

  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  )
}

export default App