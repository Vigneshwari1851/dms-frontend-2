import { useState } from "react";
import Header from "./Header";
import Sider from "./Sider";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ReconciliationProvider, useReconciliation } from "../../contexts/ReconciliationContext";
import VaultCaptureModal from "../common/VaultCaptureModal";
import Toast from "../common/Toast";

function AppLayoutInner() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const { gateOpen, closeGate, currencies, saveOpeningVault } = useReconciliation();
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const handleSaveOpening = async (entries) => {
    setToast({ show: true, message: "Saving opening balance...", type: "pending" });
    const result = await saveOpeningVault(entries);
    if (result.success) {
      setToast({ show: true, message: "Opening stock saved successfully", type: "success" });
    } else {
      setToast({ show: true, message: result.error?.message || "Failed to save balance", type: "error" });
    }
  };

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

        {/* Left Sidebar — blurred when gate is open */}
        <div className={`transition-all duration-200 ${gateOpen ? "blur-sm pointer-events-none select-none" : ""}`}>
          <Sider isOpen={isSidebarOpen && !sidebarHidden} closeSidebar={closeSidebar} hidden={sidebarHidden} />
        </div>

        {/* Main content — blurred when gate is open */}
        <main
          ref={mainRef}
          className={`flex-1 overflow-y-scroll scrollbar-grey p-2 lg:p-4 bg-[#16191C] text-white transition-all duration-200 ${gateOpen ? "blur-sm pointer-events-none select-none" : ""}`}
          style={{ scrollbarGutter: "stable" }}
        >
          <Outlet context={{ setSidebarHidden }} />
        </main>
      </div>

      {/* Direct Vault Capture modal rendered here when opening stock is missing */}
      {gateOpen && (
        <VaultCaptureModal 
          isOpen={gateOpen} 
          onClose={closeGate} 
          currencies={currencies}
          type="opening"
          onSave={handleSaveOpening}
          showGateInfo={true}
        />
      )}

      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onHide={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}

export default function AppLayout() {
  return (
    <ReconciliationProvider>
      <AppLayoutInner />
    </ReconciliationProvider>
  );
}
