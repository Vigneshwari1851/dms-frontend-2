import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import saveIcon from "../../assets/common/save.svg";
import expandRight from "../../assets/common/expandRight.svg";
import edit from "../../assets/Common/edit.svg";
import save from "../../assets/common/save.svg";

// Helper: get numeric value from strings like "$100", "€50", "100"
const parseNumber = (str) => {
    if (str === undefined || str === null) return 0;
    const cleaned = String(str).replace(/[^0-9.-]+/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
};

// Helper: format number to 2 decimals but keep symbol if present (from denom or currency symbol)
const formatWithSymbol = (symbol, value) => {
    const num = Number(value) || 0;
    // keep two decimals
    const formatted = num.toFixed(2);
    return `${symbol}${formatted}`;
};

// Get currency symbol from a row's amount or currency string fallback
const getCurrencySymbolFromAmount = (amountStr, currencyCode) => {
    if (!amountStr && !currencyCode) return "$";
    if (amountStr) {
        const m = String(amountStr).match(/[^0-9.,\s]+/);
        if (m) return m[0];
    }
    // fallback by currency code
    const map = { USD: "$", EUR: "€", GBP: "£" };
    return map[currencyCode] || "$";
};

// VaultRow component - receives handlers to update parent state
function VaultRow({ idx, currency, amount, breakdown, isEditing, onUpdate }) {
    const [open, setOpen] = useState(false);

    // local change handler for breakdown items
    const handleItemChange = (itemIndex, field, value) => {
        const newBreakdown = breakdown.map((it, i) =>
            i === itemIndex ? { ...it, [field]: value } : it
        );

        // If denom or qty changed -> recompute total
        const item = newBreakdown[itemIndex];
        const denomNum = parseNumber(item.denom);
        const qtyNum = Number(item.qty) || 0;
        const currencySymbol = getCurrencySymbolFromAmount(amount, currency);
        item.total = formatWithSymbol(currencySymbol, denomNum * qtyNum);

        newBreakdown[itemIndex] = item;
        // Recompute row total amount (sum of totals numerically)
        const rowSum = newBreakdown.reduce((acc, it) => acc + parseNumber(it.total), 0);
        const updatedRow = {
            currency,
            amount: formatWithSymbol(getCurrencySymbolFromAmount(amount, currency), rowSum),
            breakdown: newBreakdown,
        };
        onUpdate(idx, updatedRow);
    };

    return (
        <div className="border-b border-[#16191C]">
            {/* MAIN ROW */}
            <div
                className="
          flex items-center justify-between 
          text-white text-[14px] py-3 cursor-pointer 
          hover:bg-[#2A3036]
        "
                onClick={() => setOpen(!open)}
            >
                <span>{currency}</span>

                <div className="flex items-center gap-3 min-w-[150px] justify-end">
                    <span>{amount}</span>

                    {/* Rotating Arrow */}
                    <img
                        src={expandRight}
                        className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
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
                                    // total is auto-calculated but allow showing it in input (readonly)
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
    // ---------- base/original data (kept for cancel) ----------
    const original = {
        date: "2025/11/27",
        varianceValue: "+5.00",
        status: "Excess", // Change to "Tallied" to hide edit icon
        notes: "",
        // vault rows
        vaultData: [
            {
                currency: "USD",
                amount: "$6000.00",
                breakdown: [
                    { denom: "$100", qty: 50, total: "$5000.00" },
                    { denom: "$50", qty: 10, total: "$500.00" },
                    { denom: "$20", qty: 10, total: "$200.00" },
                    { denom: "$10", qty: 10, total: "$100.00" },
                    { denom: "$5", qty: 40, total: "$200.00" },
                ],
            },
            {
                currency: "EUR",
                amount: "€2000.00",
                breakdown: [
                    { denom: "€100", qty: 10, total: "€1000.00" },
                    { denom: "€50", qty: 20, total: "€1000.00" },
                ],
            },
            {
                currency: "GBP",
                amount: "£2000.00",
                breakdown: [
                    { denom: "£100", qty: 10, total: "£1000.00" },
                    { denom: "£50", qty: 20, total: "£1000.00" },
                ],
            },
        ],
        // summary values (editable)
        openingVaultTotal: "0.00",
        totalTransactions: "0",
        closingVaultTotal: "0.00",
    };

    // ---------- state: originalData (source of truth) and editable copy ----------
    const [originalData, setOriginalData] = useState(original);
    const [editableData, setEditableData] = useState(original);
    const [isEditing, setIsEditing] = useState(false);

    // compute variance color/icon based on status and sign
    const isPositive = String(editableData.varianceValue).startsWith("+");
    let varianceColor = "";
    let varianceIcon = balance;

    if (editableData.status === "Tallied" || editableData.status === "Balance") {
        varianceColor = "#82E890";
        varianceIcon = balance;
    } else if (editableData.status === "Excess" && isPositive) {
        varianceColor = "#D8AD00";
        varianceIcon = high;
    } else if (editableData.status === "Short" && !isPositive) {
        varianceColor = "#FF6B6B";
        varianceIcon = balance;
    }

    const statusStyle = {
        Tallied: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Balance: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Excess: "bg-[#302700] text-[#D8AD00] border-[#D8AD00]",
        Short: "bg-[#FF6B6B24] text-[#FF6B6B] border-[#FF6B6B]",
    };

    // ---------- handlers ----------
    // open edit mode (make a deep copy)
    const handleEdit = () => {
        // deep-ish copy so nested arrays are copied
        const copy = JSON.parse(JSON.stringify(originalData));
        setEditableData(copy);
        setIsEditing(true);
    };

    // Cancel -> revert
    const handleCancel = () => {
        setEditableData(JSON.parse(JSON.stringify(originalData)));
        setIsEditing(false);
    };

    // Save -> commit to originalData (you can add API call here)
    const handleSave = () => {
        // Optionally validate here
        setOriginalData(JSON.parse(JSON.stringify(editableData)));
        setIsEditing(false);
        // TODO: call API to persist editableData if needed
    };

    // Update a whole vault row (used by VaultRow)
    const updateVaultRow = (rowIndex, updatedRow) => {
        setEditableData((prev) => {
            const newVault = prev.vaultData.map((r, i) => (i === rowIndex ? updatedRow : r));
            return { ...prev, vaultData: newVault };
        });
    };

    // update simple fields like openingVaultTotal, totalTransactions, closingVaultTotal, notes, status or varianceValue
    const handleFieldChange = (field, value) => {
        setEditableData((prev) => ({ ...prev, [field]: value }));
    };

    // For the header icon visibility
    const showEditIcon = editableData.status === "Excess" || editableData.status === "Short";

    // whenever editableData.vaultData changes, we could optionally recalc summary totals (not required by brief)
    useEffect(() => {
        // Example: recalc openingVaultTotal as sum of first vault row totals if you want.
        // left intentionally blank; implement if you want auto summary updates.
    }, [editableData.vaultData]);

    return (
        <>
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[16px] font-medium text-white">
                        Reconciliation - {editableData.date}
                    </h2>
                    <p className="text-gray-400 text-[12px] mb-0">
                        Summary of today’s vault reconciliation
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Cancel/Save shown during edit mode */}
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="w-[95px] h-10 border border-gray-500 rounded-lg text-white"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                                <img src={save} className="w-5 h-5" />
                                Save
                            </button>
                        </>
                    ) : (
                        // show edit icon only for required statuses
                        showEditIcon && (
                            <img
                                src={edit}
                                alt="edit"
                                className="w-8 h-8 cursor-pointer"
                                onClick={handleEdit}
                            />
                        )
                    )}
                </div>
            </div>

            <div className="mt-2" />

            <div className="mt-4 bg-[#16191C] rounded-xl p-4">
                <div className="flex gap-6">
                    {/* LEFT CARD */}
                    <div className="w-[55%] bg-[#1E2328] p-5 rounded-xl border border-[#16191C]">
                        <h3 className="text-white text-[15px] font-medium mb-1">Reconciliation Summary</h3>

                        {/* Rows: Opening Vault Total */}
                        <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                            <p className="text-[#E3E3E3] text-[14px]">Opening Vault Total</p>

                            {isEditing ? (
                                <input
                                    value={editableData.openingVaultTotal}
                                    onChange={(e) => handleFieldChange("openingVaultTotal", e.target.value)}
                                    className="bg-[#16191C] text-white text-[13px] p-1 rounded w-[120px] text-right"
                                />
                            ) : (
                                <p className="text-white text-[13px]">{editableData.openingVaultTotal}</p>
                            )}
                        </div>

                        {/* Total Transactions */}
                        <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                            <p className="text-[#E3E3E3] text-[14px]">Total Transactions</p>
                            {isEditing ? (
                                <input
                                    value={editableData.totalTransactions}
                                    onChange={(e) => handleFieldChange("totalTransactions", e.target.value)}
                                    className="bg-[#16191C] text-white text-[13px] p-1 rounded w-20 text-right"
                                />
                            ) : (
                                <p className="text-white text-[13px]">{editableData.totalTransactions}</p>
                            )}
                        </div>

                        {/* Closing Vault */}
                        <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                            <p className="text-[#E3E3E3] text-[14px]">Closing Vault Total</p>
                            {isEditing ? (
                                <input
                                    value={editableData.closingVaultTotal}
                                    onChange={(e) => handleFieldChange("closingVaultTotal", e.target.value)}
                                    className="bg-[#16191C] text-white text-[13px] p-1 rounded w-[120px] text-right"
                                />
                            ) : (
                                <p className="text-white text-[13px]">{editableData.closingVaultTotal}</p>
                            )}
                        </div>

                        {/* Variance */}
                        <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                            <div className="flex items-center gap-2">
                                <img src={varianceIcon} className="w-5 h-5" />
                                <p className="text-[#E3E3E3] text-[14px]">Difference / Variance</p>
                            </div>

                            {isEditing ? (
                                <input
                                    value={editableData.varianceValue}
                                    onChange={(e) => handleFieldChange("varianceValue", e.target.value)}
                                    className="bg-[#16191C] text-white text-[13px] p-1 rounded w-20 text-right"
                                    style={{ color: varianceColor }}
                                />
                            ) : (
                                <p className="text-[13px]" style={{ color: varianceColor }}>
                                    {editableData.varianceValue}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center py-3 bg-[#16191C] px-2 rounded-lg mt-4 h-8">
                            <p className="text-white font-semibold text-[15px]">Status</p>

                            {isEditing ? (
                                <select
                                    value={editableData.status}
                                    onChange={(e) => handleFieldChange("status", e.target.value)}
                                    className={`w-[90px] h-6 bg-[#16191C] rounded-2xl text-[12px] px-2 ${statusStyle[editableData.status]}`}
                                >
                                    <option value="Tallied">Tallied</option>
                                    <option value="Excess">Excess</option>
                                    <option value="Short">Short</option>
                                    <option value="Balance">Balance</option>
                                </select>
                            ) : (
                                <span
                                    className={`w-[70px] h-6 inline-flex items-center justify-center border rounded-2xl text-[12px] ${statusStyle[editableData.status]}`}
                                >
                                    {editableData.status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE NOTES */}
                    <div className="w-[470px] h-[296px] flex flex-col justify-between">
                        <div className="bg-[#1E2328] border border-[#1F2429] rounded-xl p-5">
                            <p className="text-white text-[16px] font-medium mb-2">Notes</p>

                            <textarea
                                value={editableData.notes}
                                onChange={(e) => handleFieldChange("notes", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Add reconciliation notes..."
                                className="
                                    w-[438px] h-[220px]
                                    bg-[#16191C] text-white text-[14px]
                                    p-2 rounded-sm
                                    outline-none resize-none
                                    placeholder:text-[#4D5567]
                                    disabled:opacity-60"
                            />
                        </div>
                    </div>
                </div>

                {/* Vault Balances */}
                <div className="flex gap-6 mt-5">
                    {/* Opening Vault */}
                    <div className="w-[50%] bg-[#1E2328] p-5 rounded-xl border border-[#16191C]">
                        <h3 className="text-white text-[15px] font-medium mb-4">Opening Vault Balance</h3>

                        <div className="flex justify-between text-[#939AF0] text-[14px] font-medium border-b border-[#16191C] pb-2 mb-2">
                            <span>Currency</span>
                            <span>Total Amount</span>
                        </div>

                        {editableData.vaultData.map((row, index) => (
                            <VaultRow
                                key={index}
                                idx={index}
                                currency={row.currency}
                                amount={row.amount}
                                breakdown={row.breakdown}
                                isEditing={isEditing}
                                onUpdate={updateVaultRow}
                            />
                        ))}
                    </div>

                    {/* Closing Vault (we reuse same data to demo) */}
                    <div className="w-[50%] bg-[#1E2328] p-5 rounded-xl border border-[#16191C]">
                        <h3 className="text-white text-[15px] font-medium mb-4">Closing Vault Balance</h3>

                        <div className="flex justify-between text-[#939AF0] text-[14px] font-medium border-b border-[#16191C] pb-2 mb-2">
                            <span>Currency</span>
                            <span>Total Amount</span>
                        </div>

                        {editableData.vaultData.map((row, index) => (
                            <VaultRow
                                key={`close-${index}`}
                                idx={index}
                                currency={row.currency}
                                amount={row.amount}
                                breakdown={row.breakdown}
                                isEditing={isEditing}
                                onUpdate={updateVaultRow}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
