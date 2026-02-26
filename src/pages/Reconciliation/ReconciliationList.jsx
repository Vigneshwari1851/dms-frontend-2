import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "../../components/common/Table";
import add from "../../assets/dashboard/add.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification";
import { fetchReconcoliation, exportReconciliation } from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import reconEmptyBg from "../../assets/Common/empty/recon-bg.svg";

export default function ReconciliationList() {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 10,
  });

  const location = useLocation();

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const fetchReconciliations = async (page = pagination.page, limit = pagination.limit) => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchReconcoliation({ page, limit });

      if (result.data) {
        setReconciliations(result.data);
        setPagination(prev => ({
          ...prev,
          page: result.pagination.page,
          totalPages: result.pagination.totalPages,
          limit: result.pagination.limit,
        }));
      } else {
        setReconciliations([]);
        setPagination(prev => ({ ...prev, totalPages: 1, page: 1 }));
      }
    } catch (err) {
      setError("Failed to fetch reconciliations. Please try again.");
      console.error("Error fetching reconciliations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.toast) {
      setToast({
        show: true,
        message: location.state.toast.message,
        type: location.state.toast.type,
      });

      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchReconciliations(newPage, pagination.limit);
  };

  const handleAddUser = () => {
    navigate("/reconciliation/add-reconciliation");
  };

  // Format date from "2025-12-11T09:19:02.337Z" to "2025/12/11"
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };



  // Format currency with commas
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "0.00";
    return Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format variance with + or - sign
  const formatVariance = (difference) => {
    if (difference === null || difference === undefined) return "0.00";

    const sign = difference >= 0 ? "+" : "";
    return `${sign}${formatCurrency(difference)}`;
  };

  // Prepare table data
  const prepareTableData = () => {
    return reconciliations.map((reconciliation) => ({
      id: reconciliation.id,
      // ✅ RAW DATE (for filter)
      created_at: reconciliation.created_at,

      // ✅ DISPLAY DATE
      date: formatDate(reconciliation.created_at),

      totalTransactions: reconciliation.total_transactions || 0,
      profitLoss: formatVariance(reconciliation.profitLoss),
      status: reconciliation.status,
      createdAt: formatDate(reconciliation.created_at),
    }));
  };

  const handleDeleteClick = (id, date) => {
    const formattedDate = formatDate(date);
    setConfirmModal({
      open: true,
      actionType: "delete",
      title: "Delete Reconciliation",
      message: `Are you sure you want to delete reconciliation from ${formattedDate}? This action cannot be undone.`,
      id: id,
      date: formattedDate
    });
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      setExportOpen(false);

      // Pass "today" as a string
      const blob = await exportReconciliation(format);
      if (!blob) {
        setToast({ show: true, message: "Export failed", type: "error" });
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `reconciliation_${Date.now()}.${format === "excel" ? "xlsx" : "pdf"}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);



    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  const handleConfirm = () => {
    const { actionType, id } = confirmModal;

    if (actionType === "delete") {
      console.log(`Deleting reconciliation ${id}`);
      fetchReconciliations();
    } else if (actionType === "statusToggle") {
    }

    setConfirmModal({ open: false });
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    fetchReconciliations(1, pagination.limit);
  };

  const handleRowClick = (row) => {
    navigate(`/reconciliation/details/${row.id}`);
  };

  const columns = [
    { label: "Date", key: "date", align: "left" },
    { label: "Total Transactions", key: "totalTransactions", align: "left" },
    { label: "Profit / Loss", key: "profitLoss", align: "left" },
    { label: "Created Date", key: "createdAt", align: "left" },
    { label: "Status", key: "status", align: "left" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-xl font-semibold">Reconciliation</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-lg shadow-[#1D4CB5]/20"
        >
          <img src={add} alt="add" className="w-5 h-5 transition-transform hover:scale-110" />
          <span className="lg:hidden text-[14px]">Create</span>
          <span className="hidden lg:inline text-[14px]">Create Reconciliation</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#16191C] border border-[#2A2F33]/50 rounded-xl p-5 shadow-sm hover:border-[#1D4CB5]/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8F8F8F] text-sm font-medium">Total Reconciliations</span>
            <div className="p-2 bg-[#1D4CB5]/10 rounded-lg text-[#1D4CB5]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{pagination.totalPages > 1 ? "..." : (reconciliations?.length || 0)}</div>
          <p className="text-[#8F8F8F] text-xs mt-2">Historical vault records</p>
        </div>

        <div className="bg-[#16191C] border border-[#2A2F33]/50 rounded-xl p-5 shadow-sm hover:border-green-500/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8F8F8F] text-sm font-medium">Tallied</span>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {reconciliations?.filter(r => r.status === "Tallied").length || 0}
          </div>
          <p className="text-[#8F8F8F] text-xs mt-2">Records with zero variance</p>
        </div>

        <div className="bg-[#16191C] border border-[#2A2F33]/50 rounded-xl p-5 shadow-sm hover:border-red-500/30 transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#8F8F8F] text-sm font-medium">Discrepancies</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {reconciliations?.filter(r => ["Short", "Excess"].includes(r.status)).length || 0}
          </div>
          <p className="text-[#8F8F8F] text-xs mt-2">Requiring review or adjustment</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="text-white">Loading reconciliations...</div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => fetchReconciliations()}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="mt-8">
          <Table
            columns={columns}
            data={prepareTableData()}
            title="Reconciliation List"
            showRightSection={true}
            onRowClick={handleRowClick}
            onSearch={handleSearch}
            onExport={handleExport}
            showExport={true}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            emptyStateProps={{
              imageSrc: reconEmptyBg,
              message: "No reconciliations found",
              description: "Perform your first daily vault reconciliation to see records here",
              action: (
                <button
                  onClick={() => navigate("/reconciliation/add-reconciliation")}
                  className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors mx-auto"
                >
                  <img src={add} alt="add" className="w-5 h-5" />
                  Create Reconciliation
                </button>
              )
            }}
          />
        </div>
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
      />
      {/* Confirmation Modal */}
      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </>
  );
}