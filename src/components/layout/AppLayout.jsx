import Header from "./Header";
import Sider from "./Sider";
import ContentArea from "./ContentArea";
import { Outlet } from "react-router-dom";
export default function AppLayout({ children }) {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0C0E]">

      {/* Top Header */}
      <Header />

      {/* Layout Row → Sider + Content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <Sider />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#16191C] text-white">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
