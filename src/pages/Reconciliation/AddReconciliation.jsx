import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import save from "../../assets/common/save.svg";
import OpeningVaultBalance from "../../components/Reconciliation/OpeningVaultBalance";
import CurrencyForm from "../../components/common/CurrencyForm";
import { createCurrency } from "../../api/currency/currency";
import { createReconciliation } from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import bgIcon from "../../assets/report/bgimage.svg";

export default function AddReconciliation() {
    const [activeTab, setActiveTab] = useState("summary");
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [notes, setNotes] = useState("");
    const [skipClosing, setSkipClosing] = useState(false);

    const [currencyData, setCurrencyData] = useState({
        currencyName: "",
        isoCode: "",
        symbol: "",
    });

    // Fixed state structure for both opening and closing
    const [openingData, setOpeningData] = useState({
        sections: [] // Will be initialized by OpeningVaultBalance component
    });

    const [closingData, setClosingData] = useState({
        sections: [] // Will be initialized by OpeningVaultBalance component
    });

    // Calculate totals for summary (sum across all sections)
    const openingTotal = openingData.sections
        ? openingData.sections.reduce((sum, section) => {
            return sum + (section.rows || []).reduce((rowSum, row) =>
                rowSum + (Number(row.total) || 0), 0);
        }, 0)
        : 0;

    const closingTotal = closingData.sections && !skipClosing
        ? closingData.sections.reduce((sum, section) => {
            return sum + (section.rows || []).reduce((rowSum, row) =>
                rowSum + (Number(row.total) || 0), 0);
        }, 0)
        : 0;

    const totalTransactions = 0;
    const difference = skipClosing ? 0 : closingTotal - openingTotal;

    // Format variance value
    const varianceValue = difference >= 0 ? `+${difference.toFixed(2)}` : `${difference.toFixed(2)}`;

    // Determine status based on difference
    let status = "Tallied";
    if (skipClosing) {
        status = "Pending";
    } else if (difference > 0) {
        status = "Excess";
    } else if (difference < 0) {
        status = "Short";
    }

    // ⭐ VARIANCE LOGIC
    const isPositive = varianceValue.startsWith("+");

    let varianceColor = "";
    let varianceIcon = balance;

    if (skipClosing) {
        varianceColor = "#9CA3AF";   // gray
        varianceIcon = balance;
    } else if (status === "Tallied" || status === "Balance") {
        varianceColor = "#82E890";   // green
        varianceIcon = balance;
    } else if (status === "Excess" && isPositive) {
        varianceColor = "#D8AD00";   // yellow
        varianceIcon = high;
    } else if (status === "Short" && !isPositive) {
        varianceColor = "#FF6B6B";   // red
        varianceIcon = balance;
    }

    // ⭐ STATUS BADGE COLOR
    const statusStyle = {
        Tallied: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Balance: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Excess: "bg-[#302700] text-[#D8AD00] border-[#D8AD00]",
        Short: "bg-[#FF6B6B24] text-[#FF6B6B] border-[#FF6B6B]",
        Pending: "bg-[#374151] text-[#9CA3AF] border-[#6B7280]",
    };

    const handleCurrencyChange = (field, value) => {
        setCurrencyData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveCurrency = async () => {
        try {
            console.log("Saving currency:", currencyData);
            const result = await createCurrency({
                code: currencyData.isoCode,
                name: currencyData.currencyName,
                symbol: currencyData.symbol,
            });

            if (result) {
                setCurrencyData({ currencyName: "", isoCode: "", symbol: "" });
                setShowCurrencyModal(false);
            }
        } catch (error) {
            console.error("Error saving currency:", error);
        }
    };

    const [toast, setToast] = useState({
        show: false,
        message: "",
        type: "success", // success | error | pending
    });

    // Function to format entries for API
    const formatEntriesForApi = (data) => {
        if (!data.sections) return [];

        return data.sections.flatMap(section =>
            (section.rows || []).map(row => ({
                denomination: parseFloat(row.denom || 0),
                quantity: parseInt(row.qty || 0),
                amount: parseFloat(row.total || 0),
                currency_id: section.currencyId
            }))
        );
    };

    const hasEnteredValues = (data) => {
    if (!data.sections) return false;

    return data.sections.some(section =>
        (section.rows || []).some(row =>
        Number(row.qty) > 0 || Number(row.total) > 0
        )
    );
    };

    const showSaveButton =
    hasEnteredValues(openingData) ||
    (!skipClosing && hasEnteredValues(closingData));

    // Function to handle saving reconciliation with optional closing balance
    // Function to handle saving reconciliation with optional closing balance
    const handleSaveReconciliation = async () => {
        try {
            // Prepare opening entries from all sections
            const openingEntries = formatEntriesForApi(openingData);

            // Prepare closing entries (always optional)
            const closingEntries = formatEntriesForApi(closingData);

            // Validation: Check if all opening sections have currency selected
            const openingHasCurrency = openingData.sections &&
                openingData.sections.every(section => section.currencyId && section.selectedCurrency);

            if (!openingHasCurrency || openingData.sections.length === 0) {
                setToast({
                    show: true,
                    message: "Please add at least one opening vault entry with currency selected",
                    type: "error",
                });
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
                return;
            }

            // Validation: Check for opening vault data
            const openingHasData = openingEntries.some(entry =>
                entry.quantity > 0 || entry.amount > 0
            );

            if (!openingHasData) {
                setToast({
                    show: true,
                    message: "Please add at least one opening vault entry with amount",
                    type: "error",
                });
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
                return;
            }

            // No validation for closing - it's completely optional
            // Users can have closing sections with or without data

            // Show pending toast
            setToast({
                show: true,
                message: "Saving reconciliation...",
                type: "pending",
            });

            const reconciliationData = {
                openingEntries,
                closingEntries, // Can be empty array
                notes: notes ? [notes] : []
            };

            console.log('Sending reconciliation data:', reconciliationData);

            const result = await createReconciliation(reconciliationData);

            if (result.success) {
                // ✅ SHOW SUCCESS TOAST
                setToast({
                    show: true,
                    message: "Reconciliation Saved Successfully!",
                    type: "success",
                });

                // Reset form after successful save
                setTimeout(() => {
                    setToast(prev => ({ ...prev, show: false }));
                    setOpeningData({ sections: [] });
                    setClosingData({ sections: [] });
                    setNotes("");
                }, 3000);
            } else {
                // ❌ ERROR TOAST
                setToast({
                    show: true,
                    message: result.error?.message || "Failed to save reconciliation",
                    type: "error",
                });

                setTimeout(() => {
                    setToast(prev => ({ ...prev, show: false }));
                }, 3000);
            }
        } catch (error) {
            setToast({
                show: true,
                message: "Network error. Please try again.",
                type: "error",
            });

            setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    };

    // Function to handle currency refresh after adding new currency
    const handleCurrencyAdded = async () => {
        console.log("New currency added, refresh needed");
    };

    // Function to toggle skip closing
    const toggleSkipClosing = () => {
        const newSkipValue = !skipClosing;
        if (newSkipValue) {
            // When enabling skip, confirm
            if (window.confirm("Skip closing vault? This will mark the reconciliation as Pending. You can add closing balance later.")) {
                setSkipClosing(true);
            }
        } else {
            setSkipClosing(false);
        }
    };

    return (
        <>
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[16px] font-medium text-white">Daily Reconciliation</h2>
                    <p className="text-gray-400 text-[12px] mb-6">
                        Manually data entry for daily vault reconciliation
                    </p>
                </div>
                {(activeTab === "opening" || activeTab === "closing") && (
                    <button
                        onClick={() => setShowCurrencyModal(true)}
                        className="px-4 py-2 bg-[#1D4CB5] text-white rounded-lg text-[13px] h-9 hover:bg-[#2A5BD7] transition-colors"
                    >
                        + Add Currency
                    </button>
                )}
            </div>

            <div className="mt-4 bg-[#16191C] rounded-xl p-3">

                {/* TABS */}
                <div className="flex gap-6 mb-6 ">
                    {["summary", "opening", "closing"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-[14px] font-medium transition-all relative
                                ${activeTab === tab
                                    ? "text-white"
                                    : "text-[#4F575E] hover:text-[#9CA3AF]"
                                }
                            `}
                        >
                            {tab === "summary" && "Summary"}
                            {tab === "opening" && "Opening Vault Balance"}
                            {tab === "closing" && "Closing Vault Balance"}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D4CB5]"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* SUMMARY TAB */}
                {activeTab === "summary" && (

                    <><div className="mt-2 bg-[#1A1F24] p-5 rounded-xl">
                        <div
                            className="bg-[#16191C] p-10 rounded-xl flex flex-col items-center justify-center h-[400px]"
                            style={{
                                borderWidth: "1px",
                                borderStyle: "dashed",
                                borderColor: "#155DFC",
                                borderRadius: "10px",
                            }}
                        >
                            <img src={bgIcon} alt="No Data" className="w-64 opacity-90" />

                          

                            <p className="text-[#8F8F8F] mt-10 text-sm font-medium text-center w-[60%]">
                                The summary hasn’t been generated yet.
                            </p>
                        </div>


                    </div>
                    {showSaveButton && (
                        <div className="flex justify-end">
                            <button
                            onClick={handleSaveReconciliation}
                            className="px-4 py-2 mt-2 bg-[#1D4CB5] text-white rounded-lg text-[13px] flex items-center gap-2 hover:bg-[#2A5BD7] transition-colors"
                            >
                            <img src={save} alt="save" />
                            {skipClosing ? "Save Opening Balance" : "Save Reconciliation"}
                            </button>
                        </div>
                        )}
                        </>
                )}

                {/* OPENING TAB CONTENT */}
                {activeTab === "opening" && (
                    <div>
                        {/* <div className="mb-4 flex items-center justify-between">
                            <p className="text-[#9CA3AF] text-sm">
                                Opening vault balance is required
                            </p>
                        </div> */}
                        <OpeningVaultBalance
                            data={openingData}
                            setData={setOpeningData}
                            type="opening"
                        />
                    </div>
                )}

                {/* CLOSING TAB CONTENT */}
                {activeTab === "closing" && (
                    <div>
                        {/* <div className="mb-4 flex items-center justify-between">
                            <p className="text-[#9CA3AF] text-sm">
                                Closing vault balance is optional
                            </p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="skipClosingTab"
                                    checked={skipClosing}
                                    onChange={toggleSkipClosing}
                                    className="w-4 h-4 rounded border border-[#2A2F33] bg-[#1E2328] text-[#1D4CB5]"
                                />
                                <label htmlFor="skipClosingTab" className="text-[#9CA3AF] text-sm">
                                    Skip closing vault
                                </label>
                            </div>
                        </div> */}

                        {skipClosing ? (
                            <div className="text-center py-10 bg-[#1E2328] rounded-xl border border-dashed border-[#2F343A]">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#374151] mb-4">
                                    <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <p className="text-[#E3E3E3] text-lg mb-2">Closing Vault Skipped</p>
                                <p className="text-[#9CA3AF] text-sm mb-4 max-w-md mx-auto">
                                    You can skip closing vault now and add it later when available.
                                    The reconciliation will be marked as "Pending".
                                </p>
                                <button
                                    onClick={() => setSkipClosing(false)}
                                    className="px-4 py-2 bg-[#1D4CB5] text-white rounded-lg hover:bg-[#2A5BD7] transition-colors text-sm"
                                >
                                    Add Closing Balance
                                </button>
                            </div>
                        ) : (
                            <OpeningVaultBalance
                                data={closingData}
                                setData={setClosingData}
                                type="closing"
                            />
                        )}
                    </div>
                )}

                {showCurrencyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-9999">
                        <CurrencyForm
                            currencyName={currencyData.currencyName}
                            isoCode={currencyData.isoCode}
                            symbol={currencyData.symbol}
                            onChange={handleCurrencyChange}
                            onCancel={() => setShowCurrencyModal(false)}
                            onSubmit={async () => {
                                await handleSaveCurrency();
                                await handleCurrencyAdded();
                            }}
                        />
                    </div>
                )}

            </div>
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
            />
        </>
    );
}