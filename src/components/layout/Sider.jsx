import { useNavigate, useLocation } from "react-router-dom";

import dashboard from "../../assets/Common/dashboard.svg";
import deals from "../../assets/Common/deals.svg";
import usermanagement from "../../assets/Common/usermanagement.svg";
import reconciliation from "../../assets/Common/reconciliation.svg";
import reporting from "../../assets/Common/reporting.svg";
import customermanagement from "../../assets/customer/ledger.svg";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const menuItems = [
    { name: "Dashboard", icon: dashboard, path: "/dashboard" },
    { name: "User Management", icon: usermanagement, path: "/users" },
    { name: "Customer Ledger", icon: customermanagement, path: "/customer-info" },
    { name: "Deals", icon: deals, path: "/deals" },
    { name: "Reconciliation", icon: reconciliation, path: "/reconciliation" },
    { name: "Reporting", icon: reporting, path: "/reports" },
  ];

  return (
    <div className="w-64 h-screen bg-[#1E2328] border-r border-[#161A1D] p-4 text-white">
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full text-left
                ${
                isActive
                    ? "bg-[#1D4CB5] text-white before:absolute before:-left-4 before:top-0 before:h-full before:w-6 before:bg-[#1D4CB5]"
                    : "text-gray-300 hover:bg-[#2A2F34] hover:text-white hover:before:absolute hover:before:-left-4 hover:before:top-0 hover:before:h-full hover:before:w-6 hover:before:bg-[#2A2F34]"
              }
              `}
            >
              <img src={item.icon} className="w-5" alt={item.name} />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
