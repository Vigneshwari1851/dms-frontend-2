import { useState } from "react";
import { useNavigate } from "react-router-dom";

import dashboard from "../../assets/Common/dashboard.svg";
import deals from "../../assets/Common/deals.svg";
import usermanagement from "../../assets/Common/usermanagement.svg";
import reconciliation from "../../assets/Common/reconciliation.svg";
import reporting from "../../assets/Common/reporting.svg";
import customermanagement from "../../assets/Common/customermanagement.svg";

export default function Sidebar() {
  const navigate = useNavigate();
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: dashboard, path: "/dashboard" },
    { name: "Deals", icon: deals, path: "/deals" },
    { name: "Customer Info", icon: customermanagement, path: "/customer-info" },
    { name: "User Management", icon: usermanagement, path: "/users" },
    { name: "Reconciliation", icon: reconciliation, path: "/reconciliation" },
    { name: "Reporting", icon: reporting, path: "/reports" },
  ];

  return (
    <div className="w-64 h-screen bg-[#1E2328] border-r border-[#161A1D] p-4 text-white">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => {
              setActive(item.name);
              navigate(item.path);
            }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full text-left
              ${active === item.name
                ? "bg-[#1D4CB5] text-white"
                : "text-gray-300 hover:bg-[#2A2F34] hover:text-white"}
            `}
          >
            <img src={item.icon} className="w-5" alt={item.name} />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
