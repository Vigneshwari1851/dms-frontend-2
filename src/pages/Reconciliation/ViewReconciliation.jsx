import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import edit from "../../assets/Common/edit.svg";
import { useNavigate, useParams } from "react-router-dom";
import DealsTable from "../../components/dashboard/DealsTable";
import { fetchReconciliationById } from "../../api/reconcoliation";

export default function ViewReconciliation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reconData, setReconData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await fetchReconciliationById(id);
                const data = result.data?.data || result.data || result;

                const opEntries = (data.openingEntries || data.opening_entries || []).map(entry => ({
                    code: entry.currency?.code,
                    name: entry.currency?.name,
                    amount: entry.amount || 0
                }));

                const clEntries = (data.closingEntries || data.closing_entries || []).map(entry => ({
                    code: entry.currency?.code,
                    name: entry.currency?.name,
                    amount: entry.amount || 0
                }));

                const openingTotal = opEntries.reduce((sum, r) => sum + r.amount, 0);
                const closingTotal = clEntries.reduce((sum, r) => sum + r.amount, 0);

                setReconData({
                    date: new Date(data.created_at || data.createdAt).toLocaleDateString(),
                    status: data.status,
                    notes: data.notes?.[0]?.note || data.notes?.[0] || "",
                    openingTotal,
                    closingTotal,
                    variance: closingTotal - openingTotal,
                    openingRows: opEntries,
                    closingRows: clEntries,
                    deals: data.deals || []
                });
            } catch (err) {
                console.error("View error:", err);
                setError("Failed to load reconciliation details");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="text-white p-10 text-center">Loading...</div>;
    if (error) return <div className="text-red-500 p-10 text-center">{error}</div>;
    if (!reconData) return null;

    const statusStyle = {
        Tallied: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Excess: "bg-[#302700] text-[#D8AD00] border-[#D8AD00]",
        Short: "bg-[#FF6B6B24] text-[#FF6B6B] border-[#FF6B6B]",
        In_Progress: "bg-[#939AF024] text-[#939AF0] border-[#939AF0]",
    };

    const renderTable = (title, color, rows) => (
        <div className="bg-[#16191C] rounded-xl border border-[#2A2F33]/50 overflow-hidden">
            <div className="p-4 border-b border-[#2A2F33]/50">
                <h2 className="text-[16px] font-medium flex items-center gap-2">
                    <div className={`w-1.5 h-4 ${color} rounded-full`}></div>
                    {title}
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                    <thead>
                        <tr className="bg-[#1B1E21] text-[#8F8F8F] border-b border-[#2A2F33]/50">
                            <th className="px-5 py-4">Currency</th>
                            <th className="px-5 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2F33]/30">
                        {rows.map((row, i) => (
                            <tr key={i} className="hover:bg-[#1E2328]/30 transition-colors">
                                <td className="px-5 py-4">
                                    <div className="font-semibold text-white">{row.code}</div>
                                    <div className="text-[11px] text-[#8F8F8F]">{row.name}</div>
                                </td>
                                <td className="px-5 py-4 text-right text-white tabular-nums font-medium">
                                    {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan="2" className="px-5 py-8 text-center text-[#8F8F8F]">
                                    No entries recorded
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-[20px] lg:text-[24px] font-semibold">Reconciliation - {reconData.date}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-0.5 rounded-full text-[12px] border ${statusStyle[reconData.status] || "border-gray-700 text-gray-400"}`}>
                                {reconData.status}
                            </span>
                        </div>
                    </div>
                </div>
                {reconData.status !== "Tallied" && (
                    <button
                        onClick={() => navigate(`/reconciliation/edit/${id}`)}
                        className="bg-[#1D4CB5] text-white rounded-lg text-sm hover:bg-[#2A5BD7] transition-all flex items-center gap-2"
                    >
                        <img src={edit} className="w-10 h-10" alt="edit" />
                    </button>
                )}
            </div>

            <div className="space-y-6">
                {/* TOP SECTION: SUMMARY + TABLES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* SUMMARY */}
                    <div className="bg-[#16191C] rounded-xl p-5 border border-[#2A2F33]/50 h-fit">
                        <h3 className="text-white text-[15px] font-semibold mb-4 border-b border-[#2A2F33] pb-2">Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-[14px]">
                                <span className="text-[#8F8F8F]">Opening Total:</span>
                                <span className="text-white font-medium">{reconData.openingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-[14px]">
                                <span className="text-[#8F8F8F]">Closing Total:</span>
                                <span className="text-white font-medium">{reconData.closingTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-[16px] pt-4 border-t border-[#2A2F33]">
                                <span className="text-[#8F8F8F]">Net Variance:</span>
                                <div className="flex items-center gap-2">
                                    <img src={reconData.variance >= 0 ? balance : high} className="w-5 h-5" alt="variance" />
                                    <span className={`font-bold text-[18px] lg:text-[20px] ${reconData.variance >= 0 ? "text-[#82E890]" : "text-[#FF6B6B]"}`}>
                                        {reconData.variance >= 0 ? "+" : "-"}{Math.abs(reconData.variance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABLES */}
                    {renderTable("Opening Balance", "bg-[#1D4CB5]", reconData.openingRows)}
                    {renderTable("Closing Balance", "bg-[#82E890]", reconData.closingRows)}
                </div>

                {/* DEALS SECTION */}
                <div className="bg-[#16191C] rounded-xl border border-[#2A2F33]/50 p-4">
                    <h2 className="text-[16px] font-medium mb-4 flex items-center gap-2 text-white">
                        <div className="w-1.5 h-4 bg-[#82E890] rounded-full"></div>
                        Associated Deals
                    </h2>
                    <DealsTable />
                </div>

                {/* NOTES SECTION */}
                <div className="bg-[#16191C] rounded-xl p-5 border border-[#2A2F33]/50 pb-12">
                    <h3 className="text-white text-[15px] font-semibold mb-3">Notes</h3>
                    <div className="bg-[#1A1F24] p-4 rounded-lg border border-[#2A2F33] min-h-[100px] text-[13px] text-[#E3E3E3] leading-relaxed whitespace-pre-wrap">
                        {reconData.notes || "No notes available for this reconciliation."}
                    </div>
                </div>
            </div>
        </div>
    );
}