import { useState, useEffect, useMemo } from "react";
import {
    Vault,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    List
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { fetchReconcoliation } from "../../api/reconcoliation";
import { useNavigate } from "react-router-dom";

function DealsTable({ deals }) {
    const navigate = useNavigate();

    if (!deals || deals.length === 0) {
        return (
            <div className="py-5 text-center text-[#8F8F8F] italic text-sm">
                No deals mapped to this reconciliation.
            </div>
        );
    }

    const typeColors = {
        Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
        Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="bg-[#0E1114] text-[#8F8F8F]">
                        <th className="px-5 py-3">Deal ID</th>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3 text-center">Type</th>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Pair</th>
                        <th className="px-5 py-3 text-right">Buy Amount</th>
                        <th className="px-5 py-3 text-right">Rate</th>
                        <th className="px-5 py-3 text-right">Sell Amount</th>
                        <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2F33]/30">
                    {deals.map(({ deal }) => {
                        if (!deal) return null;
                        const isBuy = deal.deal_type === "buy";
                        const buyAmt = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
                        const sellAmt = Number(isBuy ? deal.amount_to_be_paid : deal.amount);
                        const pair = isBuy
                            ? `${deal.buyCurrency?.code}/${deal.sellCurrency?.code}`
                            : `${deal.sellCurrency?.code}/${deal.buyCurrency?.code}`;
                        const typeLabel = isBuy ? "Buy" : "Sell";

                        return (
                            <tr
                                key={deal.id}
                                onClick={() => navigate(`/deals/edit-deal/${deal.id}`)}
                                className="hover:bg-[#1A1F24] cursor-pointer transition-colors"
                            >
                                <td className="px-5 py-3 text-[#92B4FF] font-bold">{deal.deal_number}</td>
                                <td className="px-5 py-3 text-gray-400">
                                    {new Date(deal.created_at).toLocaleDateString("en-GB")}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[typeLabel]}`}>
                                        {typeLabel}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-gray-300">{deal.customer?.name || "N/A"}</td>
                                <td className="px-5 py-3 text-gray-300">{pair || "---"}</td>
                                <td className="px-5 py-3 text-right text-gray-300">
                                    {buyAmt > 0 ? buyAmt.toLocaleString() : "—"}
                                </td>
                                <td className="px-5 py-3 text-right text-gray-400">{deal.exchange_rate}</td>
                                <td className="px-5 py-3 text-right text-gray-300">
                                    {sellAmt > 0 ? sellAmt.toLocaleString() : "—"}
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <span className="text-xs text-gray-400">{deal.status}</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Expandable breakdown row (non-daily) ────────────────────────────────────
function BreakdownRow({ summary, formatCurrency }) {
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
                        <div className="w-8 h-8 rounded-lg bg-[#131619] flex flex-col items-center justify-center border border-[#2A2F33]/50 group-hover:border-[#1D4CB5]/50 transition-colors">
                            <span className="text-[10px] text-[#8F8F8F]">{format(summary.date, "MMM")}</span>
                            <span className="text-sm text-white font-bold leading-none">{format(summary.date, "dd")}</span>
                        </div>
                        <span className="text-white font-medium">{format(summary.date, "EEEE")}</span>
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
                        <a
                            href="/reconciliation/add-reconciliation"
                            onClick={e => e.stopPropagation()}
                            className="bg-[#1D4CB5]/10 text-[#1D4CB5] hover:bg-[#1D4CB5] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-[#1D4CB5]/20"
                        >
                            Capture
                        </a>
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
                            <DealsTable deals={summary.recon?.deals} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
        if (!activeRecon) return [];
        const totals = calculateCurrencyTotals(activeRecon);
        return Object.values(totals).map(row => ({
            ...row,
            variance: row.physical - (row.book + row.deals),
            status: activeRecon.status,
        }));
    }, [periodType, dailySummaries, reconciliations]);

    const dotColors = ["bg-[#1D4CB5]", "bg-[#82E890]", "bg-[#D8AD00]", "bg-[#F7626E]", "bg-[#939AF0]"];

    return (
        <div className="space-y-2 animate-in fade-in duration-500">

            {/* ── Vault Status Section ── */}
            {/* ── Vault Status Section ── */}
            {((periodType === "daily" && dailySummaries[0]?.hasRecord) || (periodType !== "daily" && reconciliations.length > 0)) ? (
                <>
                    <div className="bg-[#1A1F24] rounded-xl border border-[#2A2F33]/50 overflow-hidden shadow-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="p-2 border-b border-[#2A2F33]/50 flex justify-between items-center bg-[#1E2328]">
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

                        {/* Currency breakdown table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-[#131619] text-white text-sm">
                                        <th className="px-6 py-2">Currency</th>
                                        <th className="px-6 py-2 text-right">Opening Vault</th>
                                        <th className="px-6 py-2 text-right">Book Balance</th>
                                        <th className="px-6 py-2 text-right">Closing Vault</th>
                                        <th className="px-6 py-2 text-right">Variance</th>
                                        <th className="px-6 py-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2A2F33]/30">
                                    {vaultRows.length > 0 ? vaultRows.map((row, idx) => {
                                        const isTallied = row.status === "Tallied";
                                        const variance = isTallied ? 0 : row.variance;
                                        return (
                                            <tr key={row.code} className="hover:bg-[#1E2328] transition-colors">
                                                <td className="px-6 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="">{row.code}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-2 text-right">{formatCurrency(row.book)}</td>
                                                <td className="px-6 py-2 text-right">{formatCurrency(row.book + row.deals)}</td>
                                                <td className="px-6 py-2 text-right">{formatCurrency(row.physical)}</td>
                                                <td className="px-6 py-2 text-right">
                                                    <span className={variance >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                                        {isTallied ? "0.00" : `${variance >= 0 ? "" : ""}${formatCurrency(variance)}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-2 text-center">
                                                    {isTallied ? (
                                                        <CheckCircle2 className="w-4 h-4 text-[#82E890] mx-auto" />
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${variance > 0 ? "bg-[#D8AD00]/10 text-[#D8AD00] border-[#D8AD00]/20" : "bg-[#F7626E]/10 text-[#F7626E] border-[#F7626E]/20"}`}>
                                                            {variance > 0 ? "EXCESS" : "SHORT"}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-10 text-center text-gray-500 italic text-sm">
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
                                </div>
                            </div>
                            <div className="p-0">
                                <DealsTable deals={dailySummaries[0]?.recon?.deals} />
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
                                {periodType === "daily" ? "Daily Vault Status" : "Latest Vault Status"}
                            </h3>
                            <p className="text-[#8F8F8F] text-xs mt-1">
                                {periodType === "daily"
                                    ? `Performance tracking for ${dateRange?.start ? format(dateRange.start, "MMM dd") : ""}`
                                    : `Most recent reconciliation in this ${periodType === "custom" ? "range" : periodType}`}
                            </p>
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
                            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
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
                                    <BreakdownRow key={idx} summary={summary} formatCurrency={formatCurrency} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
