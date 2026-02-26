import { useState, useEffect } from "react";
import balance from "../../assets/reconciliation/balance.svg";
import high from "../../assets/reconciliation/high.svg";
import save from "../../assets/Common/save.svg";
import Dropdown from "../../components/common/Dropdown";
import Toast from "../../components/common/Toast";
import bgIcon from "../../assets/report/bgimage.svg";
import { useNavigate, useParams } from "react-router-dom";
import {
    createReconciliation,
    fetchReconciliationById,
    updateReconciliation,
    startReconcoliation,
    fetchReconcoliation,
    fetchCurrentReconciliation
} from "../../api/reconcoliation";
import { fetchCurrencies, createCurrency } from "../../api/currency/currency";
import { fetchDeals } from "../../api/deals";
import NotificationCard from "../../components/common/Notification";
import CurrencyForm from "../../components/common/CurrencyForm";
import DealsTable from "../../components/dashboard/DealsTable";
import StatCard from "../../components/dashboard/StatCard";
import dealstoday from "../../assets/dashboard/dealstoday.svg";
import profit from "../../assets/dashboard/profit.svg";
import sellamount from "../../assets/dashboard/sellamount.svg";
import buyamount from "../../assets/dashboard/buyamount.svg";

export default function AddReconciliation() {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const [id, setId] = useState(paramId);
    const [yesterdayAvgRate, setYesterdayAvgRate] = useState(null);

    const [openingRows, setOpeningRows] = useState([
        { id: Date.now(), currencyId: null, currencyCode: '', amount: '' }
    ]);
    const [closingRows, setClosingRows] = useState([
        { id: Date.now() + 1, currencyId: null, currencyCode: '', amount: '' }
    ]);

    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [notes, setNotes] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [isAddingCurrency, setIsAddingCurrency] = useState(false);
    const [newCurrency, setNewCurrency] = useState({ currencyName: "", isoCode: "", symbol: "" });
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState(null);
    const [todayDeals, setTodayDeals] = useState([]);
    const [showClosingVault, setShowClosingVault] = useState(false);
    const [hasSavedClosing, setHasSavedClosing] = useState(false);
    const [backendStats, setBackendStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
                    label: `${c.code}`,
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

    const fetchReconciliationDetails = async () => {
        setIsLoading(true);
        const actualCurrencies = await loadCurrencies();

        try {
            let result;
            if (id) {
                result = await fetchReconciliationById(id);
            } else {
                // Check if there's a reconciliation for today
                const currentRes = await fetchCurrentReconciliation();
                if (currentRes.success && currentRes.data) {
                    result = { success: true, data: currentRes.data };
                    setId(currentRes.data.id);
                }
            }

            if (result && result.success) {
                const data = result.data?.data || result.data || result;
                setNotes(data.notes?.[0]?.note || "");
                setStatus(data.status);
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

                if (clRows.length > 0) {
                    setHasSavedClosing(true);
                }
                if (opRows.length > 0) setOpeningRows(opRows);

                if (clRows.length > 0) {
                    setClosingRows(clRows);
                } else if (actualCurrencies.length > 0) {
                    const usd = actualCurrencies.find(c => c.code === "USD");
                    const tzs = actualCurrencies.find(c => c.code === "TZS");
                    if (usd && tzs) {
                        setClosingRows([
                            { id: Date.now(), currencyId: usd.id, currencyCode: usd.code, amount: '' },
                            { id: Date.now() + 1, currencyId: tzs.id, currencyCode: tzs.code, amount: '' }
                        ]);
                    }
                }

                // Determine step based on status and data
                if (["Tallied", "Short", "Excess"].includes(data.status)) {
                    setStep(3);
                    setShowClosingVault(true);
                } else if (data.openingEntries?.length > 0) {
                    setStep(2);
                } else {
                    setStep(1);
                }

                if (data.deals && data.deals.length > 0) {
                    const deals = data.deals.map(d => d.deal);
                    setTodayDeals(deals);
                } else if (id || data.id) {
                    // Fetch today's deals to show expected movement even before mapping
                    const dealsRes = await fetchDeals({ dateFilter: "today" });
                    if (dealsRes.data) setTodayDeals(dealsRes.data);
                } else {
                    setTodayDeals([]);
                }

                const usdStats = data.currencyStats ? Object.values(data.currencyStats).find(s => s.code === "USD") : null;

                setBackendStats({
                    totalTzsPaid: data.totalTzsPaid,
                    totalTzsReceived: data.totalTzsReceived,
                    totalForeignBought: data.totalForeignBought,
                    totalForeignSold: data.totalForeignSold,
                    totalWeightedAvgRate: data.totalWeightedAvgRate,
                    valuationRate: data.valuationRate,
                    totalOpeningValue: data.totalOpeningValue,
                    totalClosingValue: data.totalClosingValue,
                    profitLoss: data.profitLoss,
                    avgBuyRate: usdStats?.avgBuyRate,
                    avgSellRate: usdStats?.avgSellRate
                });
            } else if (actualCurrencies.length > 0) {
                // New Reconciliation
                setStep(1);
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
                setTodayDeals([]);

                // Fetch previous reconciliation for "Yesterday's Avg"
                const prevRecons = await fetchReconcoliation({ limit: 1 });
                if (prevRecons?.data?.length > 0) {
                    setYesterdayAvgRate(prevRecons.data[0].total_avg || prevRecons.data[0].totalAvg || 0);
                }
            }
        } catch (err) {
            console.error("Error fetching reconciliation:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReconciliationDetails();
    }, [id]);

    useEffect(() => {
        const hasOp = openingRows.some(row => row.amount);
        const hasCl = closingRows.some(row => row.amount);
        // showSaveButton logic can be simplified or removed if we rely on step buttons
    }, [openingRows, closingRows, notes, step]);

    const handleRowChange = (section, rowId, field, value) => {
        if (field === "amount") {
            // Block '0' at first, negatives, or any character that isn't a digit or dot
            if (value === "0") return;
            if (value.includes("-")) return;
            // Only allow digits and a single decimal point (e.g., blocks 1..0 or 1-00)
            if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
        }
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

        const usdBuyRates = [];
        const usdSellRates = [];
        let totalBuyTZS = 0;
        let totalSellTZS = 0;

        todayDeals.forEach(deal => {
            const buyCode = currencyOptions.find(o => o.id === deal.buy_currency_id)?.value;
            const sellCode = currencyOptions.find(o => o.id === deal.sell_currency_id)?.value;
            const rate = Number(deal.exchange_rate || 0);

            let amount = Number(deal.amount || 0);
            let amountToBePaid = Number(deal.amount_to_be_paid || 0);

            if (deal.status === "Pending") {
                const totalReceived = (deal.receivedItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
                const totalPaid = (deal.paidItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0);

                if (deal.deal_type === "buy") {
                    amount = totalReceived;
                    amountToBePaid = totalPaid;
                } else {
                    amount = totalPaid;
                    amountToBePaid = totalReceived;
                }
            }

            if (deal.deal_type === "buy" && buyCode === "USD") {
                usdBuyRates.push(rate);
                totalBuyTZS += (Number(deal.amount_to_be_paid || 0));
            } else if (deal.deal_type === "sell" && sellCode === "USD") {
                usdSellRates.push(rate);
                totalSellTZS += (Number(deal.amount_to_be_paid || 0));
            }
        });

        const buyDealsRate = usdBuyRates.length > 0 ? (usdBuyRates.reduce((a, b) => a + b, 0) / usdBuyRates.length) : 0;
        const sellDealsRate = usdSellRates.length > 0 ? (usdSellRates.reduce((a, b) => a + b, 0) / usdSellRates.length) : 0;
        // Total Avg is the midpoint of these simple averages
        const totalAvg = (buyDealsRate > 0 && sellDealsRate > 0)
            ? ((buyDealsRate + sellDealsRate) / 2)
            : (buyDealsRate || sellDealsRate || 0);

        // 1. Opening
        openingRows.forEach(row => {
            if (!row.currencyId) return;
            if (!currencyData[row.currencyId]) {
                currencyData[row.currencyId] = {
                    code: row.currencyCode,
                    opening: 0,
                    received: 0, // Physical (touched)
                    paid: 0,     // Physical (touched)
                    receivedSched: 0, // Scheduled (full)
                    paidSched: 0,    // Scheduled (full)
                    closing: 0
                };
            }
            currencyData[row.currencyId].opening += Number(row.amount || 0);
        });

        // 2. Deals (Received/Paid)
        todayDeals.forEach(deal => {
            const buyCid = deal.buy_currency_id;
            const sellCid = deal.sell_currency_id;

            const fullAmount = Number(deal.amount || 0);
            const fullAmountToBePaid = Number(deal.amount_to_be_paid || 0);

            let touchedAmount = fullAmount;
            let touchedAmountToBePaid = fullAmountToBePaid;

            if (deal.status === "Pending") {
                const totalReceived = (deal.receivedItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0);
                const totalPaid = (deal.paidItems || []).reduce((sum, item) => sum + Number(item.total || 0), 0);

                const buyCurrencyCode = currencyOptions.find(o => o.id === buyCid)?.value;
                const sellCurrencyCode = currencyOptions.find(o => o.id === sellCid)?.value;

                if (deal.deal_type === "buy") {
                    // Buy USD with TZS -> USD is full, TZS is touched
                    touchedAmount = (buyCurrencyCode === "USD") ? fullAmount : totalReceived;
                    touchedAmountToBePaid = (sellCurrencyCode === "TZS") ? totalPaid : fullAmountToBePaid;
                } else {
                    // Sell USD for TZS -> USD is full, TZS is touched
                    touchedAmountToBePaid = (buyCurrencyCode === "TZS") ? totalReceived : fullAmountToBePaid;
                    touchedAmount = (sellCurrencyCode === "USD") ? fullAmount : totalPaid;
                }
            }

            if (deal.deal_type === "buy") {
                if (buyCid) {
                    if (!currencyData[buyCid]) {
                        const c = currencyOptions.find(o => o.id === buyCid);
                        currencyData[buyCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, receivedSched: 0, paidSched: 0, closing: 0 };
                    }
                    currencyData[buyCid].received += touchedAmount;
                    currencyData[buyCid].receivedSched += fullAmount;
                }
                if (sellCid) {
                    if (!currencyData[sellCid]) {
                        const c = currencyOptions.find(o => o.id === sellCid);
                        currencyData[sellCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, receivedSched: 0, paidSched: 0, closing: 0 };
                    }
                    currencyData[sellCid].paid += touchedAmountToBePaid;
                    currencyData[sellCid].paidSched += fullAmountToBePaid;
                }
            } else if (deal.deal_type === "sell") {
                if (buyCid) {
                    if (!currencyData[buyCid]) {
                        const c = currencyOptions.find(o => o.id === buyCid);
                        currencyData[buyCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, receivedSched: 0, paidSched: 0, closing: 0 };
                    }
                    currencyData[buyCid].received += touchedAmountToBePaid;
                    currencyData[buyCid].receivedSched += fullAmountToBePaid;
                }
                if (sellCid) {
                    if (!currencyData[sellCid]) {
                        const c = currencyOptions.find(o => o.id === sellCid);
                        currencyData[sellCid] = { code: c?.value || '?', opening: 0, received: 0, paid: 0, receivedSched: 0, paidSched: 0, closing: 0 };
                    }
                    currencyData[sellCid].paid += touchedAmount;
                    currencyData[sellCid].paidSched += fullAmount;
                }
            }
        });

        closingRows.forEach(row => {
            if (!row.currencyId) return;
            if (!currencyData[row.currencyId]) {
                currencyData[row.currencyId] = { code: row.currencyCode, opening: 0, received: 0, paid: 0, receivedSched: 0, paidSched: 0, closing: 0 };
            }
            currencyData[row.currencyId].closing += Number(row.amount || 0);
        });

        // 4. Valuation Calculations
        let totalOpeningValue = 0;
        let totalClosingValue = 0;

        Object.values(currencyData).forEach(data => {
            // Full Scheduled Target
            data.expected = data.opening + data.receivedSched - data.paidSched;

            // Physically Touched portion
            data.physical = data.opening + data.received - data.paid;

            // Pending = Difference
            data.pending = data.expected - data.physical;

            if (data.code === "USD") {
                totalOpeningValue += (data.opening * (yesterdayAvgRate || totalAvg));
                totalClosingValue += (data.closing * totalAvg);
            } else if (data.code === "TZS") {
                totalOpeningValue += data.opening;
                totalClosingValue += data.closing;
            } else {
                totalOpeningValue += (data.opening * totalAvg);
                totalClosingValue += (data.closing * totalAvg);
            }
        });

        const profitLoss = totalOpeningValue - totalClosingValue;
        return {
            currencyData,
            buyDealsRate,
            sellDealsRate,
            totalAvg,
            totalOpeningValue,
            totalClosingValue,
            profitLoss,
            totalBuyTZS,
            totalSellTZS
        };
    };

    const handleSaveOpening = async () => {
        try {
            const openingEntries = openingRows
                .filter(row => Number(row.amount) > 0 && row.currencyId)
                .map(row => ({
                    currency_id: row.currencyId,
                    amount: Number(row.amount),
                    exchange_rate: 1.0,
                    denomination: Number(row.amount),
                    quantity: 1
                }));

            if (openingEntries.length === 0) {
                setToast({ show: true, message: "Opening Vault balance is required.", type: "error" });
                return;
            }

            const payload = {
                openingEntries,
                notes: notes ? [notes] : [],
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
                setStep(2);
                setToast({ show: true, message: "Opening Balance Saved.", type: "success" });
                setTimeout(() => {
                    setToast(prev => ({ ...prev, show: false }));
                    navigate("/dashboard");
                }, 1000);
            } else {
                setToast({ show: true, message: "Failed to save Opening Balance", type: "error" });
            }

        } catch (error) {
            console.error("Save error:", error);
            setToast({ show: true, message: "Error saving data", type: "error" });
        }
    };


    const handleSaveClosing = async (isFinalizing = false) => {
        try {
            const closingEntries = closingRows
                .filter(row => Number(row.amount) > 0 && row.currencyId)
                .map(row => ({
                    currency_id: row.currencyId,
                    amount: Number(row.amount),
                    exchange_rate: 1.0,
                    denomination: Number(row.amount),
                    quantity: 1
                }));

            const { currencyData } = calculateTotals();
            let newStatus = status;

            // Only calculate new status if finalizing
            if (isFinalizing) {
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

                    if (tallied) newStatus = "Tallied";
                    else if (hasShort) newStatus = "Short";
                    else newStatus = "Excess";
                }
            }

            const payload = {
                closingEntries,
                notes: notes ? [notes] : [],
                status: newStatus
            };

            const result = await updateReconciliation(id, payload);

            if (result.success || result.data) {
                let toastMsg = "Closing Balance Saved";
                if (isFinalizing) {
                    if (newStatus === "Tallied") {
                        toastMsg = "Reconciliation Saved Successfully";
                    } else if (["Short", "Excess"].includes(newStatus)) {
                        toastMsg = `Reconciliation saved with ${newStatus}`;
                    }
                }
                setToast({ show: true, message: toastMsg, type: "success" });
                setHasSavedClosing(true);
                setTimeout(() => setToast(prev => ({ ...prev, show: false })), 1000);

                if (isFinalizing && ["Tallied", "Short", "Excess"].includes(newStatus)) {
                    setStatus(newStatus);
                    setTimeout(() => navigate("/dashboard"), 1500);
                } else {
                    setStatus(newStatus || status);
                    setTimeout(() => navigate("/dashboard"), 1500);
                }
            } else {
                setToast({ show: true, message: "Failed to save Closing Balance", type: "error" });
            }

        } catch (error) {
            console.error("Save error:", error);
            setToast({ show: true, message: "Error saving data", type: "error" });
        }
    };

    const { opTotal, clTotal, currencyData } = calculateTotals();

    const renderTable = (section, rows) => {
        const isOpening = section === "opening";

        // Locking Logic
        let isDisabled = false;

        const isReconStarted = status === "In_Progress";
        const isReconFinal = ["Tallied", "Short", "Excess"].includes(status);
        const hasSavedOpening = !!id;

        if (isOpening) {
            if (hasSavedOpening) isDisabled = true;
        } else {
            if (hasSavedClosing || isReconFinal) {
                isDisabled = true;
            }
        }

        return (
            <div className="bg-[#16191C] rounded-xl border border-[#2A2F33]/50 h-full">
                <div className="p-4 border-b border-[#2A2F33]/50 flex justify-between items-center">
                    <h2 className="text-[16px] font-medium flex items-center gap-2 text-white">
                        <div className={`w-1.5 h-4 rounded-full ${isOpening ? "bg-[#1D4CB5]" : "bg-[#82E890]"}`}></div>
                        {isOpening ? "Opening Balance" : "Closing Balance"}
                    </h2>

                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                        <thead>
                            <tr className="bg-[#1B1E21] text-[#8F8F8F] border-b border-[#2A2F33]/50">
                                <th className="px-3 py-3 w-[35%]">Currency</th>
                                <th className={`px-3 py-3 ${isDisabled ? 'w-[65%]' : 'w-[50%]'}`}>Amount</th>
                                {!isDisabled && <th className="px-3 py-3 w-[15%] text-center"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2F33]/30">
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-[#1E2328]/30 transition-colors">
                                    <td className="px-3 py-3">
                                        <Dropdown
                                            label="Select Currency"
                                            options={currencyOptions.filter(opt =>
                                                !rows.some(r => r.id !== row.id && r.currencyCode === opt.value)
                                            )}
                                            selected={row.currencyCode ? currencyOptions.find(o => o.value === row.currencyCode)?.label : ""}
                                            onChange={(opt) => handleCurrencyChange(section, row.id, opt)}
                                            buttonClassName="!bg-[#1A1F24] !border-[#4B5563]/30 !py-2 !text-sm"
                                            disabled={isDisabled}
                                        />
                                    </td>
                                    <td className="px-3 py-3">
                                        <input
                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => handleRowChange(section, row.id, "amount", e.target.value)}
                                            onKeyDown={(e) => ["-", "+", "e", "E"].includes(e.key) && e.preventDefault()}
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                            className="w-full bg-[#1A1F24] border border-[#4B5563]/30 rounded-lg px-3 py-2 text-white outline-none focus:border-[#1D4CB5] text-right font-medium disabled:opacity-50 text-sm"
                                            disabled={isDisabled}
                                        />
                                    </td>
                                    {!isDisabled && (
                                        <td className="px-2 py-3 text-center">
                                            {rows.length > 1 && (
                                                <button
                                                    onClick={() => removeRow(section, row.id)}
                                                    className="p-1.5 rounded-lg transition-all hover:bg-red-500/10 text-[#FF6B6B]"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>



                <div className="p-4 flex justify-between">
                    {!isDisabled && (
                        <button
                            onClick={() => addRow(section)}
                            className="bg-[#1D4CB5]/10 text-[#1D4CB5] px-3 py-1.5 rounded-lg text-[12px] transition-all border border-[#1D4CB5]/20 hover:bg-[#1D4CB5] hover:text-white"
                        >
                            + Add Row
                        </button>
                    )}
                    {isOpening && !isDisabled && (
                        <button
                            onClick={handleSaveOpening}
                            disabled={!rows.some(r => r.amount)}
                            className="bg-[#1D4CB5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2A5BD7]"
                        >
                            {id ? "Update" : "Save"}
                        </button>
                    )}
                    {!isOpening && !isDisabled && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSaveClosing(status === "In_Progress")}
                                disabled={isDisabled}
                                className="bg-[#1D4CB5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2A5BD7]"
                            >
                                Save & Reconcile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="">
            {/* HEADER */}
            <div className="flex flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-[20px] lg:text-[24px] font-semibold text-white">
                        {id ? "Reconciliation" : "Add Reconciliation"}
                    </h1>
                    <p className="text-[#8F8F8F] text-[13px] lg:text-[14px]">
                        {id ? "Review inventory movement and capture closing vault" : "Capture initial opening vault balances"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!id && (
                        <button
                            onClick={handleSaveOpening}
                            className="px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-semibold bg-[#1D4CB5] text-white hover:bg-[#2A5BD7] shadow-lg shadow-[#1D4CB5]/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Physical Cash: Opening Vault
                        </button>
                    )}
                    {id && !hasSavedClosing && status !== "Tallied" && (
                        <button
                            onClick={() => {
                                setShowClosingVault(true);
                                setStep(3);
                            }}
                            className="px-5 py-2 rounded-lg text-sm transition-all flex items-center gap-2 font-semibold bg-[#1D4CB5] text-white hover:bg-[#2A5BD7] shadow-lg shadow-[#1D4CB5]/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Physical Cash: Closing Vault
                        </button>
                    )}
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="transition-all animate-in fade-in slide-in-from-left-4 duration-500">
                    {renderTable("opening", openingRows)}
                </div>

                <div className="flex flex-col gap-4">
                    {(id || showClosingVault || ["Tallied", "Short", "Excess"].includes(status)) && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 h-full">
                            {renderTable("closing", closingRows)}
                        </div>
                    )}
                </div>
            </div>

            {/* Associated Deals Section */}
            {
                id && todayDeals && todayDeals.length > 0 && (
                    <div className="bg-[#16191C] rounded-xl border border-[#2A2F33]/50 p-4 mt-6">
                        <h2 className="text-[16px] font-medium mb-4 flex items-center gap-2 text-white">
                            <div className="w-1.5 h-4 bg-[#82E890] rounded-full"></div>
                            Associated Deals
                        </h2>
                        <DealsTable externalDeals={todayDeals} hideTitle={true} hideExport={true} />
                    </div>
                )
            }

            <Toast show={toast.show} message={toast.message} type={toast.type} onHide={() => setToast({ ...toast, show: false })} />
            {
                confirmModal.open && (
                    <NotificationCard
                        confirmModal={confirmModal}
                        onConfirm={confirmDelete}
                        onCancel={() => setConfirmModal({ ...confirmModal, open: false, target: null })}
                    />
                )
            }

            {
                isAddingCurrency && (
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
                )
            }

        </div >
    );
}