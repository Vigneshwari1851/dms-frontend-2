import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";

import expandRight from "../../assets/Common/expandRight.svg";
import edit from "../../assets/Common/edit.svg";

import { useNavigate, useParams } from "react-router-dom";
import DealsTable from "../../components/dashboard/DealsTable";
import { fetchReconciliationById } from "../../api/reconcoliation";

// Helper: get numeric value from strings like "$100", "€50", "100"
const parseNumber = (str) => {
    if (str === undefined || str === null) return 0;
    const cleaned = String(str).replace(/[^0-9.-]+/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
};

// Helper: format number to 2 decimals but keep symbol if present
const formatWithSymbol = (symbol, value) => {
    const num = Number(value) || 0;
    const formatted = num.toFixed(2);
    return `${symbol}${formatted}`;
};

// Get currency symbol from currency code
const getCurrencySymbol = (currencyCode) => {
    const map = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        KES: "KSh",
        KSH: "KSh",
        INR: "₹"
    };
    return map[currencyCode?.toUpperCase()] || "$";
};

// Convert API entries to vault data format
const convertEntriesToVaultData = (entries, type = "opening") => {
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
        console.log(`No ${type} entries found`);
        return [];
    }

    console.log(`Converting ${type} entries:`, entries);

    // Group entries by currency
    const groupedByCurrency = {};

    entries.forEach(entry => {
        const currencyId = entry.currency_id || entry.currencyId || 1;
        const currencyCode = entry.currency?.code || entry.currency_code || "USD";
        const currencyName = entry.currency?.name || entry.currency_name || currencyCode;
        const currencySymbol = getCurrencySymbol(currencyCode);

        if (!groupedByCurrency[currencyId]) {
            groupedByCurrency[currencyId] = {
                currencyId: currencyId,
                currency: currencyName,
                currencyCode: currencyCode,
                currencySymbol: currencySymbol,
                entries: [],
                totalAmount: 0
            };
        }

        const denom = entry.denomination || 0;
        const qty = entry.quantity || 0;
        const amount = entry.amount || (denom * qty);

        groupedByCurrency[currencyId].entries.push({
            id: entry.id,
            denom: `${currencySymbol}${denom}`,
            qty: qty,
            total: `${currencySymbol}${amount.toFixed(2)}`
        });

        groupedByCurrency[currencyId].totalAmount += amount;
    });

    // Convert to vault data format
    const result = Object.values(groupedByCurrency).map(currencyGroup => ({
        currencyId: currencyGroup.currencyId,
        currency: currencyGroup.currency,
        amount: `${currencyGroup.currencySymbol}${currencyGroup.totalAmount.toFixed(2)}`,
        breakdown: currencyGroup.entries
    }));

    console.log(`Converted ${type} data:`, result);
    return result;
};

// Calculate total from vault data
const calculateVaultTotal = (vaultData) => {
    if (!vaultData || !Array.isArray(vaultData) || vaultData.length === 0) {
        return "$0.00";
    }

    let total = 0;
    vaultData.forEach(currency => {
        const amountStr = currency.amount || "";
        const numericValue = parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
        total += numericValue;
    });

    const symbol = vaultData[0]?.amount?.match(/[^0-9.,\s]+/)?.[0] || "$";
    return `${symbol}${total.toFixed(2)}`;
};

// Calculate numeric total from vault data
const calculateVaultNumericTotal = (vaultData) => {
    if (!vaultData || !Array.isArray(vaultData)) return 0;

    let total = 0;
    vaultData.forEach(currency => {
        const amountStr = currency.amount || "";
        const numericValue = parseFloat(amountStr.replace(/[^0-9.-]+/g, "")) || 0;
        total += numericValue;
    });

    return total;
};

// Calculate variance between opening and closing
const calculateVariance = (openingData, closingData) => {
    const openingNum = calculateVaultNumericTotal(openingData);
    const closingNum = calculateVaultNumericTotal(closingData);

    const difference = closingNum - openingNum;

    const symbol = closingData[0]?.amount?.match(/[^0-9.,\s]+/)?.[0] ||
        openingData[0]?.amount?.match(/[^0-9.,\s]+/)?.[0] ||
        "$";

    if (difference >= 0) {
        return `+${symbol}${Math.abs(difference).toFixed(2)}`;
    } else {
        return `-${symbol}${Math.abs(difference).toFixed(2)}`;
    }
};

// Auto-calculate status based on variance
const calculateStatusFromVariance = (openingData, closingData) => {
    const openingNum = calculateVaultNumericTotal(openingData);
    const closingNum = calculateVaultNumericTotal(closingData);
    const variance = closingNum - openingNum;

    if (Math.abs(variance) < 0.01) {
        return "Tallied";
    } else if (variance > 0) {
        return "Excess";
    } else {
        return "Short";
    }
};

