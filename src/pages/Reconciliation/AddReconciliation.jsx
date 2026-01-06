import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import save from "../../assets/Common/save.svg";
import OpeningVaultBalance from "../../components/Reconciliation/OpeningVaultBalance";
import CurrencyForm from "../../components/common/CurrencyForm";
import { createCurrency } from "../../api/currency/currency";
import { createReconciliation } from "../../api/reconcoliation";
import Toast from "../../components/common/Toast";
import bgIcon from "../../assets/report/bgimage.svg";
import { useNavigate, useParams } from "react-router-dom";
import { fetchReconciliationById, updateReconciliation } from "../../api/reconcoliation";

export default function AddReconciliation() {
    const [activeTab, setActiveTab] = useState("summary");
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [notes, setNotes] = useState("");

    const navigate = useNavigate();
    const { id } = useParams();
    const [originalData, setOriginalData] = useState(null);

    // Fetch reconciliation data if editing
    useEffect(() => {
        if (!id) return;

        const fetchRecon = async () => {
            try {
                const result = await fetchReconciliationById(id);
                if (result.success || result.data) {
                    const data = result.data?.data || result.data || result;

                    // Parse notes
                    if (data.notes) {
                        const notesText = Array.isArray(data.notes)
                            ? data.notes.map(n => typeof n === 'string' ? n : n.note || n.text).join('\n')
                            : String(data.notes);
                        setNotes(notesText);
                    }

                    // Store original data to know what to update
                    setOriginalData(data);

                    // Helper to convert API entries back to section format
                    const convertEntriesToSections = (entries) => {
                        if (!entries || !entries.length) return [];

                        // Group by currency
                        const byCurrency = {};
                        entries.forEach(entry => {
                            const currId = entry.currency_id || entry.currencyId;
                            if (!byCurrency[currId]) {
                                byCurrency[currId] = {
                                    id: currId, // Unique ID for the section (using currency ID)
                                    currencyId: currId,
                                    currency: entry.currency?.code || "USD", // Fallback, will need actual code
                                    selectedCurrency: entry.currency?.code || "USD",
                                    exchangeRate: entry.exchange_rate || 1, // Capture exchange rate from entry
                                    rows: []
                                };
                            }

                            // Add row
                            byCurrency[currId].rows.push({
                                denom: entry.denomination,
                                qty: entry.quantity,
                                total: entry.amount
                            });
                        });

                        return Object.values(byCurrency);
                    };

                    // Set Opening Data
                    const openingSections = convertEntriesToSections(data.openingEntries || data.opening_entries);
                    setOpeningData({ sections: openingSections });

                    // Set Closing Data
                    const closingSections = convertEntriesToSections(data.closingEntries || data.closing_entries);
                    if (closingSections.length > 0) {
                        setClosingData({ sections: closingSections });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch reconciliation:", error);
                setToast({
                    show: true,
                    message: "Failed to load reconciliation data",
                    type: "error"
                });
            }
        };

        fetchRecon();
    }, [id]);

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

    // Helper to check if data has entered values
    const hasEnteredValues = (data) => {
        if (!data.sections) return false;

        return data.sections.some(section =>
            (section.rows || []).some(row =>
                Number(row.qty) > 0 || Number(row.total) > 0
            )
        );
    };

    // Calculate totals for summary (sum across all sections)
    const openingTotal = openingData.sections
        ? openingData.sections.reduce((sum, section) => {
            return sum + (section.rows || []).reduce((rowSum, row) =>
                rowSum + (Number(row.total) || 0), 0);
        }, 0)
        : 0;

    const closingTotal = closingData.sections
        ? closingData.sections.reduce((sum, section) => {
            return sum + (section.rows || []).reduce((rowSum, row) =>
                rowSum + (Number(row.total) || 0), 0);
        }, 0)
        : 0;

    const totalTransactions = 0;
    const difference = closingTotal - openingTotal;

    // Format variance value
    const varianceValue = difference >= 0 ? `+${difference.toFixed(2)}` : `${difference.toFixed(2)}`;

    // Determine status based on difference
    let status = "Tallied";
    if (!hasEnteredValues(closingData)) {
        status = "In_Progress";
    } else if (difference > 0) {
        status = "Excess";
    } else if (difference < 0) {
        status = "Short";
    }

    // ⭐ VARIANCE LOGIC
    const isPositive = varianceValue.startsWith("+");

    let varianceColor = "";
    let varianceIcon = balance;

    if (status === "In_Progress") {
        varianceColor = "#8B5CF6";   // violet
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
        In_Progress: "bg-[#8B5CF624] text-[#8B5CF6] border-[#8B5CF6]",
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
                currency_id: section.currencyId,
                exchange_rate: parseFloat(section.exchangeRate || 1) // Include exchange rate in API payload
            }))
        );
    };



    const showSaveButton =
        hasEnteredValues(openingData) ||
        hasEnteredValues(closingData);

    // Function to handle saving reconciliation with optional closing balance
    // Function to handle saving reconciliation with optional closing balance
    const handleSaveReconciliation = async () => {
        try {
            // Prepare opening entries from all sections
            const openingEntries = formatEntriesForApi(openingData);

            // Prepare closing entries (send empty if no values entered to imply In_Progress)
            const closingEntries = hasEnteredValues(closingData) ? formatEntriesForApi(closingData) : [];

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
                message: id ? "Updating reconciliation..." : "Saving reconciliation...",
                type: "pending",
            });

            const reconciliationData = {
                openingEntries,
                closingEntries, // Can be empty array
                notes: notes ? [notes] : [],
                status: status || "Tallied" // Send calculated status
            };

            console.log('Sending reconciliation data:', reconciliationData);

            let result;
            if (id) {
                result = await updateReconciliation(id, reconciliationData);
            } else {
                result = await createReconciliation(reconciliationData);
            }

            if (result.success) {
                navigate("/reconciliation", {
                    state: {
                        toast: {
                            message: id ? "Reconciliation Updated!" : "Reconciliation Saved!",
                            type: "success",
                        },
                    },
                });
            } else {
                setToast({
                    show: true,
                    message: result.error?.message || (id ? "Failed to update" : "Failed to save"),
                    type: "error",
                });

                setTimeout(() => {
                    setToast(prev => ({ ...prev, show: false }));
                }, 3000);
            }
        } catch (error) {
            setToast({
                show: true,
                message: "Please try again.",
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



    return (
        <>
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-[16px] font-medium text-white">{id ? "Edit Reconciliation" : "Daily Reconciliation"}</h2>
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
                                    {id ? "Update Reconciliation" : "Save Reconciliation"}
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
                        <OpeningVaultBalance
                            data={closingData}
                            setData={setClosingData}
                            type="closing"
                        />
                    </div>
                )}

                {showCurrencyModal && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40  flex justify-center items-center">
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