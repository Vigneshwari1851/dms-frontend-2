import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../common/Table";
import { ChevronRight } from "lucide-react";

export default function PnLExpandableRow({ rowData }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const deals = rowData.deals || [];

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
            align: "center",
            render: (val) => {
                const statusColors = {
                    Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
                    Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]",
                };
                return (
                    <span className={`px-3 py-1 text-[11px] rounded-full ${statusColors[val] || ""}`}>
                        {val}
                    </span>
                );
            }
        }
    ], []);

    const tableData = useMemo(() => deals.map(({ deal }) => {
        if (!deal) return null;
        const isBuy = deal.deal_type === "buy";
        const buyAmtValue = Number(isBuy ? deal.amount : deal.amount_to_be_paid);
        const sellAmtValue = Number(isBuy ? deal.amount_to_be_paid : deal.amount);

        const pair = isBuy
            ? `${deal.buyCurrency?.code || ""}/${deal.sellCurrency?.code || ""}`
            : `${deal.sellCurrency?.code || ""}/${deal.buyCurrency?.code || ""}`;

        return {
            id: deal.deal_number,
            date: new Date(deal.created_at).toLocaleDateString("en-GB"),
            type: deal.deal_type === "buy" ? "Buy" : "Sell",
            customer: deal.customer?.name || "N/A",
            buyAmt: buyAmtValue > 0 ? buyAmtValue.toLocaleString() : "--------",
            pair: pair || "---",
            exchange_rate: deal.exchange_rate,
            sellAmt: sellAmtValue > 0 ? sellAmtValue.toLocaleString() : "--------",
            status: deal.status,
            dealId: deal.id,
        };
    }).filter(Boolean), [deals]);

    return (
        <>
            <tr
                onClick={toggleExpand}
                className={`h-11 cursor-pointer transition-colors ${isExpanded ? "bg-[#1D4CB5]/5" : "bg-transparent hover:bg-[#151517]"} border-b border-[#2A2F33]/30 whitespace-nowrap`}
            >
                <td className="py-2 px-4 text-left">
                    <div className="flex items-center gap-3">
                        <div className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                            <ChevronRight className="h-4 w-4 text-[#8F8F8F]" />
                        </div>
                        <span className="text-white font-medium">{rowData.date}</span>
                    </div>
                </td>
                <td className="py-2 px-4 text-left text-[#8F8F8F]">{rowData.total_transactions}</td>
                <td className="py-2 px-4 text-left">
                    <span className={rowData.hasCustomRates ? "text-[#82E890]" : "text-gray-400"}>
                        {Number(rowData.setRate).toFixed(2)}
                    </span>
                </td>
                <td className="py-2 px-4 text-left text-[#8F8F8F]">TZS {Number(rowData.totalOpeningValue).toLocaleString()}</td>
                <td className="py-2 px-4 text-left text-[#8F8F8F]">TZS {Number(rowData.totalClosingValue).toLocaleString()}</td>
                <td className="py-2 px-4 text-left">
                    <div className="flex items-center gap-2">
                        {rowData.total_transactions > 0 ? (
                            <span className={rowData.profitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}>
                                {rowData.profitLoss >= 0 ? "▲" : "▼"} TZS {Math.abs(Number(rowData.profitLoss)).toLocaleString()}
                            </span>
                        ) : (
                            <span className="text-gray-400">TZS 0</span>
                        )}
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-[#16191C]/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <td colSpan={6} className="p-0">
                        <div className="px-10 py-5 border-l-2 border-[#1D4CB5]">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[#8F8F8F] flex items-center gap-2 text-sm">
                                    <div className="w-1.5 h-3 bg-[#1D4CB5] rounded-full"></div>
                                    Associated Deals
                                </h4>
                                <span className="text-[12px] text-[#8F8F8F]">
                                    Total Deals: <span className="text-white">{deals.length}</span>
                                </span>
                            </div>

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
                                <div className="py-4 text-[#8F8F8F] italic text-xs">No deals mapped to this reconciliation.</div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