// VaultRow component - receives handlers to update parent state
function VaultRow({ idx, currency, currencyId, amount, breakdown, isEditing, onUpdate }) {
    const [open, setOpen] = useState(false);

    // Extract currency symbol from amount
    const getSymbolFromAmount = (amountStr) => {
        if (!amountStr) return "$";
        const m = String(amountStr).match(/[^0-9.,\s]+/);
        return m ? m[0] : "$";
    };

    // local change handler for breakdown items
    const handleItemChange = (itemIndex, field, value) => {
        const newBreakdown = breakdown.map((it, i) =>
            i === itemIndex ? { ...it, [field]: value } : it
        );

        // If denom or qty changed -> recompute total
        const item = newBreakdown[itemIndex];
        if (field === "denom" || field === "qty") {
            const currencySymbol = getSymbolFromAmount(amount);
            const denomNum = parseNumber(item.denom);
            const qtyNum = Number(item.qty) || 0;
            item.total = formatWithSymbol(currencySymbol, denomNum * qtyNum);
        }

        newBreakdown[itemIndex] = item;

        // Recompute row total amount (sum of totals numerically)
        const rowSum = newBreakdown.reduce((acc, it) => acc + parseNumber(it.total), 0);
        const updatedRow = {
            currency,
            currencyId,
            amount: formatWithSymbol(getSymbolFromAmount(amount), rowSum),
            breakdown: newBreakdown,
        };
        onUpdate(idx, updatedRow);
    };

    return (
        <div className="border-b border-[#16191C]">
            {/* MAIN ROW */}
            <div
                className="flex items-center justify-between text-white text-[14px] py-3 cursor-pointer hover:bg-[#2A3036]"
                onClick={() => setOpen(!open)}
            >
                <span>{currency}</span>

                <div className="flex items-center gap-3 min-w-[150px] justify-end">
                    <span>{amount}</span>

                    {/* Rotating Arrow */}
                    <img
                        src={expandRight}
                        className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
                        alt="expand"
                    />
                </div>
            </div>

            {/* EXPANDED SECTION */}
            {open && (
                <div className="bg-[#16191C] rounded-lg p-4 mt-1 mb-3">
                    {/* Header */}
                    <div className="flex justify-between text-[#9CA3AF] text-[13px] pb-2 border-b border-[#262B31]">
                        <span>Denomination</span>
                        <span>Quantity</span>
                        <span>Total</span>
                    </div>

                    {/* Breakdown */}
                    {breakdown.map((item, i) => (
                        <div key={i} className="flex justify-between text-white text-[14px] py-2 items-center gap-2">
                            {/* Denomination */}
                            <div className="w-[40%]">
                                {isEditing ? (
                                    <input
                                        value={item.denom}
                                        onChange={(e) => handleItemChange(i, "denom", e.target.value)}
                                        className="w-full bg-[#16191C] text-white p-1 rounded text-[14px]"
                                    />
                                ) : (
                                    <span>{item.denom}</span>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="w-[20%] text-center">
                                {isEditing ? (
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(i, "qty", e.target.value)}
                                        className="w-full bg-[#16191C] text-white p-1 rounded text-[14px] text-center"
                                    />
                                ) : (
                                    <span>{item.qty}</span>
                                )}
                            </div>

                            {/* Total */}
                            <div className="w-[30%] text-right">
                                {isEditing ? (
                                    <input
                                        value={item.total}
                                        readOnly
                                        className="w-full bg-[#16191C] text-white p-1 rounded text-[14px] text-right opacity-80"
                                    />
                                ) : (
                                    <span>{item.total}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div className="flex justify-between text-[14px] font-semibold text-[#10B935] pt-2 border-t border-[#262B31]">
                        <span>Total</span>
                        <span></span>
                        <span>{amount}</span>
                    </div>
                </div>
            )}
        </div>
    );
}




export default function ViewReconciliation() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);
    const [editableData, setEditableData] = useState(null);
    const [activeSection, setActiveSection] = useState("Summary");

    const toggleSection = (sectionName) => {
        if (window.innerWidth < 1024) {
            setActiveSection(activeSection === sectionName ? null : sectionName);
        }
    };

    // Fetch reconciliation data by ID
    useEffect(() => {
        const fetchReconciliationData = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await fetchReconciliationById(id);

                if (!result) {
                    throw new Error("No response from server");
                }

                if (!result.success && !result.data) {
                    throw new Error(result.error?.message || result.error || "Failed to fetch reconciliation");
                }

                // Handle different API response structures
                const data = result.data?.data || result.data || result;

                if (!data) {
                    throw new Error("No reconciliation data found");
                }

                // Format date
                const formatDate = (dateString) => {
                    if (!dateString) return "N/A";
                    try {
                        const date = new Date(dateString);
                        if (isNaN(date.getTime())) return dateString;
                        return date.toISOString().split('T')[0].replace(/-/g, '/');
                    } catch {
                        return dateString;
                    }
                };

                // Extract data from API response
                const openingEntries = data.openingEntries || data.opening_entries || [];
                const closingEntries = data.closingEntries || data.closing_entries || [];
                const deals = data.deals || [];
                const notes = data.notes || [];
                const status = data.status || "Tallied";
                const createdBy = data.createdBy || data.created_by || data.user || null;
                const createdAt = data.created_at || data.createdAt || data.date;

                // Convert API data to vault format
                const openingVaultData = convertEntriesToVaultData(openingEntries, "opening");
                const closingVaultData = convertEntriesToVaultData(closingEntries, "closing");

                // Calculate values
                const openingTotal = calculateVaultTotal(openingVaultData);
                const closingTotal = calculateVaultTotal(closingVaultData);
                const varianceValue = calculateVariance(openingVaultData, closingVaultData);
                // Determine Auto Status
                let autoStatus = calculateStatusFromVariance(openingVaultData, closingVaultData);

                // Combine notes
                let notesText = "";
                if (notes && Array.isArray(notes)) {
                    notesText = notes
                        .map(note => typeof note === 'object' ? note.note || note.text || note.content : note)
                        .filter(note => note && note.trim() !== '')
                        .join("\n");
                } else if (typeof notes === 'string') {
                    notesText = notes;
                }

                const finalStatus = status || autoStatus;

                const formattedData = {
                    id: data.id || id,
                    date: formatDate(createdAt),
                    varianceValue: varianceValue,
                    status: finalStatus,
                    notes: notesText,
                    openingVaultTotal: openingTotal,
                    totalTransactions: deals.length || 0,
                    closingVaultTotal: closingTotal,
                    openingVaultData: openingVaultData,
                    closingVaultData: closingVaultData,
                    deals: deals,
                    createdBy: createdBy,
                    rawData: data
                };

                setEditableData(formattedData);
            } catch (err) {
                console.error('Error in fetchReconciliationData:', err);
                setError(err.message || "An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchReconciliationData();
        } else {
            setError("No reconciliation ID provided");
            setLoading(false);
        }
    }, [id]);




    // compute variance color/icon based on status and sign
    let varianceColor = "";
    let varianceIcon = balance;

    if (editableData) {
        if (editableData.status === "Tallied" || editableData.status === "Balance") {
            varianceColor = "#82E890";
            varianceIcon = balance;
        } else if (editableData.status === "Excess") {
            varianceColor = "#D8AD00";
            varianceIcon = high;
        } else if (editableData.status === "Short") {
            varianceColor = "#FF6B6B";
            varianceIcon = balance;
        } else {
            varianceColor = "#82E890";
            varianceIcon = balance;
        }
    }

    const statusStyle = {
        Tallied: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Balance: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Excess: "bg-[#302700] text-[#D8AD00] border-[#D8AD00]",
        Short: "bg-[#FF6B6B24] text-[#FF6B6B] border-[#FF6B6B]",
        Pending: "bg-[#374151] text-[#9CA3AF] border-[#6B7280]",
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-white">Loading reconciliation data...</div>
            </div>
        );
    }

    // Error state with more details
    if (error && !editableData) {
        return (
            <div className="p-4">
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <h3 className="text-red-400 font-medium mb-2">Error Loading Reconciliation</h3>
                    <p className="text-red-300 text-sm mb-3">{error}</p>
                    <p className="text-gray-400 text-xs mb-4">
                        Reconciliation ID: {id}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/reconciliation")}
                            className="px-4 py-2 bg-[#1D4CB5] text-white rounded-md text-sm"
                        >
                            Back to List
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!editableData) {
        return (
            <div className="p-4">
                <div className="text-white">No reconciliation data found</div>
                <button
                    onClick={() => navigate("/reconciliation")}
                    className="mt-2 px-4 py-2 bg-[#1D4CB5] text-white rounded-md text-sm"
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <>
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* BACK ARROW */}
                    <div
                        className="cursor-pointer select-none text-white text-2xl"
                        onClick={() => navigate("/reconciliation")}
                    >
                        &lt;
                    </div>

                    {/* TITLE + SUBTITLE */}
                    <div className="flex flex-col leading-tight">
                        <h2 className="text-[16px] font-medium text-white">
                            Reconciliation - {editableData.date}
                        </h2>

                        <p className="text-gray-400 text-[12px] mt-1">
                            Summary of vault reconciliation
                        </p>

                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* EDIT ICON - Only show if not Tallied/Balance */}
                    {editableData && (editableData.status !== "Tallied" && editableData.status !== "Balance") && (
                        <img
                            src={edit}
                            alt="edit"
                            className="w-10 h-10 cursor-pointer"
                            onClick={() => navigate(`/reconciliation/edit/${id}`)}
                        />
                    )}
                </div>
            </div>

            <div className="mt-2" />

            <div className="mt-4 lg:bg-[#16191C] lg:rounded-xl lg:p-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="mt-2 text-red-300 text-sm hover:text-red-100"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ACCORDION / GRID CONTAINER */}
                <div className="flex flex-col lg:flex-row lg:gap-6">
                    {/* SUMMARY SECTION */}
                    <div className="w-full lg:w-[65%] mb-4 lg:mb-0">
                        {/* Mobile Header */}
                        <div
                            className="lg:hidden flex justify-between items-center bg-[#1E2328] p-4 rounded-xl border border-[#16191C] cursor-pointer"
                            onClick={() => toggleSection("Summary")}
                        >
                            <h3 className="text-white text-[15px] font-medium">Reconciliation Summary</h3>
                            <img
                                src={expandRight}
                                className={`w-3 h-3 transition-transform duration-200 ${activeSection === "Summary" ? "rotate-90" : ""}`}
                                alt="expand"
                            />
                        </div>

                        {/* Content */}
                        <div className={`${activeSection === "Summary" ? "block" : "hidden"} lg:block mt-2 lg:mt-0 bg-[#1E2328] p-5 rounded-xl border border-[#16191C]`}>
                            <h3 className="hidden lg:block text-white text-[15px] font-medium mb-1">Reconciliation Summary</h3>

                            {/* Rows: Opening Vault Total - READ ONLY */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Opening Vault Total</p>
                                <p className="text-white text-[13px]">
                                    {calculateVaultTotal(editableData.openingVaultData)}
                                </p>
                            </div>

                            {/* Total Transactions - READ ONLY */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Total Transactions</p>
                                <p className="text-white text-[13px]">
                                    {editableData.totalTransactions}
                                </p>
                            </div>

                            {/* Closing Vault - READ ONLY */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Closing Vault Total</p>
                                <p className="text-white text-[13px]">
                                    {calculateVaultTotal(editableData.closingVaultData)}
                                </p>
                            </div>

                            {/* Variance - READ ONLY */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <div className="flex items-center gap-2">
                                    <img src={varianceIcon} className="w-5 h-5" alt="variance" />
                                    <p className="text-[#E3E3E3] text-[14px]">Difference / Variance</p>
                                </div>

                                <p className="text-[13px]" style={{ color: varianceColor }}>
                                    {editableData.varianceValue}
                                </p>
                            </div>

                            {/* Status - Editable */}
                            <div className="flex justify-between items-center py-3 bg-[#16191C] px-2 rounded-lg mt-4 h-8">
                                <p className="text-white font-semibold text-[15px]">Status</p>

                                <span
                                    className={`w-[90px] h-6 inline-flex items-center justify-center rounded-2xl text-[12px] ${statusStyle[editableData.status] || statusStyle.Tallied}`}
                                >
                                    {editableData.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* NOTES SECTION */}
                    <div className="w-full lg:w-[460px] mb-4 lg:mb-0">
                        {/* Mobile Header */}
                        <div
                            className="lg:hidden flex justify-between items-center bg-[#1E2328] p-4 rounded-xl border border-[#16191C] cursor-pointer"
                            onClick={() => toggleSection("Notes")}
                        >
                            <h3 className="text-white text-[15px] font-medium">Notes</h3>
                            <img
                                src={expandRight}
                                className={`w-3 h-3 transition-transform duration-200 ${activeSection === "Notes" ? "rotate-90" : ""}`}
                                alt="expand"
                            />
                        </div>

                        {/* Content */}
                        <div className={`${activeSection === "Notes" ? "block" : "hidden"} lg:block mt-2 lg:mt-0 bg-[#1E2328] rounded-xl p-5 lg:h-[296px]`}>
                            <p className="hidden lg:block text-white text-[16px] font-medium mb-2">Notes</p>
                            <textarea
                                value={editableData.notes}
                                disabled={true}
                                placeholder="Add reconciliation notes..."
                                className="w-full lg:w-[408px] h-[150px] lg:h-[220px] bg-[#16191C] text-white text-[14px] p-2 rounded-sm outline-none resize-none placeholder:text-[#4D5567] disabled:opacity-60 focus:border-blue-500 scrollbar-grey"
                            />
                        </div>
                    </div>
                </div>

                {/* Vault Balances */}
                <div className="flex flex-col lg:flex-row lg:gap-6 mt-0 lg:mt-5">
                    {/* Opening Vault */}
                    <div className="w-full lg:w-[50%] mb-4 lg:mb-0">
                        {/* Mobile Header */}
                        <div
                            className="lg:hidden flex justify-between items-center bg-[#1E2328] p-4 rounded-xl border border-[#16191C] cursor-pointer"
                            onClick={() => toggleSection("Opening")}
                        >
                            <h3 className="text-white text-[15px] font-medium">Opening Vault Balance</h3>
                            <img
                                src={expandRight}
                                className={`w-3 h-3 transition-transform duration-200 ${activeSection === "Opening" ? "rotate-90" : ""}`}
                                alt="expand"
                            />
                        </div>

                        {/* Content */}
                        <div className={`${activeSection === "Opening" ? "block" : "hidden"} lg:block mt-2 lg:mt-0 bg-[#1E2328] p-5 rounded-xl border border-[#16191C]`}>
                            <h3 className="hidden lg:block text-white text-[15px] font-medium mb-4">Opening Vault Balance</h3>

                            <div className="flex justify-between text-[#939AF0] text-[14px] font-medium border-b border-[#16191C] pb-2 mb-2">
                                <span>Currency</span>
                                <span>Total Amount</span>
                            </div>

                            {editableData.openingVaultData && editableData.openingVaultData.length > 0 ? (
                                editableData.openingVaultData.map((row, index) => (
                                    <VaultRow
                                        key={`opening-${index}`}
                                        idx={index}
                                        currency={row.currency}
                                        currencyId={row.currencyId}
                                        amount={row.amount}
                                        breakdown={row.breakdown}
                                    />
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-4">
                                    No opening vault data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Closing Vault */}
                    <div className="w-full lg:w-[50%] mb-4 lg:mb-0">
                        {/* Mobile Header */}
                        <div
                            className="lg:hidden flex justify-between items-center bg-[#1E2328] p-4 rounded-xl border border-[#16191C] cursor-pointer"
                            onClick={() => toggleSection("Closing")}
                        >
                            <h3 className="text-white text-[15px] font-medium">Closing Vault Balance</h3>
                            <img
                                src={expandRight}
                                className={`w-3 h-3 transition-transform duration-200 ${activeSection === "Closing" ? "rotate-90" : ""}`}
                                alt="expand"
                            />
                        </div>

                        {/* Content */}
                        <div className={`${activeSection === "Closing" ? "block" : "hidden"} lg:block mt-2 lg:mt-0 bg-[#1E2328] p-5 rounded-xl border border-[#16191C]`}>
                            <h3 className="hidden lg:block text-white text-[15px] font-medium mb-4">Closing Vault Balance</h3>

                            <div className="flex justify-between text-[#939AF0] text-[14px] font-medium border-b border-[#16191C] pb-2 mb-2">
                                <span>Currency</span>
                                <span>Total Amount</span>
                            </div>

                            {editableData.closingVaultData && editableData.closingVaultData.length > 0 ? (
                                editableData.closingVaultData.map((row, index) => (
                                    <VaultRow
                                        key={`close-${index}`}
                                        idx={index}
                                        currency={row.currency}
                                        currencyId={row.currencyId}
                                        amount={row.amount}
                                        breakdown={row.breakdown}
                                    />
                                ))
                            ) : (
                                <div className="text-gray-400 text-center py-4">
                                    No closing vault data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Deals Table - Show if deals exist */}
            <div className="mt-6">
                <div
                    className="lg:hidden flex justify-between items-center bg-[#1E2328] p-4 rounded-xl border border-[#16191C] cursor-pointer"
                    onClick={() => toggleSection("Deals")}
                >
                    <h3 className="text-white text-[15px] font-medium">Associated Deals</h3>
                    <img
                        src={expandRight}
                        className={`w-3 h-3 transition-transform duration-200 ${activeSection === "Deals" ? "rotate-90" : ""}`}
                        alt="expand"
                    />
                </div>

                <div className={`${activeSection === "Deals" ? "block" : "hidden"} lg:block mt-4 lg:mt-0`}>
                    <h3 className="hidden lg:block text-white text-lg font-medium mb-4">Associated Deals</h3>
                    <DealsTable />
                </div>
            </div>

        </>
    );
}