import React, { useState, useEffect } from "react";
import Table from "../../components/common/Table";
import CurrencyForm from "../../components/common/CurrencyForm";
import { fetchCurrencies, createCurrency } from "../../api/currency/currency";
import { fetchCurrencyPairs, createCurrencyPair } from "../../api/currencyPair";
import addIcon from "../../assets/Common/HPlus.svg";
import Toast from "../../components/common/Toast";
import Dropdown from "../../components/common/Dropdown";

export default function CurrencyManagement() {
    const [activeTab, setActiveTab] = useState("currencies");
    const [currencies, setCurrencies] = useState([]);
    const [currencyPairs, setCurrencyPairs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCurrencyForm, setShowCurrencyForm] = useState(false);
    const [showPairForm, setShowPairForm] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });

    const [newCurrency, setNewCurrency] = useState({ currencyName: "", isoCode: "", symbol: "" });
    const [newPair, setNewPair] = useState({ base_currency_id: "", quote_currency_id: "", rate: "1" });

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1 });

    useEffect(() => {
        loadData();
    }, [activeTab, currentPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "currencies") {
                const data = await fetchCurrencies({ page: currentPage, limit: 10 });
                setCurrencies(data);
            } else {
                const res = await fetchCurrencyPairs({ page: currentPage, limit: 10 });
                setCurrencyPairs(res.data);
                setPagination(res.pagination);

                const allCurr = await fetchCurrencies({ limit: 100 });
                setCurrencies(allCurr);
            }
        } catch (err) {
            showToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
    };

    const handleCreateCurrency = async () => {
        if (!newCurrency.currencyName || !newCurrency.isoCode || !newCurrency.symbol) {
            showToast("Please fill all fields", "error");
            return;
        }
        const res = await createCurrency({
            name: newCurrency.currencyName,
            code: newCurrency.isoCode,
            symbol: newCurrency.symbol
        });
        if (res) {
            showToast("Currency created successfully");
            setShowCurrencyForm(false);
            setNewCurrency({ currencyName: "", isoCode: "", symbol: "" });
            loadData();
        } else {
            showToast("Failed to create currency", "error");
        }
    };

    const handleCreatePair = async () => {
        if (!newPair.base_currency_id || !newPair.quote_currency_id || !newPair.rate) {
            showToast("Please fill all fields", "error");
            return;
        }
        try {
            await createCurrencyPair(newPair);
            showToast("Currency pair created successfully");
            setShowPairForm(false);
            setNewPair({ base_currency_id: "", quote_currency_id: "", rate: "1" });
            loadData();
        } catch (err) {
            showToast("Failed to create currency pair", "error");
        }
    };

    const currencyColumns = [
        { label: "Currency Name", key: "name", align: "left" },
        { label: "ISO Code", key: "code", align: "center" },
        { label: "Symbol", key: "symbol", align: "center" },
        { label: "Created At", key: "created_at", align: "right" },
    ];

    const pairColumns = [
        { label: "Base Currency", key: "base", align: "left" },
        { label: "Quote Currency", key: "quote", align: "center" },
        { label: "Currency Pair", key: "pair", align: "center" },
        { label: "Last Updated", key: "updated_at", align: "right" },
    ];

    const currencyTableData = currencies.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        symbol: c.symbol,
        created_at: new Date(c.created_at).toLocaleDateString(),
    }));

    const pairTableData = currencyPairs.map((p) => ({
        id: p.id,
        base: p.baseCurrency?.code || "-",
        quote: p.quoteCurrency?.code || "-",
        pair: `${p.baseCurrency?.code || "-"}/${p.quoteCurrency?.code || "-"}`,
        updated_at: new Date(p.effective_at).toLocaleString(),
    }));

    const currencyOptions = currencies.map(c => `${c.code} - ${c.name}`);

    return (
        <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-white text-xl lg:text-2xl font-bold">Currency Management</h1>
                    <p className="text-gray-400 mt-1 text-sm">Manage system currencies and exchange rate pairs</p>
                </div>
                <button
                    onClick={() => activeTab === "currencies" ? setShowCurrencyForm(true) : setShowPairForm(true)}
                    className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-2 rounded-lg font-medium transition-colors w-fit"
                >
                    <img src={addIcon} alt="add" className="w-5 h-5" />
                    {activeTab === "currencies" ? "Add Currency" : "Add Pair"}
                </button>
            </div>

            <div className="flex gap-1 mb-6 bg-[#1A1F24] p-1 rounded-lg w-fit">
                <button
                    onClick={() => { setActiveTab("currencies"); setCurrentPage(1); }}
                    className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "currencies" ? "bg-[#2A2F34] text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Currencies
                </button>
                <button
                    onClick={() => { setActiveTab("pairs"); setCurrentPage(1); }}
                    className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "pairs" ? "bg-[#2A2F34] text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Currency Pairs
                </button>
            </div>

            <div className="bg-[#1A1F24] rounded-xl overflow-hidden">
                <Table
                    title={activeTab === "currencies" ? "Supported Currencies" : "Active Pairs"}
                    columns={activeTab === "currencies" ? currencyColumns : pairColumns}
                    data={activeTab === "currencies" ? currencyTableData : pairTableData}
                    showExport={false}
                    showRightSection={false}
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                    onSearch={() => { }}
                />
            </div>

            {showCurrencyForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <CurrencyForm
                        currencyName={newCurrency.currencyName}
                        isoCode={newCurrency.isoCode}
                        symbol={newCurrency.symbol}
                        onChange={(field, val) => setNewCurrency(prev => ({ ...prev, [field]: val }))}
                        onCancel={() => setShowCurrencyForm(false)}
                        onSubmit={handleCreateCurrency}
                    />
                </div>
            )}

            {showPairForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1A1F24] p-6 rounded-lg w-full max-w-[470px] text-white">
                        <h2 className="text-xl font-semibold">Add Currency Pair</h2>
                        <p className="text-gray-400 mt-1 text-sm">Create a new exchange rate pair</p>

                        <div className="mt-6 space-y-5">
                            <div>
                                <label className="block text-sm text-[#ABABAB] mb-1">Base Currency <span className="text-red-500">*</span></label>
                                <Dropdown
                                    label="Select Base"
                                    options={currencyOptions}
                                    selected={currencies.find(c => c.id === Number(newPair.base_currency_id))?.code ? `${currencies.find(c => c.id === Number(newPair.base_currency_id)).code} - ${currencies.find(c => c.id === Number(newPair.base_currency_id)).name}` : ""}
                                    onChange={(val) => {
                                        const code = val.split(" - ")[0];
                                        const curr = currencies.find(c => c.code === code);
                                        if (curr) setNewPair(prev => ({ ...prev, base_currency_id: curr.id }));
                                    }}
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#ABABAB] mb-1">Quote Currency <span className="text-red-500">*</span></label>
                                <Dropdown
                                    label="Select Quote"
                                    options={currencyOptions}
                                    selected={currencies.find(c => c.id === Number(newPair.quote_currency_id))?.code ? `${currencies.find(c => c.id === Number(newPair.quote_currency_id)).code} - ${currencies.find(c => c.id === Number(newPair.quote_currency_id)).name}` : ""}
                                    onChange={(val) => {
                                        const code = val.split(" - ")[0];
                                        const curr = currencies.find(c => c.code === code);
                                        if (curr) setNewPair(prev => ({ ...prev, quote_currency_id: curr.id }));
                                    }}
                                    className="w-full"
                                />
                            </div>

                            {/* Rate field hidden/removed as requested */}
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <button
                                onClick={() => setShowPairForm(false)}
                                className="flex-1 px-5 py-2 rounded-lg border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePair}
                                className="flex-1 px-5 py-2 bg-[#1D4CB5] hover:bg-[#173B8B] rounded-lg text-white font-medium transition-colors"
                            >
                                Save Pair
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast show={toast.show} message={toast.message} type={toast.type} />
        </div>
    );
}
