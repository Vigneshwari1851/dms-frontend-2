import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReconciliationExpandableRow({ reconciliation, formatDate, formatCurrency, formatVariance, statusColors }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const deals = reconciliation.deals || [];

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleNavigateToDeal = (dealId) => {
        navigate(`/deals/edit-deal/${dealId}`);
    };

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
                <td className={`py-3 px-6 text-right font-semibold ${reconciliation.profitLoss >= 0 ? "text-[#82E890]" : "text-[#F7626E]"}`}>
                    {formatVariance(reconciliation.profitLoss)}
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
                                Mapped Transactions
                            </h4>

                            {deals.length > 0 ? (
                                <div className="overflow-hidden rounded-xl border border-[#2A2F33]/50">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[#1C2126] text-[#8F8F8F] text-[11px] uppercase tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Deal #</th>
                                                <th className="px-4 py-3 font-semibold">Customer</th>
                                                <th className="px-4 py-3 font-semibold">Type</th>
                                                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                                                <th className="px-4 py-3 font-semibold text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2A2F33]/30">
                                            {deals.map(({ deal }) => (
                                                <tr
                                                    key={deal.id}
                                                    onClick={() => handleNavigateToDeal(deal.id)}
                                                    className="hover:bg-[#1D4CB5]/10 cursor-pointer transition-colors group"
                                                >
                                                    <td className="px-4 py-3 text-[#1D4CB5] font-bold group-hover:underline">#{deal.deal_number}</td>
                                                    <td className="px-4 py-3 text-white">{deal.customer?.name || "N/A"}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${deal.deal_type === 'buy' ? 'bg-[#82E890]/10 text-[#82E890]' : 'bg-[#F7626E]/10 text-[#F7626E]'}`}>
                                                            {deal.deal_type?.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-white font-medium">
                                                        {Number(deal.amount).toLocaleString()} {deal.buyCurrency?.code || ""}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`text-[11px] font-medium ${deal.status === 'Completed' ? 'text-green-500' : 'text-orange-400'}`}>
                                                            {deal.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
