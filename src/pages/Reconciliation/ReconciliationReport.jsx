import { useState, useEffect, useMemo } from "react";
import {
    Vault,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    List,
    X,
    Info,
    RefreshCw,
    Search,
    Download,
    Printer,
    Filter
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import Table from "../../components/common/Table";
import VaultCaptureModal from "../../components/common/VaultCaptureModal";
import ActionDropdown from "../../components/common/ActionDropdown";
import {
    createReconciliation,
    updateReconciliation,
    fetchCurrentReconciliation,
    startReconcoliation,
    fetchReconcoliation
} from "../../api/reconcoliation";
import { fetchCurrencies } from "../../api/currency/currency";
import Toast from "../../components/common/Toast";



const getDealsColumns = (typeColors) => [
    { key: "deal_number", label: "Deal ID", align: "left", className: "pl-5 text-white" },
    {
        key: "created_at",
        label: "Date",
        align: "left",
        render: (val) => <span>{new Date(val).toLocaleDateString("en-GB")}</span>
    },
    {
        key: "deal_type",
        label: "Type",
        align: "center",
        render: (val) => {
            const typeLabel = val === "buy" ? "Buy" : "Sell";
            return (
                <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[typeLabel]}`}>
                    {typeLabel}
                </span>
            );
        }
    },
    {
        key: "customer",
        label: "Customer",
        align: "left",
        render: (val) => <span>{val?.name || "N/A"}</span>
    },
    {
        key: "pair",
        label: "Pair",
        align: "left",
        render: (_, row) => {
            const isBuy = row.deal_type === "buy";
            return isBuy
                ? `${row.buyCurrency?.code}/${row.sellCurrency?.code}`
                : `${row.sellCurrency?.code}/${row.buyCurrency?.code}`;
        }
    },
    {
        key: "buyAmt",
        label: "Buy Amount",
        align: "right",
        render: (_, row) => {
            const isBuy = row.deal_type === "buy";
            const amt = Number(isBuy ? row.amount : row.amount_to_be_paid);
            return <span>{amt > 0 ? amt.toLocaleString() : "—"}</span>;
        }
    },
    { key: "exchange_rate", label: "Rate", align: "right", className: "text-gray-400" },
    {
        key: "sellAmt",
        label: "Sell Amount",
        align: "right",
        render: (_, row) => {
            const isBuy = row.deal_type === "buy";
            const amt = Number(isBuy ? row.amount_to_be_paid : row.amount);
            return <span>{amt > 0 ? amt.toLocaleString() : "—"}</span>;
        }
    },
    {
        key: "status",
        label: "Status",
        align: "center",
        render: (val) => <span>{val}</span>
    }
];

// ─── Expandable breakdown row (non-daily) ────────────────────────────────────
function BreakdownRow({ summary, formatCurrency, onDateSelect }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    return (
        <>
            {/* Main summary row */}
            <tr
                onClick={() => summary.hasRecord && setExpanded(v => !v)}
                className={`transition-colors group ${summary.hasRecord ? "cursor-pointer hover:bg-[#1E2328]" : "cursor-default"}`}
            >
                <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        {summary.hasRecord && (
                            <div className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
                                <ChevronRight className="w-4 h-4 text-[#8F8F8F]" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-white font-medium">{format(summary.date, "dd/MM/yyyy")}</span>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-5 text-center">
                    <span className="px-2.5 py-1 rounded-md bg-[#131619] border border-[#2A2F33]/50 text-gray-300 text-xs">
                        {summary.totalTransactions} deals
                    </span>
                </td>
                <td className="px-6 py-5 text-center">
                    {summary.hasRecord ? (
                        <div className="flex items-center justify-center gap-1.5">
                            {summary.status === "Tallied" ? (
                                <div className="flex items-center gap-1.5 text-[#82E890] bg-[#82E890]/10 px-2 py-1 rounded-full border border-[#82E890]/20 text-[11px] font-bold">
                                    <CheckCircle2 className="w-3 h-3" /> TALLIED
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[#F7626E] bg-[#F7626E]/10 px-2 py-1 rounded-full border border-[#F7626E]/20 text-[11px] font-bold">
                                    <AlertCircle className="w-3 h-3" /> {summary.status.toUpperCase()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-gray-600 text-[11px] italic">Not Reconciled</span>
                    )}
                </td>
                <td className="px-6 py-5 text-right font-bold">
                    {summary.hasRecord ? (
                        summary.currencyVariances.length > 0 ? (
                            <div className="flex flex-col items-end gap-0.5">
                                {summary.currencyVariances.map(({ code, variance }) => (
                                    <span key={code} className={variance >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                        {variance >= 0 ? "" : ""} {formatCurrency(variance)} {code}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className={summary.profitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                {summary.profitLoss >= 0 ? "" : ""} TZS {formatCurrency(summary.profitLoss)}
                            </span>
                        )
                    ) : "—"}
                </td>
                <td className="px-6 py-5 text-right">
                    {!summary.hasRecord && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onDateSelect) onDateSelect(new Date(summary.date));
                            }}
                            className="bg-[#1D4CB5]/10 text-[#1D4CB5] hover:bg-[#1D4CB5] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#1D4CB5]/20"
                        >
                            Capture
                        </button>
                    )}
                </td>
            </tr>

            {/* Expanded deals panel */}
            {expanded && summary.hasRecord && (
                <tr>
                    <td colSpan={5} className="p-0 bg-[#16191C]/60">
                        <div className="px-10 py-4 border-l-2 border-[#1D4CB5] animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-[#8F8F8F] flex items-center gap-2">
                                    <span className="w-1.5 h-3 bg-[#1D4CB5] rounded-full inline-block" />
                                    Associated Transactions
                                </p>
                                <span className="text-[#8F8F8F]">
                                    Total Deals: <span className="text-white">{summary.totalTransactions}</span>
                                </span>
                            </div>
                            <Table
                                columns={getDealsColumns({
                                    Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
                                    Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
                                })}
                                data={(summary.recon?.deals || []).map(d => d.deal).filter(Boolean)}
                                showHeader={false}
                                showSearch={false}
                                showPagination={false}
                                onRowClick={(row) => navigate(`/deals/edit-deal/${row.id}`)}
                                itemsPerPage={100}
                                emptyStateProps={{ message: "No deals mapped to this reconciliation." }}
                            />
                        </div>
                    </td>
                </tr>
            )
            }
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReconciliationReport({
    periodType,
    dateRange,
    refreshTrigger,
    onDateSelect,
    autoCaptureTrigger = 0,
    setSidebarHidden
}) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [reconciliations, setReconciliations] = useState([]);
    const [allCurrencies, setAllCurrencies] = useState([]);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [captureModal, setCaptureModal] = useState({
        isOpen: false,
        type: "opening",
        initialAmounts: {}, // { currencyId: amount }
        isLocked: false,
        reconId: null,
        isEdit: false
    });
    const [lastTriggerId, setLastTriggerId] = useState(0);

    // Hide sidebar when modal is open
    useEffect(() => {
        if (setSidebarHidden) {
            setSidebarHidden(captureModal.isOpen);
        }
        // Cleanup on unmount or when modal closes
        return () => {
            if (setSidebarHidden) {
                setSidebarHidden(false);
            }
        };
    }, [captureModal.isOpen, setSidebarHidden]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const currencies = await fetchCurrencies({ page: 1, limit: 100 });
                setAllCurrencies(currencies?.data || currencies || []);
            } catch (err) {
                console.error("Error loading currencies:", err);
            }
        };
        loadInitialData();
    }, []);

    const loadData = async () => {
        if (!dateRange?.start || !dateRange?.end) return;
        setLoading(true);
        try {
            const response = await fetchReconcoliation({
                dateFilter: "custom",
                startDate: format(dateRange.start, "yyyy-MM-dd"),
                endDate: format(dateRange.end, "yyyy-MM-dd"),
                limit: 100
            });
            setReconciliations(response.data || []);
        } catch (err) {
            console.error("Error loading reconciliation report data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [dateRange, refreshTrigger]);


    const handleOpenVaultCapture = (focusCurrency, type = "opening", recon = null) => {
        const initialAmounts = {};
        let isLocked = false;
        let isEdit = false;

        if (recon) {
            const entries = type === "opening" ? recon.openingEntries : recon.closingEntries;

            // Map ALL existing entries into initialAmounts
            entries?.forEach(e => {
                initialAmounts[e.currency_id] = e.amount.toString();
            });

            if (Object.keys(initialAmounts).length > 0) {
                isEdit = true;
            }

            // Opening vault is locked if deals are mapped
            if (type === "opening" && recon.deals?.length > 0) {
                isLocked = true;
            }
        }

        setCaptureModal({
            isOpen: true,
            type,
            initialAmounts,
            isLocked,
            reconId: recon?.id || null,
            isEdit
        });
    };

    const handleSaveVault = async (entries) => {
        try {
            setToast({ show: true, message: "Saving balances...", type: "pending" });

            const payload = {
                notes: [],
                [captureModal.type === "opening" ? "openingEntries" : "closingEntries"]: entries
            };

            let result;
            if (captureModal.isEdit && captureModal.reconId) {
                result = await updateReconciliation(captureModal.reconId, payload);
            } else {
                result = await createReconciliation(payload);
            }

            if (result.success) {
                setToast({ show: true, message: "Balance saved successfully", type: "success" });
                setCaptureModal(prev => ({ ...prev, isOpen: false }));

                if (captureModal.type === "opening") {
                    // Navigate to dashboard after saving opening vault
                    setTimeout(() => {
                        navigate("/reconciliation");
                    }, 1000);
                } else {
                    loadData(); // Refresh report for closing entries
                }

                if (refreshTrigger?.callback) refreshTrigger.callback();
            } else {
                setToast({ show: true, message: result.error?.message || "Failed to save balance", type: "error" });
            }
        } catch (err) {
            console.error("Error saving vault balance:", err);
            setToast({ show: true, message: "Error saving balance", type: "error" });
        }
    };

    const handleMapDeals = async (reconId) => {
        try {
            setToast({ show: true, message: "Mapping deals...", type: "pending" });
            const res = await startReconcoliation(reconId);
            if (res.success) {
                setToast({ show: true, message: "Deals mapped successfully", type: "success" });
                loadData();
            } else {
                setToast({ show: true, message: res.error?.message || "Failed to map deals", type: "error" });
            }
        } catch (err) {
            console.error("Error mapping deals:", err);
            setToast({ show: true, message: "Error mapping deals", type: "error" });
        }
    };

    const calculateCurrencyTotals = (recon) => {
        const totals = {};
        if (!recon) return totals;

        (recon.openingEntries || []).forEach(entry => {
            const code = entry.currency?.code || "?";
            if (!totals[code]) totals[code] = { code, book: 0, deals: 0, physical: 0 };
            totals[code].book += Number(entry.amount || 0);
        });

        (recon.closingEntries || []).forEach(entry => {
            const code = entry.currency?.code || "?";
            if (!totals[code]) totals[code] = { code, book: 0, deals: 0, physical: 0 };
            totals[code].physical += Number(entry.amount || 0);
        });

        (recon.deals || []).forEach(rd => {
            const deal = rd.deal;
            if (!deal) return;

            const hasItems = (deal.receivedItems?.length > 0 || deal.paidItems?.length > 0);
            if (hasItems) {
                deal.receivedItems.forEach(item => {
                    const code = item.currency?.code || "?";
                    if (!totals[code]) totals[code] = { code, book: 0, deals: 0, physical: 0 };
                    totals[code].deals += Number(item.total || 0);
                });
                deal.paidItems.forEach(item => {
                    const code = item.currency?.code || "?";
                    if (!totals[code]) totals[code] = { code, book: 0, deals: 0, physical: 0 };
                    totals[code].deals -= Number(item.total || 0);
                });
            } else {
                const buyCode = deal.buyCurrency?.code;
                const sellCode = deal.sellCurrency?.code;
                const amount = Number(deal.amount || 0);
                const amountToBePaid = Number(deal.amount_to_be_paid || 0);

                if (deal.deal_type === "buy") {
                    if (buyCode) {
                        if (!totals[buyCode]) totals[buyCode] = { code: buyCode, book: 0, deals: 0, physical: 0 };
                        totals[buyCode].deals += amount;
                    }
                    if (sellCode) {
                        if (!totals[sellCode]) totals[sellCode] = { code: sellCode, book: 0, deals: 0, physical: 0 };
                        totals[sellCode].deals -= amountToBePaid;
                    }
                } else if (deal.deal_type === "sell") {
                    if (buyCode) {
                        if (!totals[buyCode]) totals[buyCode] = { code: buyCode, book: 0, deals: 0, physical: 0 };
                        totals[buyCode].deals += amountToBePaid;
                    }
                    if (sellCode) {
                        if (!totals[sellCode]) totals[sellCode] = { code: sellCode, book: 0, deals: 0, physical: 0 };
                        totals[sellCode].deals -= amount;
                    }
                }
            }
        });
        return totals;
    };

    const dailySummaries = useMemo(() => {
        if (!dateRange?.dates) return [];
        return dateRange.dates.map(date => {
            const recon = reconciliations.find(r => isSameDay(new Date(r.created_at), date));
            const currencyVariances = [];

            if (recon) {
                const totals = calculateCurrencyTotals(recon);
                Object.values(totals).forEach(row => {
                    currencyVariances.push({
                        code: row.code,
                        variance: row.physical - (row.book + row.deals)
                    });
                });
            }

            return {
                date,
                recon: recon || null,
                hasRecord: !!recon,
                status: recon?.status || "None",
                profitLoss: Number(recon?.profitLoss || 0),
                totalTransactions: recon?.total_transactions || 0,
                currencyVariances,
            };
        });
    }, [dateRange?.dates, reconciliations]);

    const periodStats = useMemo(() => {
        const tallied = reconciliations.filter(r => r.status === "Tallied").length;
        const discrepancies = reconciliations.filter(r => ["Short", "Excess"].includes(r.status)).length;
        const totalTransactions = reconciliations.reduce((sum, r) => sum + (r.total_transactions || 0), 0);
        const totalProfitLoss = reconciliations.reduce((sum, r) => sum + Number(r.profitLoss || 0), 0);
        return { tallied, discrepancies, totalTransactions, totalProfitLoss, daysWithoutCounts: (dateRange?.dates?.length || 0) - reconciliations.length };
    }, [reconciliations, dateRange?.dates]);

    const formatCurrency = (val) =>
        new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(val));

    // Per-currency vault rows for the active reconciliation
    const vaultRows = useMemo(() => {
        const activeRecon = periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0];
        const isToday = periodType === "daily" && isSameDay(dateRange.start, new Date());

        const totals = calculateCurrencyTotals(activeRecon);

        return Object.values(totals).map(row => ({
            ...row,
            variance: row.physical - (row.book + row.deals),
            status: activeRecon?.status || "None",
            recon: activeRecon
        }));
    }, [periodType, dailySummaries, reconciliations, allCurrencies, dateRange]);

    // Handle auto-capture trigger from dashboard (Physical Cash button)
    useEffect(() => {
        if (autoCaptureTrigger > 0 && autoCaptureTrigger !== lastTriggerId && allCurrencies.length > 0) {
            // Find the first currency that doesn't have an opening balance in vaultRows
            const rowToCapture = vaultRows.find(r => r.book === 0) || vaultRows[0];
            const activeRecon = periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0];
            const typeToCapture = (activeRecon?.deals?.length > 0) ? "closing" : "opening";

            if (rowToCapture) {
                handleOpenVaultCapture(rowToCapture, typeToCapture, rowToCapture.recon);
                setLastTriggerId(autoCaptureTrigger);
            } else if (allCurrencies.length > 0) {
                handleOpenVaultCapture(allCurrencies[0], typeToCapture, activeRecon);
                setLastTriggerId(autoCaptureTrigger);
            }
        }
    }, [autoCaptureTrigger, lastTriggerId, vaultRows, allCurrencies, periodType, dailySummaries, reconciliations]);

    const dotColors = ["bg-[#1D4CB5]", "bg-[#82E890]", "bg-[#D8AD00]", "bg-[#F7626E]", "bg-[#939AF0]"];

    return (
        <div className="space-y-2 animate-in fade-in duration-500">

            {/* ── Vault Status Section ── */}
            {(periodType === "daily" || (periodType !== "daily" && reconciliations.length > 0)) ? (
                <>
                    <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="p-2 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
                            <div className="flex items-center gap-3">
                                <h3 className="text-white text-lg flex items-center gap-2">
                                    <Vault className="w-5 h-5 text-[#1D4CB5]" />
                                    Vault Status - {
                                        periodType === "daily"
                                            ? (isSameDay(dateRange.start, new Date()) ? "Today" : format(dateRange.start, "MMM dd"))
                                            : `${format(dateRange.start, "MMM dd")} to ${format(dateRange.end, "MMM dd")}`
                                    }
                                </h3>
                            </div>
                        </div>

                        {/* Currency breakdown table */}
                        <div className="overflow-x-auto scrollbar-grey">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#131619] text-white text-sm">
                                        <th className="px-6 py-2">Currency</th>
                                        <th className="px-6 py-2 text-right">Opening Vault</th>
                                        <th className="px-6 py-2 text-right">Book Balance</th>
                                        <th className="px-6 py-2 text-right">Closing Vault</th>
                                        <th className="px-6 py-2 text-right">Variance</th>
                                        <th className="px-6 py-2 text-center">Status</th>
                                        <th className="px-6 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#2A2F33]/30">
                                    {vaultRows.length > 0 ? (
                                        (periodType === "daily" && isSameDay(dateRange.start, new Date()) && !dailySummaries[0]?.hasRecord) ? (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="bg-[#1D4CB5]/10 p-4 rounded-full">
                                                            <Vault className="w-8 h-8 text-[#1D4CB5]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium text-lg">Please record your opening balances to start today's reconciliation.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            vaultRows.map((row, idx) => {
                                                const isTallied = row.status === "Tallied";
                                                const variance = isTallied ? 0 : row.variance;
                                                return (
                                                    <tr key={row.code} className="hover:bg-[#1E2328] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-white font-medium">{row.code}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-gray-300">{formatCurrency(row.book)}</td>
                                                        <td className="px-6 py-4 text-right text-gray-300">{formatCurrency(row.book + row.deals)}</td>
                                                        <td className="px-6 py-4 text-right text-gray-300">{formatCurrency(row.physical)}</td>
                                                        <td className="px-6 py-4 text-right font-mono">
                                                            <span className={variance >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                                                {isTallied ? "0.00" : `${variance > 0 ? "+" : ""}${formatCurrency(variance)}`}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {isTallied ? (
                                                                <div className="flex items-center justify-center gap-1.5 text-[#82E890] text-[10px] font-bold uppercase">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Tallied
                                                                </div>
                                                            ) : (
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${variance > 0 ? "bg-[#D8AD00]/10 text-[#D8AD00] border-[#D8AD00]/20" : "bg-[#F7626E]/10 text-[#F7626E] border-[#F7626E]/20"}`}>
                                                                    {variance > 0 ? "EXCESS" : "SHORT"}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end">
                                                                <ActionDropdown
                                                                    options={[
                                                                        {
                                                                            label: row.book > 0 ? "View Opening" : "Open Vault",
                                                                            onClick: () => handleOpenVaultCapture(row, "opening", row.recon)
                                                                        },
                                                                        ...(row.book > 0 ? [{
                                                                            label: row.physical > 0 ? "Edit Closing" : "Close Vault",
                                                                            onClick: () => handleOpenVaultCapture(row, "closing", row.recon)
                                                                        }] : [])
                                                                    ]}
                                                                />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-10 text-center text-gray-500 italic text-sm">
                                                No currency entries found for this reconciliation.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Daily view: show deals in separate card ── */}
                    {periodType === "daily" && (
                        <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 duration-500 mt-4">
                            <div className="py-2 bg-[#16191C]/60 border-b border-[#2A2F33]/50">
                                <div className="flex justify-between items-center">
                                    <p className="text-[#8F8F8F] flex items-center gap-2">
                                        <span className="" />
                                        Associated Transactions
                                    </p>
                                    <span className="text-[#8F8F8F]">
                                        Total Deals: <span className="text-white">{(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.total_transactions || 0}</span>
                                    </span>
                                    {periodType === "daily" && isSameDay(dateRange.start, new Date()) && dailySummaries[0]?.recon && (
                                        <button
                                            onClick={() => handleMapDeals(dailySummaries[0].recon.id)}
                                            className="bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                        >
                                            <List className="w-3.5 h-3.5" />
                                            Map Deals
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-0">
                                <Table
                                    columns={getDealsColumns({
                                        Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
                                        Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
                                    })}
                                    data={(dailySummaries[0]?.recon?.deals || []).map(d => d.deal).filter(Boolean)}
                                    showHeader={false}
                                    showSearch={false}
                                    showPagination={false}
                                    onRowClick={(row) => navigate(`/deals/edit-deal/${row.id}`)}
                                    itemsPerPage={100}
                                    emptyStateProps={{ message: "No deals mapped to this reconciliation." }}
                                />
                            </div>
                        </div>
                    )}
                </>
            ) : (periodType === "daily" || reconciliations.length > 0) ? (
                <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300">
                    <div className="p-5 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
                        <div>
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <Vault className="w-5 h-5 text-[#1D4CB5]" />
                                Vault Status - {
                                    periodType === "daily"
                                        ? (isSameDay(dateRange.start, new Date()) ? "today" : format(dateRange.start, "MMM dd"))
                                        : `${format(dateRange.start, "MMM dd")} to ${format(dateRange.end, "MMM dd")}`
                                }
                            </h3>
                        </div>
                    </div>
                    <div className="p-10 text-center text-gray-500">
                        No reconciliation record found for this date.
                    </div>
                </div>
            ) : null}

            {/* ── Daily Breakdown Section (non-daily) with expandable rows ── */}
            {periodType !== "daily" && (
                <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 duration-500 mt-4">
                    <div className="p-2 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
                        <div>
                            <h3 className="text-white text-lg flex items-center gap-2">
                                <List className="w-5 h-5 text-[#1D4CB5]" />
                                Daily Breakdown
                            </h3>
                            <p className="text-[#8F8F8F] text-xs mt-1">Click a row to view associated deals</p>
                        </div>
                        {periodStats.discrepancies > 0 && (
                            <div className="flex items-center gap-2 bg-red-500/10 text-[#F7626E] px-3 py-1.5 rounded-lg text-xs font-normal border border-red-500/20">
                                <AlertCircle className="w-4 h-4" />
                                {periodStats.discrepancies} Issue(s) detected
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-auto scrollbar-grey">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#131619] text-[#8F8F8F] font-normal">
                                    <th className="px-6 py-2">Date</th>
                                    <th className="px-6 py-2 text-center">Deals</th>
                                    <th className="px-6 py-2 text-center">Status</th>
                                    <th className="px-6 py-2 text-right">Variance</th>
                                    <th className="px-6 py-2 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2F33]/30">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#1D4CB5] border-t-transparent rounded-full animate-spin" />
                                                <p className="text-gray-400 animate-pulse">Scanning records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dailySummaries.filter(s => s.hasRecord).map((summary, idx) => (
                                    <BreakdownRow key={idx} summary={summary} formatCurrency={formatCurrency} onDateSelect={onDateSelect} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <VaultCaptureModal
                isOpen={captureModal.isOpen}
                onClose={() => setCaptureModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveVault}
                currencies={allCurrencies}
                type={captureModal.type}
                initialAmounts={captureModal.initialAmounts}
                isLocked={captureModal.isLocked}
            />

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
}
