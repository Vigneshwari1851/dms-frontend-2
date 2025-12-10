import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import './App.css'
import AppRoutes from "./routes/routes";
import { setAuthToken } from "./api/auth";

function App() {
  useEffect(() => {
    // Set the auth token from your JWT
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJlbWFpbCI6InZpZ25lc2h3YXJpMTg1MUBnbWFpbC5jb20iLCJyb2xlIjoiTWFrZXIiLCJpYXQiOjE3NjUzNDEwNjgsImV4cCI6MTc2NTQyNzQ2OH0.leckKxMYIHENaaabltcb40GLSs5KxBc-JrmYLMHeWJ4";
    setAuthToken(token);
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App