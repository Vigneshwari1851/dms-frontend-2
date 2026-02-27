import { useState, useEffect, useMemo } from "react";
import {
    Vault,
    TrendingUp,
    TrendingDown,
    Calendar,
    CalendarDays,
    CalendarRange,
    AlertCircle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    List
} from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import StatCard from "../../components/dashboard/StatCard";
import dealstoday from "../../assets/dashboard/dealstoday.svg";
import profit from "../../assets/dashboard/profit.svg";
import sellamount from "../../assets/dashboard/sellamount.svg";
import buyamount from "../../assets/dashboard/buyamount.svg";
import { fetchReconcoliation } from "../../api/reconcoliation";

export default function ReconciliationReport({ periodType, dateRange, refreshTrigger }) {
    const [loading, setLoading] = useState(false);
    const [reconciliations, setReconciliations] = useState([]);

    useEffect(() => {
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
        loadData();
    }, [dateRange, refreshTrigger]);

    const dailySummaries = useMemo(() => {
        if (!dateRange?.dates) return [];
        return dateRange.dates.map(date => {
            const recon = reconciliations.find(r => isSameDay(new Date(r.created_at), date));
            return {
                date,
                recon: recon || null,
                hasRecord: !!recon,
                status: recon?.status || "None",
                profitLoss: Number(recon?.profitLoss || 0),
                totalTransactions: recon?.total_transactions || 0
            };
        });
    }, [dateRange?.dates, reconciliations]);

    const periodStats = useMemo(() => {
        const tallied = reconciliations.filter(r => r.status === "Tallied").length;
        const discrepancies = reconciliations.filter(r => ["Short", "Excess"].includes(r.status)).length;
        const totalTransactions = reconciliations.reduce((sum, r) => sum + (r.total_transactions || 0), 0);
        const totalProfitLoss = reconciliations.reduce((sum, r) => sum + Number(r.profitLoss || 0), 0);

        return {
            tallied,
            discrepancies,
            totalTransactions,
            totalProfitLoss,
            daysWithoutCounts: (dateRange?.dates?.length || 0) - reconciliations.length
        };
    }, [reconciliations, dateRange?.dates]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(Math.abs(val));
    };

    const formatVariance = (difference) => {
        const sign = difference >= 0 ? "+" : "";
        return `${sign}${formatCurrency(difference)}`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Total Deals"
                    value={periodStats.totalTransactions}
                    icon={dealstoday}
                />
                <StatCard
                    title={`Net P&L`}
                    value={`TZS ${formatCurrency(periodStats.totalProfitLoss)}`}
                    icon={buyamount}
                    color={periodStats.totalProfitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}
                />
                <StatCard
                    title="Discrepancies"
                    value={periodStats.discrepancies}
                    icon={sellamount}
                    color={periodStats.discrepancies > 0 ? "text-[#F7626E]" : "text-gray-400"}
                />
            </div>

            {/* Daily Vault Status Section */}
            {(periodType === "daily" || (periodType !== "daily" && reconciliations.length > 0)) && (
                <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
                        <div>
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <Vault className="w-5 h-5 text-[#1D4CB5]" />
                                {periodType === "daily" ? "Daily Vault Status" : "Latest Vault Status"}
                            </h3>
                            <p className="text-[#8F8F8F] text-xs mt-1">
                                {periodType === "daily"
                                    ? `Performance tracking for ${dateRange?.start ? format(dateRange.start, "MMM dd") : ""}`
                                    : `Most recent reconciliation in this ${periodType === "custom" ? "range" : periodType}`}
                            </p>
                        </div>
                    </div>

                    {((periodType === "daily" && dailySummaries[0]?.hasRecord) || (periodType !== "daily" && reconciliations.length > 0)) ? (
                        <div className="p-0 animate-in slide-in-from-top-2 duration-300">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-[#131619] text-white text-sm">
                                            <th className="px-6 py-4">Currency</th>
                                            <th className="px-6 py-4 text-right">Book Balance</th>
                                            <th className="px-6 py-4 text-right">Physical Count</th>
                                            <th className="px-6 py-4 text-right">Variance</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#2A2F33]/30">
                                        {/* USD Row */}
                                        <tr className="hover:bg-[#1E2328] transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#1D4CB5]"></div>
                                                    <span className="text-white font-bold text-base">USD</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-gray-400">
                                                {formatCurrency((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.totalForeignBought || 0)}
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-white font-bold">
                                                {formatCurrency((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.totalForeignSold || 0)}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.status === "Tallied" ? "text-[#82E890]" : "text-[#F7626E]"}>
                                                    {(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.status === "Tallied" ? "0.00" : formatVariance((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.profitLoss)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.status === "Tallied"
                                                    ? "bg-[#82E890]/10 text-[#82E890] border-[#82E890]/20"
                                                    : "bg-[#F7626E]/10 text-[#F7626E] border-[#F7626E]/20"
                                                    }`}>
                                                    {(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.status?.toUpperCase() || "PENDING"}
                                                </span>
                                            </td>
                                        </tr>
                                        {/* TZS Row */}
                                        <tr className="hover:bg-[#1E2328] transition-colors opacity-80">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-[#82E890]"></div>
                                                    <span className="text-white font-bold text-base">TZS</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-gray-400">
                                                {formatCurrency((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.totalTzsPaid || 0)}
                                            </td>
                                            <td className="px-6 py-5 text-right font-mono text-white font-bold">
                                                {formatCurrency((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.totalTzsReceived || 0)}
                                            </td>
                                            <td className="px-6 py-5 text-right text-gray-500">-</td>
                                            <td className="px-6 py-5 text-center">
                                                <CheckCircle2 className="w-4 h-4 text-[#82E890] mx-auto" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 bg-[#131619]/50 border-t border-[#2A2F33]/50 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-gray-500">Valuation Rate: <span className="text-white">TZS {formatCurrency((periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.totalAvg || 0)}</span></span>
                                    <span className="text-xs text-gray-500">Total Deals: <span className="text-white">{(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0])?.total_transactions || 0}</span></span>
                                    {periodType !== "daily" && (
                                        <span className="text-xs text-[#1D4CB5] font-semibold">
                                            Record from {format(new Date((reconciliations[0]?.created_at)), "MMM dd, yyyy")}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => window.location.href = `/reconciliation/details/${(periodType === "daily" ? dailySummaries[0]?.recon : reconciliations[0]).id}`}
                                    className="bg-[#1D4CB5] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#2A5BD7] transition-all"
                                >
                                    Full Report Detail
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No reconciliation record found for this date.
                        </div>
                    )}
                </div>
            )}

            {/* Daily Breakdown Section (History List) */}
            {periodType !== "daily" && (
                <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 duration-500">
                    <div className="p-5 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
                        <div>
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                <List className="w-5 h-5 text-[#1D4CB5]" />
                                Daily Breakdown
                            </h3>
                            <p className="text-[#8F8F8F] text-xs mt-1">
                                List of all reconciliation records for this period
                            </p>
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
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Deals</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Profit / Loss</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2F33]/30">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#1D4CB5] border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-gray-400 animate-pulse">Scanning records...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dailySummaries.filter(s => s.hasRecord).map((summary, idx) => (
                                    <tr key={idx} className="hover:bg-[#1E2328] transition-colors group cursor-default">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#131619] flex flex-col items-center justify-center border border-[#2A2F33]/50 group-hover:border-[#1D4CB5]/50 transition-colors">
                                                    <span className="text-[10px] text-[#8F8F8F]">{format(summary.date, "MMM")}</span>
                                                    <span className="text-sm text-white font-bold leading-none">{format(summary.date, "dd")}</span>
                                                </div>
                                                <span className="text-white font-medium">{format(summary.date, "EEEE")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-2.5 py-1 rounded-md bg-[#131619] border border-[#2A2F33]/50 text-gray-300 font-mono text-xs">
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
                                        <td className="px-6 py-5 text-right font-mono font-bold">
                                            {summary.hasRecord ? (
                                                <span className={summary.profitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                                    {summary.profitLoss >= 0 ? "▲" : "▼"} TZS {formatCurrency(summary.profitLoss)}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {summary.hasRecord ? (
                                                <button
                                                    onClick={() => window.location.href = `/reconciliation/details/${summary.recon.id}`}
                                                    className="text-[#1D4CB5] hover:text-[#2A5BD7] text-xs font-bold transition-colors"
                                                >
                                                    Details
                                                    <span className="ml-1 inline-block transform transition-transform group-hover:translate-x-1">→</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => window.location.href = `/reconciliation/add-reconciliation`}
                                                    className="bg-[#1D4CB5]/10 text-[#1D4CB5] hover:bg-[#1D4CB5] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#1D4CB5]/20"
                                                >
                                                    Capture
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
