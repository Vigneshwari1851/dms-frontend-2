import { useState } from "react";
import Header from "./Header";
import Sider from "./Sider";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [pathname]);

  const [sidebarHidden, setSidebarHidden] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0C0E]">
      {/* Top Header */}
      <Header toggleSidebar={toggleSidebar} />

      {/* Layout Row → Sider + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-55 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Left Sidebar */}
        <Sider isOpen={isSidebarOpen && !sidebarHidden} closeSidebar={closeSidebar} hidden={sidebarHidden} />

        {/* Main content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-scroll scrollbar-grey p-2 lg:p-4 bg-[#16191C] text-white"
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet context={{ setSidebarHidden }} />
        </main>
      </div>
    </div>
  );
}
