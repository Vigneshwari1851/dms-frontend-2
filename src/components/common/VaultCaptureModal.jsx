import React, { useState, useEffect } from "react";
import { formatPositiveNumeric } from "../../utils/stringUtils";
import { X, Plus, Trash2, Info } from "lucide-react";
import Dropdown from "./Dropdown";

export default function VaultCaptureModal({
    isOpen,
    onClose,
    onSave,
    currencies = [], // list of all currency objects
    type, // "opening" or "closing"
    initialAmounts = {}, // { currencyId: amount }
    isLocked = false
}) {
    const [rows, setRows] = useState([]);

    // Initialize rows from initialAmounts when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialRows = Object.entries(initialAmounts || {}).map(([cid, amt]) => {
                const currency = currencies.find(c => c.id === Number(cid));
                return {
                    id: Math.random(),
                    currencyId: Number(cid),
                    currencyCode: currency?.code || "",
                    amount: amt || ""
                };
            });

            if (initialRows.length > 0) {
                setRows(initialRows);
            } else {
                // Start with default USD/TZS if available
                const defaultRows = [];
                const usd = currencies.find(c => c.code === "USD");
                const tzs = currencies.find(c => c.code === "TZS");

                if (usd) defaultRows.push({ id: Math.random(), currencyId: usd.id, currencyCode: usd.code, amount: "" });
                if (tzs) defaultRows.push({ id: Math.random() + 1, currencyId: tzs.id, currencyCode: tzs.code, amount: "" });

                if (defaultRows.length === 0) {
                    defaultRows.push({ id: Math.random(), currencyId: null, currencyCode: "", amount: "" });
                }
                setRows(defaultRows);
            }
        }
    }, [initialAmounts, isOpen, currencies]);

    if (!isOpen) return null;

    const currencyOptions = currencies.map(c => ({
        label: c.code,
        value: c.code,
        id: c.id
    }));

    const handleAmountChange = (rowId, value) => {
        setRows(prev => prev.map(row =>
            row.id === rowId ? { ...row, amount: value } : row
        ));
    };

    const handleCurrencyChange = (rowId, option) => {
        setRows(prev => prev.map(row =>
            row.id === rowId ? { ...row, currencyCode: option.value, currencyId: option.id } : row
        ));
    };

    const addRow = () => {
        setRows(prev => [
            ...prev,
            { id: Math.random(), currencyId: null, currencyCode: "", amount: "" }
        ]);
    };

    const removeRow = (rowId) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter(row => row.id !== rowId));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const entries = rows
            .filter(row => row.currencyId && row.amount !== "")
            .map(row => ({
                currency_id: row.currencyId,
                amount: Number(row.amount),
                exchange_rate: 1.0,
                denomination: Number(row.amount),
                quantity: 1
            }));

        if (entries.length === 0) return;
        onSave(entries);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#1A1F24] border border-[#2A2D31] rounded-2xl w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#2A2D31] flex items-center justify-between bg-[#1E2328]">
                    <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-6 rounded-full ${type === "opening" ? "bg-[#1D4CB5]" : "bg-[#82E890]"}`}></div>
                        <div>
                            <h2 className="text-white text-lg font-bold">
                                {type === "opening" ? "Opening Balance" : "Closing Balance"}
                            </h2>
                            <p className="text-[#8F8F8F] text-xs">Capture cash balances in the vault</p>
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
                    <div className="rounded-xl border border-[#2A2D31]/50 bg-[#1A1F24]">
                        <table className="w-full text-left text-[14px]">
                            <thead>
                                <tr className="bg-[#1B1E21] text-[#8F8F8F] border-b border-[#2A2D31]/50">
                                    <th className="px-6 py-3 w-[40%] font-medium">Currency</th>
                                    <th className="px-6 py-3 w-[50%] font-medium">Amount</th>
                                    {!isLocked && <th className="px-6 py-3 w-[10%] text-center font-medium"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2D31]/30">
                                {rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-[#1E2328]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <Dropdown
                                                label="Select Currency"
                                                options={currencyOptions.filter(opt =>
                                                    !rows.some(r => r.id !== row.id && r.currencyCode === opt.value)
                                                )}
                                                selected={row.currencyCode}
                                                onChange={(opt) => handleCurrencyChange(row.id, opt)}
                                                buttonClassName="!bg-[#131619] !border-[#2A2D31] !h-10 !text-sm"
                                                disabled={isLocked}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={row.amount}
                                                    onChange={(e) => handleAmountChange(row.id, formatPositiveNumeric(e.target.value))}
                                                    onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                                    placeholder="0.00"
                                                    disabled={isLocked}
                                                    className="w-full bg-[#131619] border border-[#2A2D31] rounded-lg px-4 py-2 text-white text-right font-mono outline-none focus:border-[#1D4CB5] transition-all disabled:opacity-50 text-sm"
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563] text-[10px] font-mono pointer-events-none uppercase">
                                                    {row.currencyCode}
                                                </div>
                                            </div>
                                        </td>
                                        {!isLocked && (
                                            <td className="px-6 py-4 text-center">
                                                {rows.length > 1 && (
                                                    <button
                                                        onClick={() => removeRow(row.id)}
                                                        className="p-2 text-[#FF6B6B] hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 active:scale-95"
                                                        title="Remove Row"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {!isLocked && (
                        <div className="mt-4 flex justify-start">
                            <button
                                onClick={addRow}
                                className="flex items-center gap-2 text-[#1D4CB5] hover:text-[#2A5BD7] text-xs font-bold transition-all px-3 py-1.5 rounded-lg hover:bg-[#1D4CB5]/5 active:scale-95"
                            >
                                <Plus className="w-3.5 h-3.5" /> ADD CURRENCY
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-[#2A2D31] bg-[#1E2328] flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl border border-[#2A2D31] text-white text-sm font-bold hover:bg-[#2A2D31] transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLocked || !rows.some(r => r.currencyId && r.amount !== "")}
                        className="flex-1 px-4 py-3 rounded-xl bg-[#1D4CB5] text-white text-sm font-bold hover:bg-[#2A5BD7] shadow-lg shadow-[#1D4CB5]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {type === "opening" ? "Save Opening Balance" : "Save Closing Balance"}
                    </button>
                </div>
            </div>
        </div>
    );
}
