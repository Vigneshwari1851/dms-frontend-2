import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table"; 
import add from "../../assets/dashboard/add.svg";
import ActionDropdown from "../../components/common/ActionDropdown";
import NotificationCard from "../../components/common/Notification"; 
import { fetchReconcoliation } from "../../api/reconcoliation";

export default function ReconciliationList() {
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch reconciliations
  const fetchReconciliations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchReconcoliation({ 
        page: 1, 
        limit: 100 // Fetch all data for client-side filtering
      });

      if (result.data) {
        setReconciliations(result.data);
      } else {
        setReconciliations([]);
      }
    } catch (err) {
      setError("Failed to fetch reconciliations. Please try again.");
      console.error("Error fetching reconciliations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliations();
  }, []);

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
      date: formatDate(reconciliation.created_at),
      openingVault: formatCurrency(reconciliation.opening_total),
      totalTransactions: reconciliation.total_transactions || 0,
      closingVault: formatCurrency(reconciliation.closing_total),
      variance: formatVariance(reconciliation.difference),
      status: reconciliation.status, // Your Table component will render the status badge
      actions: (
        <ActionDropdown
          options={[
            { 
              label: "View Details", 
              onClick: (e) => {
                e.stopPropagation(); // Prevent row click when clicking dropdown
                navigate(`/reconciliation/details/${reconciliation.id}`);
              }
            },
            { 
              label: "Edit", 
              onClick: (e) => {
                e.stopPropagation();
                navigate(`/reconciliation/edit/${reconciliation.id}`);
              }
            },
            { 
              label: "Delete", 
              onClick: (e) => {
                e.stopPropagation();
                handleDeleteClick(reconciliation.id, reconciliation.created_at);
              }
            },
            { 
              label: reconciliation.status === "Tallied" ? "Mark as Pending" : "Mark as Tallied", 
              onClick: (e) => {
                e.stopPropagation();
                handleStatusToggle(reconciliation.id, reconciliation.status);
              }
            },
          ]}
        />
      )
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

  const handleStatusToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "Tallied" ? "Pending" : "Tallied";
    setConfirmModal({
      open: true,
      actionType: "statusToggle",
      title: "Change Status",
      message: `Are you sure you want to change status from ${currentStatus} to ${newStatus}?`,
      id: id,
      currentStatus,
      newStatus
    });
  };

  const handleConfirm = () => {
    const { actionType, id } = confirmModal;
    
    if (actionType === "delete") {
      // Call delete API here
      console.log(`Deleting reconciliation ${id}`);
      // After successful deletion, refresh the list
      fetchReconciliations();
    } else if (actionType === "statusToggle") {
      // Call update status API here
      console.log(`Toggling status for reconciliation ${id}`);
      // After successful update, refresh the list
      fetchReconciliations();
    }
    
    setConfirmModal({ open: false });
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const handleRowClick = (row) => {
    navigate(`/reconciliation/details/${row.id}`);
  };

  const columns = [
    { label: "Date", key: "date" },
    { label: "Opening Vault", key: "openingVault" },
    { label: "Total Transactions", key: "totalTransactions" },
    { label: "Closing Vault", key: "closingVault" },
    { label: "Difference / Variance", key: "variance" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Reconciliation</h1>
        <button    
          onClick={handleAddUser}
          className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <img src={add} alt="add" className="w-5 h-5" />
          Create Reconciliation
        </button>
      </div>

      <p className="text-gray-400 mb-6">Manually data entry for daily vault reconciliation</p>

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
      {!loading && !error && reconciliations.length > 0 && (
        <div className="mt-8">
          <Table 
            columns={columns} 
            data={prepareTableData()}   
            title="Reconciliation List"
            subtitle={`Total: ${reconciliations.length} reconciliations`}
            showRightSection={true}
            onRowClick={handleRowClick}
            onSearch={handleSearch}
            sortableKeys={["date", "status", "totalTransactions"]}
          />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && reconciliations.length === 0 && (
        <div className="text-center py-10">
          <div className="text-gray-400 text-lg mb-4">No reconciliations found</div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium mx-auto"
          >
            <img src={add} alt="add" className="w-5 h-5" />
            Create First Reconciliation
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <NotificationCard 
        confirmModal={confirmModal}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </>
  );
}