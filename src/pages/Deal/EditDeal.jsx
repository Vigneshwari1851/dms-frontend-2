import { useState, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/Common/tick.svg";
import editIcon from "../../assets/Common/edit.svg";
import save from "../../assets/Common/save.svg";
import Denomination from "../../components/deal/Denomination";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDealById, updateDeal } from "../../api/deals";
import { fetchCurrencies } from "../../api/currency/currency";
import NotificationCard from "../../components/common/Notification";
import Dropdown from "../../components/common/Dropdown";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import installmentIcon from "../../assets/installment.svg";

const PaymentHistory = ({ title, items, currency, onAdd, onRemove, onChange, editable, currencySymbols }) => {
    return (
        <div className="mt-8 pb-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-white font-semibold text-lg">{title}</h3>
                    <p className="text-[#ABABAB] text-xs mt-1">Track installments and historical records</p>
                </div>
                {editable && (
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-[#1D4CB5] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                    >
                        <PlusIcon className="w-4 h-4" /> Add Installment
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {items.length === 0 ? (
                    <div className="bg-[#1A1F24] border border-dashed border-[#2A2F34] rounded-2xl p-4 text-center">
                        <div className="bg-[#2A2F34] w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src={installmentIcon} alt="installmentIcon" />
                        </div>
                        <p className="text-[#8F8F8F] font-medium">Ready to track installments</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#1A1F24] border border-[#2A2F34] rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#1D4CB588] transition-all duration-300 group relative shadow-sm hover:shadow-md"
                        >
                            <div className="flex flex-col">
                                <span className="text-[#ABABAB] text-[10px] uppercase tracking-[0.1em] mb-2 font-bold">Installment Amount</span>
                                {editable && !item.id ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={item.price || ""}
                                                onChange={(e) => onChange(index, "price", e.target.value)}
                                                className="bg-[#16191C] border border-[#2A2F34] rounded-xl px-4 py-3 text-white w-44 focus:outline-none focus:border-[#1D4CB5] text-xl font-bold transition-all"
                                            />
                                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                <span className="text-[#8F8F8F] font-bold text-sm tracking-tighter">{currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-white text-2xl font-black tracking-tight">
                                            {Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                        <span className="text-[#1D4CB5] text-sm font-black italic">{currency}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:items-end">
                                <span className="text-[#ABABAB] text-[10px] uppercase tracking-[0.1em] mb-2 font-bold sm:text-right">Time of Record</span>
                                <div className="flex items-center gap-2.5 bg-[#16191C] px-4 py-2 rounded-xl border border-[#2A2F34] shadow-inner">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.id ? 'bg-[#92B4FF]' : 'bg-green-500 animate-pulse'}`}></div>
                                    <span className="text-[#E0E0E0] text-[11px] font-semibold tracking-wide">
                                        {item.created_at ? new Date(item.created_at).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : "Pending sync..."}
                                    </span>
                                </div>
                            </div>

                            {editable && !item.id && (
                                <button
                                    onClick={() => onRemove(index)}
                                    className="absolute -top-2 -right-2 bg-[#FF4B4B] text-white p-1.5 rounded-full shadow-xl opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 hover:bg-red-600 active:scale-90"
                                >
                                    <XMarkIcon className="w-4 h-4 stroke-[3]" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


export default function EditDeal() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState(null);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const dimOnEdit = editMode ? "opacity-50" : "";

    // Form States
    const [customerName, setCustomerName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [denominationReceived, setDenominationReceived] = useState([]);
    const [denominationPaid, setDenominationPaid] = useState([]);

    // Dropdown States
    const [txnType, setTxnType] = useState("");
    const [txnTypeOpen, setTxnTypeOpen] = useState(false);

    const [txnMode, setTxnMode] = useState("");
    const [txnModeOpen, setTxnModeOpen] = useState(false);

    // New Currency Fields
    const [buyCurrency, setBuyCurrency] = useState("");
    const [buyCurrencyOpen, setBuyCurrencyOpen] = useState(false);
    const [sellCurrency, setSellCurrency] = useState("");
    const [sellCurrencyOpen, setSellCurrencyOpen] = useState(false);

    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("");
    const [amountToBePaid, setAmountToBePaid] = useState("");
    const [notes, setNotes] = useState("");
    const [enableDenomination, setEnableDenomination] = useState(true);
    const [manualReceivedTotal, setManualReceivedTotal] = useState("");
    const [manualPaidTotal, setManualPaidTotal] = useState("");
    const [amountEdited, setAmountEdited] = useState(false);
    const [originalAmount, setOriginalAmount] = useState("");

    // Currencies data
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [currencySymbols, setCurrencySymbols] = useState({});
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);

    const isPending = (deal?.status || "").toLowerCase() === "pending";
    const isEditable = isPending && editMode;

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        confirmText: "",
        cancelText: "Cancel",
        isTallied: false,
    });

    const totalReceived = () =>
        denominationReceived.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
            0
        );

    const totalPaid = () =>
        denominationPaid.reduce(
            (sum, item) =>
                sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
            0
        );

    const checkTally = () => {
        const tolerance = 0.01;
        const currentReceivedTotal = enableDenomination ? totalReceived() : Number(manualReceivedTotal);
        const currentPaidTotal = enableDenomination ? totalPaid() : Number(manualPaidTotal);

        const receivedMatches = Math.abs(currentReceivedTotal - Number(amount)) <= tolerance;
        const paidMatches = Math.abs(currentPaidTotal - Number(amountToBePaid)) <= tolerance;

        // For Cash/Credit, we don't strictly require both sides if we are split tracking
        // Just require the relevant side matches the target
        const relevantMatch = txnType?.toLowerCase() === "buy" ? receivedMatches : paidMatches;

        if (txnMode?.toLowerCase() === "cash") return true;
        return relevantMatch;
    };

    const tolerance = 0.01;

    const expectedReceived = Number(amount);
    const expectedPaid = Number(amountToBePaid);

    const effectiveReceivedTotal = enableDenomination ? totalReceived() : Number(manualReceivedTotal);
    const effectivePaidTotal = enableDenomination ? totalPaid() : Number(manualPaidTotal);

    const isReceivedTallied =
        expectedReceived > 0 &&
        Math.abs(effectiveReceivedTotal - expectedReceived) <= tolerance;

    const isPaidTallied =
        expectedPaid > 0 &&
        Math.abs(effectivePaidTotal - expectedPaid) <= tolerance;

    const isFullyTallied = txnType?.toLowerCase() === "buy" ? isPaidTallied : isReceivedTallied;

    // Fetch currencies on component mount
    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                setLoadingCurrencies(true);
                const data = await fetchCurrencies({ page: 1, limit: 100 });
                if (data && data.length > 0) {
                    const map = {};
                    const symbols = {};
                    data.forEach((c) => {
                        map[c.code] = c.id;
                        symbols[c.code] = c.symbol || "";
                    });

                    setCurrencyOptions(data.map((c) => c.code));
                    setCurrencyMap(map);
                    setCurrencySymbols(symbols);
                }
            } catch (error) {
                console.error("Error fetching currencies:", error);
            } finally {
                setLoadingCurrencies(false);
            }
        };

        loadCurrencies();
    }, []);

    const handleAddReceivedSplit = () => {
        setDenominationReceived([...denominationReceived, { price: "", quantity: 1, total: 0, currency_id: currencyMap[buyCurrency] }]);
    };

    const handleRemoveReceivedSplit = (index) => {
        setDenominationReceived(denominationReceived.filter((_, i) => i !== index));
    };

    const handleChangeReceivedSplit = (index, field, value) => {
        const newItems = [...denominationReceived];
        newItems[index][field] = value;
        if (field === "price") {
            newItems[index].total = Number(value);
        }
        setDenominationReceived(newItems);
    };

    const handleAddPaidSplit = () => {
        setDenominationPaid([...denominationPaid, { price: "", quantity: 1, total: 0, currency_id: currencyMap[sellCurrency] }]);
    };

    const handleRemovePaidSplit = (index) => {
        setDenominationPaid(denominationPaid.filter((_, i) => i !== index));
    };

    const handleChangePaidSplit = (index, field, value) => {
        const newItems = [...denominationPaid];
        newItems[index][field] = value;
        if (field === "price") {
            newItems[index].total = Number(value);
        }
        setDenominationPaid(newItems);
    };

    const populateFormFromDeal = (dealData) => {
        console.log("Deal data received:", dealData); // For debugging

        setCustomerName(dealData.customer?.name || "");
        setPhoneNumber(dealData.customer?.phone_number || "");
        setTxnType(dealData.deal_type === "buy" ? "Buy" : "Sell");
        setTxnMode(dealData.transaction_mode === "cash" ? "Cash" : "Credit");

        // Set buy and sell currencies from the API response
        // Try to get from direct fields first, then from items
        const buyCurrencyFromResponse = dealData.buy_currency ||
            (dealData.buyCurrency?.code || "");

        const sellCurrencyFromResponse = dealData.sell_currency ||
            (dealData.sellCurrency?.code || "");

        setBuyCurrency(buyCurrencyFromResponse);
        setSellCurrency(sellCurrencyFromResponse);

        console.log("Buy currency set to:", buyCurrencyFromResponse);
        console.log("Sell currency set to:", sellCurrencyFromResponse);

        setAmount(dealData.amount || "");
        setRate(dealData.exchange_rate || dealData.rate || "");

        setAmountToBePaid(dealData.amount_to_be_paid || "0.00");
        setAmount(dealData.amount || "");
        setOriginalAmount(String(dealData.amount || ""));

        setNotes(dealData.remarks || "");

        const received = dealData.receivedItems || [];
        const paid = dealData.paidItems || [];

        const formattedReceived = received.length > 0
            ? received.map(item => ({
                id: item.id,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 0,
                total: Number(item.total) || 0,
                currency_id: item.currency_id,
                currency_name: item.currency?.name || "",
                created_at: item.created_at
            }))
            : [];

        const formattedPaid = paid.length > 0
            ? paid.map(item => ({
                id: item.id,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 0,
                total: Number(item.total) || 0,
                currency_id: item.currency_id,
                currency_name: item.currency?.name || "",
                created_at: item.created_at
            }))
            : [];

        setDenominationReceived(formattedReceived);
        setDenominationPaid(formattedPaid);

        // Pre-fill manual totals from existing denominations
        setManualReceivedTotal(formattedReceived.reduce((s, i) => s + (i.total || 0), 0));
        setManualPaidTotal(formattedPaid.reduce((s, i) => s + (i.total || 0), 0));
    };

    useEffect(() => {
        if (deal) {
            console.log("Full deal object:", deal);
            console.log("Buy currency field:", deal.buy_currency);
            console.log("Sell currency field:", deal.sell_currency);
            console.log("Received items:", deal.receivedItems);
            console.log("Paid items:", deal.paidItems);
        }
    }, [deal]);

    // Fetch deal data on mount
    useEffect(() => {
        const loadDeal = async () => {
            try {
                setLoading(true);
                const response = await fetchDealById(id);

                if (!response.success) {
                    setError("Failed to load deal data");
                    setLoading(false);
                    return;
                }

                const dealData = response.data.data || response.data;
                setDeal(dealData);

                // Wait for currencies to load before populating form
                if (currencyOptions.length > 0) {
                    populateFormFromDeal(dealData);
                } else {
                    // If currencies not loaded yet, set a small delay
                    setTimeout(() => populateFormFromDeal(dealData), 100);
                }

                setEditMode(false);
                setError(null);
            } catch (err) {
                console.error("Error fetching deal:", err);
                setError("Failed to load deal data");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDeal();
        }
    }, [id, currencyOptions]);

    useEffect(() => {
        if (amount && rate) {
            let calculated = 0;
            if (txnType?.toLowerCase() === "sell") {
                calculated = parseFloat(amount) / parseFloat(rate);
            } else {
                calculated = parseFloat(amount) * parseFloat(rate);
            }
            setAmountToBePaid(calculated.toFixed(2));
        }
    }, [amount, rate, txnType]);

    const handleStartEdit = () => {
        if (isPending) {
            setEditMode(true);
            setAmountEdited(false);
        }
    };

    const handleCancelEdit = () => {
        if (deal) {
            populateFormFromDeal(deal);
        }
        setEditMode(false);
    };

    const handleSave = () => {
        if (!isEditable) return;

        // Automatic status logic: 
        // Cash -> Completed
        // Credit -> Pending
        if (txnMode?.toLowerCase() === "cash") {
            updateDealTransaction('Completed');
            return;
        }
        if (txnMode?.toLowerCase() === "credit") {
            updateDealTransaction('Pending');
            return;
        }

        const isSavable = checkTally();
        const isFullyTallied = isReceivedTallied && isPaidTallied;

        setConfirmModal({
            open: true,
            actionType: isFullyTallied ? "confirm" : "delete",
            title: isFullyTallied ? "Deal Tallied Successfully" : "Deal Not Tallied",
            message: isFullyTallied
                ? "The deal has been fully tallied and will be marked as Completed. Do you want to proceed?"
                : isSavable
                    ? "Since the received amount is missing/optional, the deal will be saved as Pending. Do you want to proceed?"
                    : "The required denominations are not tallied. Please review before proceeding.",
            confirmText: isSavable ? "Confirm" : "Review",
            cancelText: "No",
            isTallied: isSavable,
        });
    };


    const updateDealTransaction = async (status) => {
        try {
            const currentReceivedTotal = enableDenomination ? totalReceived() : Number(manualReceivedTotal);
            const currentPaidTotal = enableDenomination ? totalPaid() : Number(manualPaidTotal);

            const expectedReceived = Number(amount);
            const expectedPaid = Number(amountToBePaid);

            const sideReceivedMatches = Math.abs(currentReceivedTotal - expectedReceived) <= 0.01;
            const sidePaidMatches = Math.abs(currentPaidTotal - expectedPaid) <= 0.01;

            let finalStatus = status;
            const matchesRelevantSide = txnType?.toLowerCase() === "buy" ? sidePaidMatches : sideReceivedMatches;

            if (matchesRelevantSide) {
                finalStatus = "Completed";
            } else if (txnMode.toLowerCase() === "cash") {
                finalStatus = "Completed";
            } else {
                finalStatus = "Pending";
            }

            const dealData = {
                deal_type: txnType.toLowerCase(),
                transaction_mode: txnMode.toLowerCase(),
                amount: Number(amount),
                exchange_rate: Number(rate),
                amount_to_be_paid: Number(amountToBePaid),
                buy_currency: buyCurrency,
                buy_currency_id: currencyMap[buyCurrency],
                sell_currency: sellCurrency,
                sell_currency_id: currencyMap[sellCurrency],
                remarks: notes,
                status: finalStatus,

                receivedItems: denominationReceived
                    .filter(i => (i.price !== "" && i.price !== null && i.price !== undefined) && (i.quantity !== "" && i.quantity !== null && i.quantity !== undefined))
                    .map(i => ({
                        id: i.id,
                        price: String(i.price),
                        quantity: String(i.quantity),
                        total: String(i.total || (Number(i.price) * Number(i.quantity))),
                        currency_id: i.currency_id || currencyMap[buyCurrency],
                    })),

                paidItems: denominationPaid
                    .filter(i => (i.price !== "" && i.price !== null && i.price !== undefined) && (i.quantity !== "" && i.quantity !== null && i.quantity !== undefined))
                    .map(i => ({
                        id: i.id,
                        price: String(i.price),
                        quantity: String(i.quantity),
                        total: String(i.total || (Number(i.price) * Number(i.quantity))),
                        currency_id: i.currency_id || currencyMap[sellCurrency],
                    })),
            };

            await updateDeal(id, dealData);
            navigate("/deals", {
                state: {
                    toast: {
                        message:
                            finalStatus === "Completed"
                                ? "Deal completed successfully"
                                : "Deal updated successfully",
                        type: finalStatus === "Completed" ? "success" : "pending",
                    },
                },
            });
        } catch (err) {
            console.error("Error updating deal:", err);
            setError("Failed to update deal");
        }
    };

    const handleModalConfirm = () => {
        if (confirmModal.isTallied) {
            // Confirm → Completed
            updateDealTransaction("Completed");
        } else {
            // Review → just close modal
            setConfirmModal({ ...confirmModal, open: false });
        }
    };

    const handleModalCancel = () => {
        if (confirmModal.isTallied) {
            // No → still Completed
            updateDealTransaction("Completed");
        } else {
            // No → Pending
            updateDealTransaction("Pending");
        }
    };

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4 lg:gap-0">
                <div className="flex items-center justify-between w-full lg:w-auto">
                    <h2 className="text-[16px] lg:text-[18px] font-medium text-white">
                        Deal ID - {deal?.deal_number || id || "Loading..."}
                    </h2>

                    {/* Mobile Only: Edit Pencil (only when not in edit mode) */}
                    <div className="lg:hidden flex items-center gap-2">
                        {!editMode && isPending && (
                            <button
                                onClick={handleStartEdit}
                                className="p-1 hover:bg-[#2A2F34] rounded-lg transition-colors bg-[#1D4CB5]"
                            >
                                <img src={editIcon} className="w-6 h-6" alt="Edit" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-3 w-full lg:w-auto justify-end">
                    {editMode && (
                        <div className="hidden lg:flex items-center gap-2 w-full lg:w-auto justify-end">
                            {/* Desktop Buttons */}
                            <button
                                className="w-[95px] h-10 rounded-lg border border-white text-white font-medium text-sm flex items-center justify-center px-3 py-2 cursor-pointer hover:bg-white hover:text-black"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="w-[91px] h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1D4CB5] text-white font-medium text-sm cursor-pointer hover:bg-blue-600 px-3"
                            >
                                Save
                            </button>
                        </div>
                    )}

                    {!editMode && isPending && (
                        /* Desktop Only: Edit Icon button */
                        <button
                            onClick={handleStartEdit}
                            className="hidden lg:flex w-full lg:w-[41px] h-10 items-center justify-center gap-2 rounded-lg bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                        >
                            <img src={editIcon} className="lg:w-[41px] lg:h-10" alt="Edit" />
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-[#1A1F24] p-6 rounded-xl text-center text-white">
                    <p>Loading deal data...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-[#1A1F24] p-6 rounded-xl border border-red-500 text-red-500">
                    <p>{error}</p>
                </div>
            )}

            {/* Form Container */}
            {!loading && (
                <div className="mt-4 bg-[#1A1F24] p-4 lg:p-6 rounded-xl">

                    {/* Row 1 - Customer Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none cursor-not-allowed ${dimOnEdit}`}
                                value={customerName}
                                disabled
                            />
                        </div>

                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none cursor-not-allowed ${dimOnEdit}`}
                                value={phoneNumber}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Row 2 - Transaction fields (Responsive Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6 mt-6">
                        {/* Transaction Type - NOT editable */}
                        <div className="w-full">
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Transaction Type <span className="text-red-500">*</span>
                            </label>
                            <div
                                className={`w-full h-9 bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none cursor-not-allowed ${dimOnEdit}`}>                                {txnType}
                            </div>
                        </div>

                        {/* Transaction Mode - EDITABLE */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Transaction Mode <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                label="Mode"
                                options={["Cash", "Credit"]}
                                selected={txnMode}
                                onChange={(val) => setTxnMode(val)}
                                className="w-full"
                                disabled={true}
                            />
                        </div>

                        {/* Buy Currency Type - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Buy Currency Type <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                label="Buy Currency"
                                options={currencyOptions}
                                selected={buyCurrency}
                                onChange={() => { }}
                                className="w-full"
                                disabled={true}
                            />
                        </div>

                        {/* Amount - EDITABLE if Pending */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Buy Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full h-9 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none ${!isEditable ? "cursor-not-allowed opacity-70" : ""}`}
                                placeholder="0.00"
                                type="text"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                readOnly={!isEditable}
                            />
                        </div>

                        {/* Sell Currency Type - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Sell Currency Type <span className="text-red-500">*</span>
                            </label>
                            <Dropdown
                                label="Sell Currency"
                                options={currencyOptions}
                                selected={sellCurrency}
                                onChange={() => { }}
                                className="w-full"
                                disabled={true}
                            />
                        </div>

                        {/* Rate - EDITABLE if Pending */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full h-9 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none ${!isEditable ? "cursor-not-allowed opacity-70" : ""}`}
                                placeholder="0.00"
                                type="text"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                readOnly={!isEditable}
                            />
                        </div>
                    </div>

                    {/* Row 3 - Amount to be Paid (full width, below the transaction fields) */}
                    <div
                        className="
    w-full
    h-[37px]
    bg-[#5761D738]
    rounded-lg
    px-3
    mt-5
    flex
    items-center
    justify-between
    border border-transparent
  "
                    >
                        {/* Left side */}
                        <span className="text-[#FEFEFE] text-sm">
                            Sell Amount
                        </span>

                        {/* Right side */}
                        <span className="text-white text-[14px]">
                            {currencySymbols[sellCurrency] || sellCurrency} {Number(amountToBePaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>

                    {/* Split Payments History - Conditional */}
                    {txnMode?.toLowerCase() !== "cash" && (
                        <div className="mt-4 space-y-6">
                            {/* Balance Display */}
                            <div className="bg-[#1A1F24] border border-[#2A2F34] rounded-xl p-4 flex justify-between items-center">
                                <span className="text-[#ABABAB] text-sm">Remaining Balance</span>
                                <span className={`text-lg font-bold ${(Number(amountToBePaid) - (txnType?.toLowerCase() === "buy" ? totalPaid() : totalReceived())) > 0.01 ? "text-[#FF6B6B]" : "text-[#82E890]"}`}>
                                    {currencySymbols[txnType?.toLowerCase() === "buy" ? sellCurrency : buyCurrency]} {Math.max(0, Number(amountToBePaid) - (txnType?.toLowerCase() === "buy" ? totalPaid() : totalReceived())).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {txnType?.toLowerCase() === "buy" ? (
                                <PaymentHistory
                                    title="Payments Paid History"
                                    items={denominationPaid}
                                    currency={sellCurrency}
                                    editable={editMode}
                                    onAdd={handleAddPaidSplit}
                                    onRemove={handleRemovePaidSplit}
                                    onChange={handleChangePaidSplit}
                                    currencySymbols={currencySymbols}
                                />
                            ) : (
                                <PaymentHistory
                                    title="Payments Received History"
                                    items={denominationReceived}
                                    currency={buyCurrency}
                                    editable={editMode}
                                    onAdd={handleAddReceivedSplit}
                                    onRemove={handleRemoveReceivedSplit}
                                    onChange={handleChangeReceivedSplit}
                                    currencySymbols={currencySymbols}
                                />
                            )}
                        </div>
                    )}

                    {/* Notes - NOT editable */}
                    <div className="mt-6">
                        <label className="block text-[#ABABAB] text-[14px] mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            className={`
                                w-full bg-[#16191C] rounded-lg 
                                p-3 h-24 text-white
                                placeholder:text-[#ABABAB]
                                font-poppins
                                cursor-not-allowed
                            `}
                            // placeholder="Add any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={true} // Always disabled
                        />
                    </div>

                    {/* Mobile Action Buttons (sticky at bottom, same line) */}
                    {editMode && (
                        <div className="lg:hidden bottom-4 flex justify-between items-center mt-6">
                            <button
                                onClick={handleCancelEdit}
                                className="w-[120px] h-10 rounded-lg border border-white text-white font-medium text-sm flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="w-[120px] h-10 rounded-lg bg-[#1D4CB5] text-white font-medium text-sm flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    )}



                </div>
            )}

            <NotificationCard
                confirmModal={confirmModal}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
            />


        </>
    );
}