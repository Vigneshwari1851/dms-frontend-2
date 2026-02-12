import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import save from "../../assets/Common/save.svg";
import Dropdown from "../../components/common/Dropdown";
import Toast from "../../components/common/Toast";
import bgIcon from "../../assets/report/bgimage.svg";
import { useNavigate, useParams } from "react-router-dom";
import { createReconciliation, fetchReconciliationById, updateReconciliation, startReconcoliation } from "../../api/reconcoliation";
import { fetchCurrencies, createCurrency } from "../../api/currency/currency";
import { fetchDeals } from "../../api/deals";
import NotificationCard from "../../components/common/Notification";
import CurrencyForm from "../../components/common/CurrencyForm";

export default function AddReconciliation() {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const [id, setId] = useState(paramId);

    const [openingRows, setOpeningRows] = useState([
        { id: Date.now(), currencyId: null, currencyCode: '', amount: '' }
    ]);
    const [closingRows, setClosingRows] = useState([
        { id: Date.now() + 1, currencyId: null, currencyCode: '', amount: '' }
    ]);

    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [notes, setNotes] = useState("");
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [isAddingCurrency, setIsAddingCurrency] = useState(false);
    const [newCurrency, setNewCurrency] = useState({ currencyName: "", isoCode: "", symbol: "" });
    const [step, setStep] = useState(1);
    const [todayDeals, setTodayDeals] = useState([]);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        actionType: "remove",
        title: "Delete Row",
        message: "Are you sure you want to delete this row?",
        target: null
    });

    const loadCurrencies = async () => {
        try {
            const currencies = await fetchCurrencies({ page: 1, limit: 100 });
            const actualCurrencies = currencies?.data?.data || currencies?.data || currencies || [];

            if (actualCurrencies.length > 0) {
                const map = {};
                actualCurrencies.forEach(c => map[c.code] = c.id);
                setCurrencyMap(map);

                const dropdownOpts = actualCurrencies.map(c => ({
                    label: `${c.code} - ${c.name}`,
                    value: c.code,
                    id: c.id
                }));
                setCurrencyOptions(dropdownOpts);
                return actualCurrencies;
            }
            return [];
        } catch (error) {
            console.error("Error loading currencies:", error);
            return [];
        }
    };

    useEffect(() => {
        const initData = async () => {
            const actualCurrencies = await loadCurrencies();

            if (actualCurrencies.length > 0 && id) {
                try {
                    const result = await fetchReconciliationById(id);
                    const data = result.data?.data || result.data || result;
                    setNotes(data.notes?.[0]?.note || "");

                    const opRows = (data.openingEntries || data.opening_entries || []).map(entry => ({
                        id: Math.random(),
                        currencyId: entry.currency_id,
                        currencyCode: entry.currency?.code,
                        amount: entry.amount || ""
                    }));

                    const clRows = (data.closingEntries || data.closing_entries || []).map(entry => ({
                        id: Math.random(),
                        currencyId: entry.currency_id,
                        currencyCode: entry.currency?.code,
                        amount: entry.amount || ""
                    }));

                    if (opRows.length > 0) setOpeningRows(opRows);
                    if (clRows.length > 0) setClosingRows(clRows);

                    if (clRows.length > 0) {
                        setStep(3);
                    } else {
                        setStep(2);
                    }
                } catch (err) {
                    console.error("Error fetching reconciliation:", err);
                }
            } else if (actualCurrencies.length > 0) {
                const usd = actualCurrencies.find(c => c.code === "USD");
                const tzs = actualCurrencies.find(c => c.code === "TZS");

                if (usd && tzs) {
                    const initialOp = [
                        { id: Date.now(), currencyId: usd.id, currencyCode: usd.code, amount: '' },
                        { id: Date.now() + 1, currencyId: tzs.id, currencyCode: tzs.code, amount: '' }
                    ];
                    const initialCl = [
                        { id: Date.now() + 2, currencyId: usd.id, currencyCode: usd.code, amount: '' },
                        { id: Date.now() + 3, currencyId: tzs.id, currencyCode: tzs.code, amount: '' }
                    ];
                    setOpeningRows(initialOp);
                    setClosingRows(initialCl);
                }
            }
            if (actualCurrencies.length > 0) {
                // Fetch today's deals for expected balance calculation
                try {
                    const dealsRes = await fetchDeals({ dateFilter: "today", limit: 1000 });
                    setTodayDeals(dealsRes.data || []);
                } catch (err) {
                    console.error("Error fetching deals:", err);
                }
            }
        };
        initData();
    }, [id]);

    useEffect(() => {
        const hasOp = openingRows.some(row => row.amount);
        const hasCl = closingRows.some(row => row.amount);
        const hasNotes = notes.trim() !== "";

        if (step === 1) setShowSaveButton(hasOp);
        else if (step === 2) setShowSaveButton(hasCl);
        else setShowSaveButton(true);
    }, [openingRows, closingRows, notes, step]);

    const handleRowChange = (section, rowId, field, value) => {
        const setRows = section === "opening" ? setOpeningRows : setClosingRows;
        setRows(prev => prev.map(row =>
            row.id === rowId ? { ...row, [field]: value } : row
        ));
    };

    const handleCurrencyChange = (section, rowId, option) => {
        const setRows = section === "opening" ? setOpeningRows : setClosingRows;
        setRows(prev => prev.map(row =>
            row.id === rowId ? { ...row, currencyCode: option.value, currencyId: option.id } : row
        ));
    };

    const addRow = (section) => {
        const setRows = section === "opening" ? setOpeningRows : setClosingRows;
        setRows(prev => [
            ...prev,
            { id: Math.random(), currencyId: null, currencyCode: '', amount: '' }
        ]);
    };
    const handleCurrencySubmit = async () => {
        if (!newCurrency.currencyName || !newCurrency.isoCode || !newCurrency.symbol) {
            setToast({ show: true, message: "Please fill all fields", type: "error" });
            return;
        }

        try {
            setToast({ show: true, message: "Adding currency...", type: "pending" });
            const result = await createCurrency({
                code: newCurrency.isoCode,
                name: newCurrency.currencyName,
                symbol: newCurrency.symbol
            });

            if (result) {
                setToast({ show: true, message: "Currency added successfully", type: "success" });
                setIsAddingCurrency(false);
                setNewCurrency({ currencyName: "", isoCode: "", symbol: "" });
                await loadCurrencies();
            } else {
                setToast({ show: true, message: "Failed to add currency", type: "error" });
            }
        } catch (error) {
            console.error("Error adding currency:", error);
            setToast({ show: true, message: "Error adding currency", type: "error" });
        }
    };
    const removeRow = (section, rowId) => {
        setConfirmModal({
            ...confirmModal,
            open: true,
            target: { section, rowId }
        });
    };

    const confirmDelete = () => {
        if (!confirmModal.target) return;
        const { section, rowId } = confirmModal.target;
        const setRows = section === "opening" ? setOpeningRows : setClosingRows;
        setRows(prev => prev.filter(row => row.id !== rowId));
        setConfirmModal({ ...confirmModal, open: false, target: null });
    };

    const calculateTotals = () => {
        const currencyData = {};

        // 1. Opening
        openingRows.forEach(row => {
            if (!row.currencyId) return;
            if (!currencyData[row.currencyId]) {
                currencyData[row.currencyId] = { code: row.currencyCode, opening: 0, received: 0, paid: 0, closing: 0 };
            }
            currencyData[row.currencyId].opening += Number(row.amount || 0);
        });

        // 2. Deals (Received/Paid)
        todayDeals.forEach(deal => {
            const hasItems = (deal.receivedItems?.length > 0 || deal.paidItems?.length > 0);

            if (hasItems) {
                (deal.receivedItems || []).forEach(item => {
                    const cid = item.currency_id;
                    if (!currencyData[cid]) {
                        const c = currencyOptions.find(o => o.id === cid);
                        currencyData[cid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                    }
                    currencyData[cid].received += Number(item.total || 0);
                });
                (deal.paidItems || []).forEach(item => {
                    const cid = item.currency_id;
                    if (!currencyData[cid]) {
                        const c = currencyOptions.find(o => o.id === cid);
                        currencyData[cid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                    }
                    currencyData[cid].paid += Number(item.total || 0);
                });
            } else {
                const buyCid = deal.buy_currency_id;
                const sellCid = deal.sell_currency_id;
                const amount = Number(deal.amount || 0);
                const amountToBePaid = Number(deal.amount_to_be_paid || 0);

                if (deal.deal_type === "buy") {
                    if (buyCid) {
                        if (!currencyData[buyCid]) {
                            const c = currencyOptions.find(o => o.id === buyCid);
                            currencyData[buyCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                        }
                        currencyData[buyCid].received += amount;
                    }
                    if (sellCid) {
                        if (!currencyData[sellCid]) {
                            const c = currencyOptions.find(o => o.id === sellCid);
                            currencyData[sellCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                        }
                        currencyData[sellCid].paid += amountToBePaid;
                    }
                } else if (deal.deal_type === "sell") {
                    if (buyCid) {
                        if (!currencyData[buyCid]) {
                            const c = currencyOptions.find(o => o.id === buyCid);
                            currencyData[buyCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                        }
                        currencyData[buyCid].received += amountToBePaid;
                    }
                    if (sellCid) {
                        if (!currencyData[sellCid]) {
                            const c = currencyOptions.find(o => o.id === sellCid);
                            currencyData[sellCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, closing: 0 };
                        }
                        currencyData[sellCid].paid += amount;
                    }
                }
            }
        });

        // 3. Actual Closing
        closingRows.forEach(row => {
            if (!row.currencyId) return;
            if (!currencyData[row.currencyId]) {
                currencyData[row.currencyId] = { code: row.currencyCode, opening: 0, received: 0, paid: 0, closing: 0 };
            }
            currencyData[row.currencyId].closing += Number(row.amount || 0);
        });

        const opTotal = Object.values(currencyData).reduce((sum, d) => sum + d.opening, 0);
        const clTotal = Object.values(currencyData).reduce((sum, d) => sum + d.closing, 0);

        return { opTotal, clTotal, currencyData };
    };

    const handleSaveReconciliation = async () => {
        try {
            if (step === 3 && id) {
                setToast({ show: true, message: "Starting Reconciliation...", type: "pending" });
                const result = await startReconcoliation(id);
                if (result.success) {
                    setToast({ show: true, message: "Reconciliation Started Successfully", type: "success" });
                    setTimeout(() => navigate("/reconciliation"), 1500);
                } else {
                    setToast({ show: true, message: "Failed to start reconciliation", type: "error" });
                }
                return;
            }

            const openingEntries = openingRows
                .filter(row => row.amount && row.currencyId)
                .map(row => ({
                    currency_id: row.currencyId,
                    amount: Number(row.amount),
                    exchange_rate: 1.0,
                    denomination: Number(row.amount),
                    quantity: 1
                }));

            if (!id && openingEntries.length === 0) {
                setToast({ show: true, message: "Opening Vault balance is required to start a reconciliation.", type: "error" });
                return;
            }

            const closingEntries = closingRows
                .filter(row => row.amount && row.currencyId)
                .map(row => ({
                    currency_id: row.currencyId,
                    amount: Number(row.amount),
                    exchange_rate: 1.0,
                    denomination: Number(row.amount),
                    quantity: 1
                }));

            const { currencyData } = calculateTotals();
            let status = "In_Progress";

            if (closingEntries.length > 0) {
                let hasExcess = false;
                let hasShort = false;
                let tallied = true;

                Object.values(currencyData).forEach(data => {
                    const expected = data.opening + data.received - data.paid;
                    const v = data.closing - expected;
                    if (Math.abs(v) >= 0.01) {
                        tallied = false;
                        if (v > 0) hasExcess = true;
                        else hasShort = true;
                    }
                });

                if (tallied) status = "Tallied";
                else if (hasShort) status = "Short";
                else status = "Excess";
            }
            const payload = {
                openingEntries,
                closingEntries,
                notes: notes ? [notes] : [],
                status
            };

            let result;
            if (id) {
                result = await updateReconciliation(id, payload);
            } else {
                result = await createReconciliation(payload);
            }

            if (result.success || result.data) {
                const newId = id || result.data?.id || result.data?.data?.id;
                setId(newId);
                if (openingEntries.length > 0 && closingEntries.length > 0) {
                    setStep(3);
                } else if (openingEntries.length > 0) {
                    setStep(2);
                }
            } else {
                setToast({ show: true, message: "Failed to save", type: "error" });
            }
        } catch (error) {
            console.error("Save error:", error);
            setToast({ show: true, message: "Error saving data", type: "error" });
        }
    };

    const { opTotal, clTotal, currencyData } = calculateTotals();

    const renderTable = (section, rows) => (
        <div className="bg-[#16191C] rounded-xl border border-[#2A2F33]/50 h-full">
            <div className="p-4 border-b border-[#2A2F33]/50 flex justify-between items-center">
                <h2 className="text-[16px] font-medium flex items-center gap-2 text-white">
                    <div className={`w-1.5 h-4 rounded-full ${section === "opening" ? "bg-[#1D4CB5]" : "bg-[#82E890]"}`}></div>
                    {section === "opening" ? "Opening Balance" : "Closing Balance"}
                </h2>
                <button
                    onClick={() => addRow(section)}
                    className="bg-[#1D4CB5]/10 text-[#1D4CB5] px-3 py-1.5 rounded-lg text-[12px] transition-all border border-[#1D4CB5]/20 hover:bg-[#1D4CB5] hover:text-white"
                >
                    + Add Row
                </button>
            </div>

            <div className="">
                <table className="w-full text-left text-[14px]">
                    <thead>
                        <tr className="bg-[#1B1E21] text-[#8F8F8F] border-b border-[#2A2F33]/50">
                            <th className="px-5 py-3">Currency</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                            <th className="px-5 py-3 w-[60px] text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2F33]/30">
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-[#1E2328]/30 transition-colors">
                                <td className="px-5 py-3 min-w-[180px]">
                                    <Dropdown
                                        label="Select Currency"
                                        options={currencyOptions.filter(opt =>
                                            !rows.some(r => r.id !== row.id && r.currencyCode === opt.value)
                                        )}
                                        selected={row.currencyCode ? currencyOptions.find(o => o.value === row.currencyCode)?.label : ""}
                                        onChange={(opt) => handleCurrencyChange(section, row.id, opt)}
                                        buttonClassName="!bg-[#1A1F24] !border-[#4B5563]/30 !py-2"
                                        disabled={step === 3}
                                    />
                                </td>
                                <td className="px-5 py-3">
                                    <input
                                        type="number"
                                        value={row.amount}
                                        onChange={(e) => handleRowChange(section, row.id, "amount", e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-[#1A1F24] border border-[#4B5563]/30 rounded-lg px-4 py-2 text-white outline-none focus:border-[#1D4CB5] text-right font-medium disabled:opacity-50"
                                        disabled={step === 3}
                                    />
                                </td>
                                <td className="px-5 py-3 text-center">
                                    <button
                                        onClick={() => removeRow(section, row.id)}
                                        disabled={rows.length <= 1 || step === 3}
                                        className={`p-2 rounded-lg transition-all ${rows.length > 1 && step !== 3 ? "hover:bg-red-500/10 text-[#FF6B6B]" : "text-gray-600 cursor-not-allowed opacity-30"}`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-2 flex justify-end">
                <button
                    onClick={handleSaveReconciliation}
                    disabled={step === 3 || !rows.some(r => r.amount)}
                    className={`py-2 px-6 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all
                    ${step < 3 && rows.some(r => r.amount)
                            ? (section === "opening" ? "bg-[#1D4CB5] text-white hover:bg-[#2A5BD7]" : "bg-[#82E890] text-[#16191C] hover:bg-[#9EF7AB]")
                            : "bg-[#252A2E] text-[#4F575E] cursor-not-allowed border border-[#2A2F33]"}
                `}
                >
                    <img src={save} alt="save" className={`w-3.5 h-3.5 ${section === "closing" && "brightness-0"}`} />
                    {id ? `Update ${section === "opening" ? "Opening" : "Closing"} Vault` : `Save ${section === "opening" ? "Opening" : "Closing"} Vault`}
                </button>
            </div>
        </div>
    );

    return (
        <div className="">
            {/* HEADER */}
            <div className="flex flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-[20px] lg:text-[24px] font-semibold text-white">
                        {id ? "Resume Reconciliation" : "Add Reconciliation"}
                    </h1>
                    <p className="text-[#8F8F8F] text-[13px] lg:text-[14px]">
                        Step {step}: {step === 1 ? "Capture opening vault balances" : step === 2 ? "Capture closing vault balances" : "Settle associated deals"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSaveReconciliation}
                        disabled={step !== 3}
                        className={`px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-semibold ${step === 3
                            ? "bg-[#1D4CB5] text-white hover:bg-[#2A5BD7] shadow-lg shadow-[#1D4CB5]/20"
                            : "bg-[#252A2E] text-[#4F575E] cursor-not-allowed border border-[#2A2F33]"
                            }`}
                    >
                        Start Reconciliation
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === s ? "bg-[#1D4CB5] text-white" : step > s ? "bg-[#82E890] text-[#16191C]" : "bg-[#252A2E] text-[#4F575E]"}`}>
                            {step > s ? "✓" : s}
                        </div>
                        <div className={`text-sm ${step === s ? "text-white font-medium" : "text-[#4F575E]"}`}>
                            {s === 1 ? "Opening" : s === 2 ? "Closing" : "Start"}
                        </div>
                        {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-[#82E890]" : "bg-[#252A2E]"}`} />}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`transition-all`}>
                    {renderTable("opening", openingRows)}
                </div>
                <div className={`transition-all`}>
                    {renderTable("closing", closingRows)}
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="mt-6 pb-12 space-y-4">
                <div className={`bg-[#16191C] rounded-xl p-5 border border-[#2A2F33]/50`}>
                    <h3 className="text-white text-[14px] font-medium mb-3">Notes</h3>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any additional observations..."
                        className="w-full bg-[#1A1F24] text-white p-4 rounded-lg border border-[#2A2F33] focus:border-[#1D4CB5] outline-none min-h-[120px] resize-none text-[13px] transition-all"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => navigate("/reconciliation")}
                        className="text-[#8F8F8F] hover:text-white transition-colors bg-[#1E2328] px-5 py-2.5 rounded-lg text-sm border border-[#2A2F33] font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
            {confirmModal.open && (
                <NotificationCard
                    confirmModal={confirmModal}
                    onConfirm={confirmDelete}
                    onCancel={() => setConfirmModal({ ...confirmModal, open: false, target: null })}
                />
            )}

            {isAddingCurrency && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
                    <CurrencyForm
                        currencyName={newCurrency.currencyName}
                        isoCode={newCurrency.isoCode}
                        symbol={newCurrency.symbol}
                        onChange={(field, val) => setNewCurrency(prev => ({ ...prev, [field]: val }))}
                        onCancel={() => setIsAddingCurrency(false)}
                        onSubmit={handleCurrencySubmit}
                    />
                </div>
            )}
        </div>
        // summary as per currency
        // {(step > 1 || id) && (
        //     <div className="bg-[#16191C] rounded-xl p-5 border border-[#2A2F33]/50">
        //         <div className="space-y-4">
        //             <h3 className="text-white text-[14px] font-medium border-b border-[#2A2F33] pb-2">Summary per Currency</h3>
        //             <div className="overflow-x-auto">
        //                 <table className="w-full text-left text-[13px]">
        //                     <thead>
        //                         <tr className="text-[#8F8F8F] border-b border-[#2A2F33]/30">
        //                             <th className="py-2">Currency</th>
        //                             <th className="py-2 text-right">Opening</th>
        //                             <th className="py-2 text-right">Inflow (+)</th>
        //                             <th className="py-2 text-right">Outflow (-)</th>
        //                             {/* <th className="py-2 text-right">Expected</th>
        //                             <th className="py-2 text-right">Actual Closing</th> */}
        //                             <th className="py-2 text-right">Variance</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody className="divide-y divide-[#2A2F33]/20">
        //                         {Object.entries(currencyData).map(([cid, data]) => {
        //                             const expected = data.opening + data.received - data.paid;
        //                             const v = data.closing - expected;
        //                             return (
        //                                 <tr key={cid} className="text-white">
        //                                     <td className="py-2 font-medium">{data.code}</td>
        //                                     <td className="py-2 text-right">{data.opening.toLocaleString()}</td>
        //                                     <td className="py-2 text-right text-[#82E890]">{data.received > 0 ? `+${data.received.toLocaleString()}` : '0'}</td>
        //                                     <td className="py-2 text-right text-[#FF6B6B]">{data.paid > 0 ? `-${data.paid.toLocaleString()}` : '0'}</td>
        //                                     {/* <td className="py-2 text-right text-[#B0B0B0]">{expected.toLocaleString()}</td>
        //                                     <td className="py-2 text-right text-white font-medium">{data.closing.toLocaleString()}</td> */}
        //                                     <td className={`py-2 text-right font-bold ${Math.abs(v) < 0.01 ? "text-gray-500" : v > 0 ? "text-[#82E890]" : "text-[#FF6B6B]"}`}>
        //                                         {Math.abs(v) < 0.01 ? "Tallied" : `${v > 0 ? "Excess: " : "Short: "}${v.toLocaleString()}`}
        //                                     </td>
        //                                 </tr>
        //                             );
        //                         })}
        //                     </tbody>
        //                 </table>
        //             </div>
        //         </div>
        //     </div>
        // )}
    );
}
