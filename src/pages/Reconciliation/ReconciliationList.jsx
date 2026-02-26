import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "../../components/common/Table";
import add from "../../assets/dashboard/add.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification";
import { fetchReconcoliation, exportReconciliation, fetchCurrentReconciliation, startReconcoliation } from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import reconEmptyBg from "../../assets/Common/empty/recon-bg.svg";
import ReconciliationReport from "./ReconciliationReport";

export default function ReconciliationList() {
  const navigate = useNavigate();
  const [viewType, setViewType] = useState("report"); // "report" or "list"
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 10,
  });

  const location = useLocation();
  const [todayReconciliation, setTodayReconciliation] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const fetchHistory = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      const result = await fetchReconcoliation({ page, limit });
      if (result.data) {
        setReconciliations(result.data);
        setPagination({
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          limit: result.pagination.limit,
        });
      } else {
        setReconciliations([]);
      }
    } catch (err) {
      console.error("Error fetching reconciliations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.toast) {
      setToast({ show: true, message: location.state.toast.message, type: location.state.toast.type });
      setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      window.history.replaceState({}, document.title);
    }
    fetchHistory();
    checkTodayReconciliation();
  }, [location.state]);

  const checkTodayReconciliation = async () => {
    try {
      const res = await fetchCurrentReconciliation();
      if (res.success && res.data) {
        setTodayReconciliation(res.data);
      }
    } catch (err) {
      console.error("Error checking today's reconciliation:", err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchHistory(newPage, pagination.limit);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    return Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatVariance = (difference) => {
    const sign = difference >= 0 ? "+" : "";
    return `${sign}${formatCurrency(difference)}`;
  };

  const prepareTableData = () => {
    return reconciliations.map((reconciliation) => ({
      id: reconciliation.id,
      created_at: reconciliation.created_at,
      date: formatDate(reconciliation.created_at),
      totalTransactions: reconciliation.total_transactions || 0,
      profitLoss: formatVariance(reconciliation.profitLoss),
      status: reconciliation.status,
    }));
  };

  const handleExport = async (format) => {
    const blob = await exportReconciliation(format);
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reconciliation_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const columns = [
    { label: "Date", key: "date", align: "left" },
    { label: "Deals Count", key: "totalTransactions", align: "center" },
    { label: "Profit / Loss", key: "profitLoss", align: "right" },
    { label: "Status", key: "status", align: "center" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-16px lg:text-[20px] font-semibold">
            Vault Reconciliation
          </h1>
          <p className="text-gray-400 text-sm mt-1 hidden lg:block">
            Audit and verify daily cash balances
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#1A1F24] p-1 rounded-lg border border-[#2A2F33]/50 mr-2">
            <button
              onClick={() => setViewType("report")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewType === "report" ? "bg-[#1D4CB5] text-white shadow-md font-bold" : "text-gray-400 hover:text-white"
                }`}
            >
              REPORT
            </button>
            <button
              onClick={() => setViewType("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewType === "list" ? "bg-[#1D4CB5] text-white shadow-md font-bold" : "text-gray-400 hover:text-white"
                }`}
            >
              HISTORY
            </button>
          </div>

          <button
            onClick={async () => {
              const hasClosing = todayReconciliation?.closingEntries?.length > 0 || todayReconciliation?.closing_entries?.length > 0;
              const resizableStatuses = ["In_Progress", "Excess", "Short"];
              const canReconcile = todayReconciliation && resizableStatuses.includes(todayReconciliation.status) && hasClosing;

              if (canReconcile) {
                try {
                  setToast({ show: true, message: "Reconciling deals...", type: "pending" });
                  const res = await startReconcoliation(todayReconciliation.id);
                  if (res.success || res.status === "success") {
                    setToast({ show: true, message: "Reconciliation successful!", type: "success" });
                    fetchHistory();
                    checkTodayReconciliation();
                  } else {
                    setToast({ show: true, message: res.error?.message || "Reconciliation failed", type: "error" });
                  }
                } catch (err) {
                  console.error("Error triggering reconciliation:", err);
                  setToast({ show: true, message: "Error during reconciliation", type: "error" });
                }
              } else if (todayReconciliation) {
                navigate(`/reconciliation/add-reconciliation/${todayReconciliation.id}`);
              } else {
                navigate("/reconciliation/add-reconciliation");
              }
            }}
            className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#1D4CB5]/30 transform active:scale-95"
          >
            <img src={add} alt="add" className="w-5 h-5" />
            <span>
              {todayReconciliation && ["In_Progress", "Excess", "Short"].includes(todayReconciliation.status) &&
                (todayReconciliation?.closingEntries?.length > 0 || todayReconciliation?.closing_entries?.length > 0)
                ? "Reconcile" : "Physical Cash"}
            </span>
          </button>
        </div>
      </div>

      {viewType === "report" ? (
        <ReconciliationReport />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Table
            loading={loading}
            columns={columns}
            data={prepareTableData()}
            title="Reconciliation Logs"
            subtitle="Archive of all performed vault reconciliations"
            showRightSection={true}
            onRowClick={(row) => navigate(`/reconciliation/details/${row.id}`)}
            onSearch={(val) => fetchHistory(1, pagination.limit)}
            onExport={handleExport}
            showExport={true}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            emptyStateProps={{
              imageSrc: reconEmptyBg,
              message: "Empty Ledger",
              description: "No reconciliation records found in history",
              action: (
                <button
                  onClick={() => navigate("/reconciliation/add-reconciliation")}
                  className="bg-[#1D4CB5] text-white px-4 py-2 rounded-lg text-sm font-bold mt-4"
                >
                  Start First Reconciliation
                </button>
              )
            }}
          />
        </div>
      )}

      <Toast show={toast.show} message={toast.message} type={toast.type} />
      <NotificationCard confirmModal={confirmModal} onConfirm={() => setConfirmModal({ open: false })} onCancel={() => setConfirmModal({ open: false })} />
    </div>
  );
}
