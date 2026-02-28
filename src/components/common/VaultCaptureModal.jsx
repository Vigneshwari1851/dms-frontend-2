import React, { useState, useEffect } from "react";
import { formatPositiveNumeric } from "../../utils/stringUtils";
import { X, Plus, Trash2, Edit2, Vault } from "lucide-react";
import Dropdown from "./Dropdown";

export default function VaultCaptureModal({
    isOpen,
    onClose,
    onSave,
    currencies = [], // list of all currency objects
    type, // "opening", "closing" or "both"
    initialAmounts = {}, // { currencyId: amount } or { opening: {}, closing: {} } if type is "both"
    isLocked = false,
    isViewOnly = false,
    isDealsMapped = false
}) {
    const [rows, setRows] = useState([]);
    const [closingRows, setClosingRows] = useState([]);
    const [editingType, setEditingType] = useState(null); // "opening" or "closing" or null

    const getDefaultRows = () => {
        const defaultRows = [];
        const usd = currencies.find(c => c.code === "USD");
        const tzs = currencies.find(c => c.code === "TZS");
        if (usd) defaultRows.push({ id: Math.random(), currencyId: usd.id, currencyCode: usd.code, amount: "" });
        if (tzs) defaultRows.push({ id: Math.random() + 1, currencyId: tzs.id, currencyCode: tzs.code, amount: "" });
        if (defaultRows.length === 0) defaultRows.push({ id: Math.random(), currencyId: null, currencyCode: "", amount: "" });
        return defaultRows;
    };

    // Initialize rows from initialAmounts when modal opens or initialAmounts change
    useEffect(() => {
        if (isOpen) {
            if (type === "both") {
                const openData = initialAmounts.opening || {};
                const closeData = initialAmounts.closing || {};

                const oRows = currencies
                    .filter(c => openData[c.id] !== undefined)
                    .map(c => ({ id: Math.random(), currencyId: c.id, currencyCode: c.code, amount: openData[c.id]?.toString() || "" }));

                const cRows = currencies
                    .filter(c => closeData[c.id] !== undefined)
                    .map(c => ({ id: Math.random(), currencyId: c.id, currencyCode: c.code, amount: closeData[c.id]?.toString() || "" }));

                setRows(oRows.length > 0 ? oRows : getDefaultRows());
                setClosingRows(cRows.length > 0 ? cRows : getDefaultRows());
            } else {
                const initialRows = Object.entries(initialAmounts || {}).map(([cid, amt]) => {
                    const currency = currencies.find(c => c.id === Number(cid));
                    return {
                        id: Math.random(),
                        currencyId: Number(cid),
                        currencyCode: currency?.code || "",
                        amount: amt?.toString() || ""
                    };
                });

                if (initialRows.length > 0) {
                    setRows(initialRows);
                } else {
                    setRows(getDefaultRows());
                }
            }
        }
    }, [initialAmounts, isOpen, currencies, type]);

    if (!isOpen) return null;

    const currencyOptions = currencies.map(c => ({
        label: c.code,
        value: c.code,
        id: c.id
    }));

    const handleAmountChange = (rowId, value, targetType) => {
        const setter = targetType === "closing" ? setClosingRows : setRows;
        setter(prev => prev.map(row =>
            row.id === rowId ? { ...row, amount: value } : row
        ));
    };

    const handleCurrencyChange = (rowId, option, targetType) => {
        const setter = targetType === "closing" ? setClosingRows : setRows;
        setter(prev => prev.map(row =>
            row.id === rowId ? { ...row, currencyCode: option.value, currencyId: option.id } : row
        ));
    };

    const addRow = (targetType) => {
        const setter = targetType === "closing" ? setClosingRows : setRows;
        setter(prev => [
            ...prev,
            { id: Math.random(), currencyId: null, currencyCode: "", amount: "" }
        ]);
    };

    const removeRow = (rowId, targetType) => {
        const setter = targetType === "closing" ? setClosingRows : setRows;
        setter(prev => prev.length > 1 ? prev.filter(row => row.id !== rowId) : prev);
    };

    const handleInternalSave = (targetType) => {
        const targetRows = targetType === "closing" ? closingRows : rows;
        const entries = targetRows
            .filter(row => row.currencyId && row.amount !== "")
            .map(row => ({
                currency_id: row.currencyId,
                amount: Number(row.amount),
                exchange_rate: 1.0,
                denomination: Number(row.amount),
                quantity: 1
            }));

        if (entries.length === 0) return;
        onSave(entries, targetType);
        setEditingType(null);
    };

    const renderTable = (tableRows, title, tableType) => {
        const isCurrentlyEditing = editingType === tableType || (type !== "both" && !isViewOnly && !isLocked);
        const canEdit = type === "both" && !isLocked && !(tableType === "opening" && isDealsMapped);

        return (
            <div className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-3 px-1">
                    {title && <h3 className="text-[#8F8F8F] text-xs">{title}</h3>}
                    {canEdit && !isCurrentlyEditing && (
                        <button
                            onClick={() => setEditingType(tableType)}
                            className="text-[#1D4CB5] hover:text-[#2A5BD7] text-[10px] font-medium transition-all px-2 py-1 rounded hover:bg-[#1D4CB5]/5 flex items-center gap-1.5"
                        >
                            <Edit2 className="w-3 h-3" /> Edit
                        </button>
                    )}
                    {isCurrentlyEditing && type === "both" && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setEditingType(null)}
                                className="text-gray-400 hover:text-white text-[10px] px-2 py-1 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleInternalSave(tableType)}
                                className="bg-[#1D4CB5] hover:bg-[#2A5BD7] text-white text-[10px] px-3 py-1 rounded transition-all active:scale-95"
                            >
                                Save
                            </button>
                        </div>
                    )}
                </div>
                <div className={`rounded-xl border transition-all duration-300 ${isCurrentlyEditing ? "border-[#1D4CB5]/50 bg-[#1A1F24]/80 shadow-[0_0_20px_rgba(29,76,181,0.1)]" : "border-[#2A2D31]/50 bg-[#1A1F24]"}`}>
                    <table className="w-full text-left text-[13px]">
                        <thead>
                            <tr className="bg-[#1B1E21] text-[#8F8F8F] border-b border-[#2A2D31]/50">
                                <th className="px-6 py-3 w-[40%] font-normal">Currency</th>
                                <th className="px-6 py-3 w-[50%] font-normal text-right">Amount</th>
                                {isCurrentlyEditing && <th className="px-6 py-3 w-[10%] text-center font-normal"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2D31]/30">
                            {tableRows && tableRows.length > 0 ? tableRows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#1E2328]/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <Dropdown
                                            label="Select Currency"
                                            options={currencyOptions.filter(opt =>
                                                !tableRows.some(r => r.id !== row.id && r.currencyCode === opt.value)
                                            )}
                                            selected={row.currencyCode}
                                            onChange={(opt) => handleCurrencyChange(row.id, opt, tableType)}
                                            buttonClassName={`!bg-[#131619] !border-[#2A2D31] !h-9 !text-xs ${!isCurrentlyEditing ? "!opacity-80 !cursor-default" : ""}`}
                                            disabled={!isCurrentlyEditing}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={row.amount}
                                                onChange={(e) => handleAmountChange(row.id, formatPositiveNumeric(e.target.value), tableType)}
                                                onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                                placeholder="0.00"
                                                disabled={!isCurrentlyEditing}
                                                className="w-full bg-[#131619] border border-[#2A2D31] rounded-lg px-4 py-2 text-white text-right outline-none focus:border-[#1D4CB5] transition-all disabled:opacity-80 text-xs"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563] text-[9px] pointer-events-none">
                                                {row.currencyCode}
                                            </div>
                                        </div>
                                    </td>
                                    {isCurrentlyEditing && (
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeRow(row.id, tableType)}
                                                className="p-2 text-[#FF6B6B] hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                                                title="Remove Row"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={isCurrentlyEditing ? 3 : 2} className="px-6 py-8 text-center text-gray-500 italic text-xs">No entries found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {isCurrentlyEditing && (
                    <div className="mt-3 flex justify-start">
                        <button
                            onClick={() => addRow(tableType)}
                            className="flex items-center gap-1.5 text-[#1D4CB5] hover:text-[#2A5BD7] text-[11px] transition-all px-2 py-1 rounded hover:bg-[#1D4CB5]/5 active:scale-95"
                        >
                            <Plus className="w-3 h-3" /> Add Currency
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className={`bg-[#1A1F24] border border-[#2A2D31] w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] transition-all duration-300 ${type === "both" ? "max-w-5xl" : "max-w-2xl"}`}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#2A2D31] flex items-center justify-between bg-[#1E2328]">
                    <div className="flex items-center gap-3">
                        <div className={`w-1 h-5 rounded-full ${type === "opening" ? "bg-[#1D4CB5]" : "bg-[#82E890]"}`}></div>
                        <div>
                            <h2 className="text-white text-base">
                                {type === "both" ? "Vault Summary" : `${isViewOnly ? "View" : editingType ? "Edit" : "Record"} ${type === "opening" ? "Opening Balance" : "Closing Balance"}`}
                            </h2>
                            <p className="text-[#8F8F8F] text-[11px]">Review and update vault cash positions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-[#8F8F8F] hover:text-white hover:bg-[#2A2D31] rounded-full transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-grey bg-[#16191C]">
                    {type === "both" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {renderTable(rows, "Opening Balances", "opening")}
                            {renderTable(closingRows, "Closing Balances", "closing")}
                        </div>
                    ) : (
                        renderTable(rows, null, type)
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-[#2A2D31] bg-[#1E2328] flex gap-4">
                    {type === "both" ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-[#1D4CB5] border border-[#1D4CB5] hover:bg-[#2A5BD7] text-white text-sm px-6 py-2.5 rounded-lg shadow-lg shadow-[#1D4CB5]/10 transition-all active:scale-[0.98]"
                        >
                            Close Summary
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-[#2A2D31] text-white text-sm hover:bg-[#2A2D31] transition-all active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            {!isViewOnly && (
                                <button
                                    onClick={() => handleInternalSave(type)}
                                    disabled={!rows.some(r => r.currencyId && r.amount !== "")}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#1D4CB5] text-white text-sm hover:bg-[#2A5BD7] shadow-lg shadow-[#1D4CB5]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save {type === "opening" ? "Opening" : "Closing"} Balance
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
