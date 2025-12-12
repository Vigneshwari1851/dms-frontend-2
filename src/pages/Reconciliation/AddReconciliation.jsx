import { useState } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg"; 
import save from "../../assets/common/save.svg";
import OpeningVaultBalance from "../../components/Reconciliation/OpeningVaultBalance";
import CurrencyForm from "../../components/common/CurrencyForm";
import { createCurrency } from "../../api/currency/currency";

export default function AddReconciliation() {
    const [activeTab, setActiveTab] = useState("summary");
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const [currencyData, setCurrencyData] = useState({
        currencyName: "",
        isoCode: "",
        symbol: "",
    });

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

    const varianceValue = "+5.00";   // or "-10.00"
    const status = "Excess";         // "Tallied", "Excess", "Short"

    // ⭐ VARIANCE LOGIC
    const isPositive = varianceValue.startsWith("+");

    let varianceColor = "";
    let varianceIcon = balance;

    if (status === "Tallied" || status === "Balance") {
        varianceColor = "#82E890";   // green
        varianceIcon = balance;
    }

    if (status === "Excess" && isPositive) {
        varianceColor = "#D8AD00";   // yellow
        varianceIcon = high;
    }

    if (status === "Short" && !isPositive) {
        varianceColor = "#FF6B6B";   // red
        varianceIcon = balance;
    }

    // ⭐ STATUS BADGE COLOR
    const statusStyle = {
        Tallied: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Balance: "bg-[#10B93524] text-[#82E890] border-[#82E890]",
        Excess: "bg-[#302700] text-[#D8AD00] border-[#D8AD00]",
        Short: "bg-[#FF6B6B24] text-[#FF6B6B] border-[#FF6B6B]",
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
                        className="px-4 py-2 bg-[#1D4CB5] text-white rounded-lg text-[13px] h-9"
                    >
                        + Add Currency
                    </button>
                )}
            </div>

            <div className="mt-4 bg-[#16191C] rounded-xl">

                {/* TABS */}
                <div className="flex gap-6 mb-6">
                    {["summary", "opening", "closing"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-[14px] font-medium transition-all
                                ${activeTab === tab
                                    ? "text-white border-b-2 border-[#1D4CB5]"
                                    : "text-[#4F575E]"
                                }
                            `}
                        >
                            {tab === "summary" && "Summary"}
                            {tab === "opening" && "Opening Vault Balance"}
                            {tab === "closing" && "Closing Vault Balance"}
                        </button>
                    ))}
                </div>

                {/* SUMMARY TAB */}
                {activeTab === "summary" && (
                    <div className="flex gap-6">

                        {/* LEFT CARD */}
                        <div className="w-[55%] h-[296px] bg-[#1E2328] p-5 rounded-xl border border-[#16191C]">

                            <h3 className="text-white text-[15px] font-medium mb-1">
                                Reconciliation Summary
                            </h3>

                            {/* Rows */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Opening Vault Total</p>
                                <p className="text-white text-[13px]">0.00</p>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Total Transactions</p>
                                <p className="text-white text-[13px]">0</p>
                            </div>

                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <p className="text-[#E3E3E3] text-[14px]">Closing Vault Total</p>
                                <p className="text-white text-[13px]">0.00</p>
                            </div>

                            {/* ⭐ DIFFERENCE / VARIANCE */}
                            <div className="flex justify-between items-center py-3 border-b border-[#16191C]">
                                <div className="flex items-center gap-2">
                                    <img src={varianceIcon} className="w-5 h-5" />
                                    <p className="text-[#E3E3E3] text-[14px]">Difference / Variance</p>
                                </div>

                                <p
                                    className="text-[13px]"
                                    style={{ color: varianceColor }}
                                >
                                    {varianceValue}
                                </p>
                            </div>

                            {/* STATUS */}
                            <div className="flex justify-between items-center py-3 bg-[#16191C] px-2 rounded-lg mt-4 h-8">
                                <p className="text-white font-semibold text-[15px]">Status</p>

                                <span
                                    className={`
                                        w-[70px] h-6 inline-flex items-center justify-center
                                        border rounded-2xl text-[12px]
                                        ${statusStyle[status]}
                                    `}
                                >
                                    {status}
                                </span>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        <div className="w-[470px] h-[296px] flex flex-col justify-between">

                            <div className="bg-[#1E2328] border border-[#1F2429] rounded-xl p-5">
                                <p className="text-white text-[16px] font-medium mb-2">Notes</p>

                                <textarea
                                    placeholder="Add reconciliation notes..."
                                    className="
                                        w-[438px] h-[220px]
                                        bg-[#16191C] text-white text-[14px]
                                        p-2 rounded-sm
                                        outline-none resize-none
                                        placeholder:text-[#4D5567]
                                    "
                                />
                            </div>

                            <div className="flex justify-end">
                                <button className="px-4 py-2 mt-2 bg-[#1D4CB5] text-white rounded-lg text-[13px] flex items-center gap-2">
                                    <img src={save} alt="save" /> Save Reconciliation
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OPENING TAB CONTENT */}
                {activeTab === "opening" && (
                    <OpeningVaultBalance />
                )}

                {activeTab === "closing" && (
                    <OpeningVaultBalance />
                )}

                {showCurrencyModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-9999">
                        <CurrencyForm
                            currencyName={currencyData.currencyName}
                            isoCode={currencyData.isoCode}
                            symbol={currencyData.symbol}
                            onChange={handleCurrencyChange}
                            onCancel={() => setShowCurrencyModal(false)}
                            onSubmit={handleSaveCurrency}
                        />
                    </div>
                )}

            </div>
        </>
    );
}
