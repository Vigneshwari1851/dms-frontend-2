import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import add from "../../assets/dashboard/add.svg";
import { fetchReconcoliation, exportReconciliation, fetchCurrentReconciliation, startReconcoliation } from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import reconEmptyBg from "../../assets/Common/empty/recon-bg.svg";
import ReconciliationExpandableRow from "../../components/reconciliation/ReconciliationExpandableRow";
import Pagination from "../../components/common/Pagination";
import searchIcon from "../../assets/Common/search.svg";

export default function TransactionLedger({ dateRange, embedded = false }) {
    const navigate = useNavigate();
    const [reconciliations, setReconciliations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        limit: 10,
    });
    const [todayReconciliation, setTodayReconciliation] = useState(null);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const fetchHistory = async (page = pagination.page, limit = pagination.limit) => {
        try {
            setLoading(true);
            const params = { page, limit };

            if (dateRange?.start && dateRange?.end) {
                params.dateFilter = "custom";
                params.startDate = format(dateRange.start, "yyyy-MM-dd");
                params.endDate = format(dateRange.end, "yyyy-MM-dd");
            }

            const result = await fetchReconcoliation(params);
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
        fetchHistory();
        if (!embedded) checkTodayReconciliation();
    }, [dateRange]);

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
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/-/g, '/');
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "0.00";
        return Number(amount).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };


    const statusColors = {
        Tallied: "text-[#82E890] bg-[#10B93524] border-[#82E890] border",
        Excess: "text-[#D8AD00] bg-[#302700] border-[#D8AD00] border",
        Short: "text-[#F7626E] bg-[#BD404A24] border-[#F7626E] border",
        In_Progress: "bg-[#939AF024] text-[#939AF0] border-[#939AF0] border",
    };

    const filteredData = reconciliations.filter(item =>
        formatDate(item.created_at).includes(searchTerm) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {!embedded && (
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-16px lg:text-[20px] font-semibold">
                            Transaction Ledger
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Daily reconciliation records and mapped deals
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                const isReconcileAction = todayReconciliation &&
                                    ["Tallied", "Excess", "Short"].includes(todayReconciliation.status);

                                if (isReconcileAction) {
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
                                {todayReconciliation && ["Tallied", "Excess", "Short"].includes(todayReconciliation.status)
                                    ? "Reconcile" : "Physical Cash"}
                            </span>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden">
                <div className="p-5 border-b border-[#2A2F33]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-white font-medium">Reconciliation History</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by date or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#131619] h-9 text-white text-sm px-9 rounded-lg outline-none w-full sm:w-64 border border-[#2A2F33]/50 focus:border-[#1D4CB5] transition-colors"
                        />
                        <img src={searchIcon} alt="search" className="w-4 h-4 absolute left-3 top-2.5 opacity-70" />
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-grey">
                    <table className="w-full text-sm text-[#8F8F8F]">
                        <thead>
                            <tr className="bg-[#1C2126] text-white">
                                <th className="py-4 px-6 text-left font-semibold">Date</th>
                                <th className="py-4 px-6 text-center font-semibold">Deals Count</th>
                                <th className="py-4 px-6 text-right font-semibold">Profit / Loss</th>
                                <th className="py-4 px-6 text-center font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2F33]/30">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#1D4CB5] border-t-transparent rounded-full animate-spin"></div>
                                            <p className="animate-pulse">Loading Transaction Ledger...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <img src={reconEmptyBg} alt="empty" className="w-24 opacity-20" />
                                            <p className="text-[#8F8F8F]">No reconciliation records found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((rec) => (
                                    <ReconciliationExpandableRow
                                        key={rec.id}
                                        reconciliation={rec}
                                        formatDate={formatDate}
                                        formatCurrency={formatCurrency}
                                        statusColors={statusColors}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-[#2A2F33]/50">
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPrev={() => handlePageChange(pagination.page - 1)}
                            onNext={() => handlePageChange(pagination.page + 1)}
                        />
                    </div>
                )}
            </div>

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
        </div>
    );
}
