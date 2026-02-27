import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../common/Table";

export default function ReconciliationExpandableRow({ reconciliation, formatDate, formatCurrency, statusColors }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const deals = reconciliation.deals || [];

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleNavigateToDeal = (deal) => {
        navigate(`/deals/edit-deal/${deal.dealId}`);
    };

    const typeColors = {
        Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
        Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
    };

    // Compute per-currency variance from opening and closing entries
    const currencyVariances = useMemo(() => {
        const totals = {};
        (reconciliation.openingEntries || []).forEach(entry => {
            const code = entry.currency?.code || "?";
            if (!totals[code]) totals[code] = { opening: 0, closing: 0 };
            totals[code].opening += Number(entry.amount || 0);
        });
        (reconciliation.closingEntries || []).forEach(entry => {
            const code = entry.currency?.code || "?";
            if (!totals[code]) totals[code] = { opening: 0, closing: 0 };
            totals[code].closing += Number(entry.amount || 0);
        });
        return Object.entries(totals).map(([code, { opening, closing }]) => ({
            code,
            variance: closing - opening
        }));
    }, [reconciliation.openingEntries, reconciliation.closingEntries]);

    const columns = useMemo(() => [
        {
            key: "id",
            label: "Deal ID",
            align: "left",
            className: "pl-5",
            render: (val) => <span className="text-[#92B4FF] font-bold text-[14px]">{val}</span>
        },
        {
            key: "date",
            label: "Date",
            align: "left"
        },
        {
            key: "type",
            label: "Type",
            align: "center",
            render: (val) => (
                <div className="flex justify-center items-center">
                    <span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[val]}`}>
                        {val}
                    </span>
                </div>
            )
        },
        {
            key: "customer",
            label: "Customer Name",
            align: "left"
        },
        {
            key: "pair",
            label: "Currency Pair",
            align: "left"
        },
        {
            key: "buyAmt",
            label: "Buy Amount",
            align: "left"
        },
        {
            key: "exchange_rate",
            label: "Rate",
            align: "left"
        },
        {
            key: "sellAmt",
            label: "Sell Amount",
            align: "left"
        },
        {
            key: "status",
            label: "Status",
            align: "center"
        }
    ], []);

    const tableData = useMemo(() => deals.map(({ deal }) => {
        const isBuy = deal.deal_type === "buy";
        const buyAmtValue = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
        const sellAmtValue = Number(isBuy ? deal.amount_to_be_paid : deal.amount);

        const pair = isBuy
            ? `${deal.buyCurrency.code}/${deal.sellCurrency.code}`
            : `${deal.sellCurrency.code}/${deal.buyCurrency.code}`;

        return {
            id: deal.deal_number,
            date: new Date(deal.created_at).toLocaleDateString("en-IN"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer: deal.customer?.name || "N/A",
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            pair: pair || "---",
            exchange_rate: deal.exchange_rate,
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            status: deal.status,
            dealId: deal.id,
        };
    }), [deals]);

    return (
        <>
            <tr
                onClick={toggleExpand}
                className={`h-12 rounded-2xl cursor-pointer transition-colors ${isExpanded ? "bg-[#1D4CB5]/5" : "bg-transparent hover:bg-[#1C2126]"} border-b border-[#2A2F33]/30`}
            >
                <td className="py-3 px-6 text-left">
                    <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8F8F8F]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-white font-medium">{formatDate(reconciliation.created_at)}</span>
                    </div>
                </td>
                <td className="py-3 px-6 text-center text-white">{deals.length}</td>
                <td className="py-3 px-6 text-right font-semibold">
                    {currencyVariances.length > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                            {currencyVariances.map(({ code, variance }) => (
                                <span key={code} className={variance >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                    {variance >= 0 ? "+" : ""}{formatCurrency(variance)} {code}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className={reconciliation.profitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                            {reconciliation.profitLoss >= 0 ? "+" : ""}{formatCurrency(reconciliation.profitLoss)} TZS
                        </span>
                    )}
                </td>
                <td className="py-3 px-6 text-center">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${statusColors[reconciliation.status] || ""}`}>
                        {reconciliation.status}
                    </span>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-[#16191C]/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <td colSpan={4} className="p-0">
                        <div className="px-12 py-6 border-l-2 border-[#1D4CB5]">
                            <h4 className="text-[#8F8F8F] text-[12px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <div className="w-1.5 h-3 bg-[#1D4CB5] rounded-full"></div>
                                Assosiated Transactions
                            </h4>

                            {deals.length > 0 ? (
                                <div className="overflow-hidden rounded-xl border border-[#2A2F33]/50">
                                    <Table
                                        columns={columns}
                                        data={tableData}
                                        showHeader={false}
                                        showSearch={false}
                                        showPagination={false}
                                        onRowClick={handleNavigateToDeal}
                                        showRightSection={false}
                                        itemsPerPage={100}
                                    />
                                </div>
                            ) : (
                                <div className="py-4 text-[#8F8F8F] italic text-sm">No deals mapped to this reconciliation.</div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
