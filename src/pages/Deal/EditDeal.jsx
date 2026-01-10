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
        return (
            Math.abs(totalReceived() - Number(amount)) <= tolerance &&
            Math.abs(totalPaid() - Number(amountToBePaid)) <= tolerance
        );
    };


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
                        map[c.name] = c.id;
                        symbols[c.name] = c.symbol || "";
                    });

                    setCurrencyOptions(data.map((c) => c.name));
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

    const populateFormFromDeal = (dealData) => {
        console.log("Deal data received:", dealData); // For debugging

        setCustomerName(dealData.customer?.name || "");
        setPhoneNumber(dealData.customer?.phone_number || "");
        setTxnType(dealData.deal_type === "buy" ? "Buy" : "Sell");
        setTxnMode(dealData.transaction_mode === "cash" ? "Cash" : "Credit");

        // Set buy and sell currencies from the API response
        // Try to get from direct fields first, then from items
        const buyCurrencyFromResponse = dealData.buy_currency ||
            (dealData.receivedItems?.[0]?.currency?.code || "");

        const sellCurrencyFromResponse = dealData.sell_currency ||
            (dealData.paidItems?.[0]?.currency?.code || "");

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
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 0,
                total: Number(item.total) || 0,
                currency_id: item.currency_id,
                currency_name: item.currency?.name || ""
            }))
            : [{ price: 0, quantity: 0, total: 0, currency_id: 1 }];

        const formattedPaid = paid.length > 0
            ? paid.map(item => ({
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 0,
                total: Number(item.total) || 0,
                currency_id: item.currency_id,
                currency_name: item.currency?.name || ""
            }))
            : [{ price: 0, quantity: 0, total: 0, currency_id: 1 }];

        setDenominationReceived(formattedReceived);
        setDenominationPaid(formattedPaid);
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

        const tallied = checkTally();

        setConfirmModal({
            open: true,
            actionType: tallied ? "confirm" : "delete", // ✅ THIS FIXES ICON
            title: tallied
                ? "Deal Tallied Successfully"
                : "Deal Not Tallied",
            message: tallied
                ? "The deal has been tallied. Do you want to proceed?"
                : "The deal is not tallied. Please review before proceeding.",
            confirmText: tallied ? "Confirm" : "Review",
            cancelText: "No",
            isTallied: tallied,
        });
    };


    const updateDealTransaction = async (status) => {
        try {
            const dealData = {
                deal_type: txnType.toLowerCase(),
                transaction_mode: txnMode.toLowerCase(),
                amount: Number(amount),
                exchange_rate: Number(rate),
                amount_to_be_paid: Number(amountToBePaid),
                remarks: notes,
                status,

                receivedItems: denominationReceived
                    .filter(i => i.price && i.quantity)
                    .map(i => ({
                        price: String(i.price),
                        quantity: String(i.quantity),
                        total: String(i.total || (Number(i.price) * Number(i.quantity))),
                        currency_id: i.currency_id || currencyMap[buyCurrency],
                    })),

                paidItems: denominationPaid
                    .filter(i => i.price && i.quantity)
                    .map(i => ({
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
                            status === "Completed"
                                ? "Deal completed successfully"
                                : "Deal updated successfully",
                        type: status === "Completed" ? "success" : "pending",
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
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-[16px] font-medium text-white">
                        Deal ID - {deal?.deal_number || id || "Loading..."}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {editMode && (
                        <>
                            <button
                                className="w-[95px] h-10 rounded-lg border border-white text-white font-medium text-sm flex items-center justify-center px-3 py-2 cursor-pointer hover:bg-white hover:text-black"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                className="flex items-center justify-center gap-2 w-[91px] h-10 rounded-lg bg-[#1D4CB5] text-white font-medium text-sm cursor-pointer hover:bg-blue-600 px-2"
                            >
                                <img src={save} className="w-5 h-5" alt="Save" />
                                Save
                            </button>
                        </>
                    )}

                    {!editMode && isPending && (
                        <button
                            onClick={handleStartEdit}
                            className="flex items-center justify-center w-[41px] h-10 rounded-lg bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                        >
                            <img src={editIcon} className="w-[41px] h-10" alt="Edit" />
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
                <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl">

                    {/* Row 1 - Customer Name & Phone */}
                    <div className="grid grid-cols-2 gap-6">
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

                    {/* Row 2 - All transaction fields in one line (like CreateDeal) */}
                    <div className="flex items-end gap-6 mt-6">
                        {/* Transaction Type - NOT editable */}
                        <div className="w-[190px]">
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Transaction Type <span className="text-red-500">*</span>
                            </label>
                            <div
                                className={`w-[190px] h-9 bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none cursor-not-allowed ${dimOnEdit}`}>                                {txnType}
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
                                className="w-[172px]"
                                disabled={!isEditable}
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
                                onChange={() => {}}
                                className={`w-[172px] ${dimOnEdit}`}
                                disabled
                            />
                        </div>

                        {/* Amount - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-[167px] h-9 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
                                placeholder="0.00"
                                type="text"
                                value={amount}
                                readOnly={!isEditable}
                                onChange={(e) => {
                                    const newAmount = e.target.value;
                                    setAmount(newAmount);
                                    setAmountEdited(newAmount !== originalAmount);
                                }}
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
                                onChange={() => {}}
                                className={`w-[172px] ${dimOnEdit}`}
                                disabled
                            />
                        </div>

                        {/* Rate - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Rate <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-[167px] h-9 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
                                placeholder="0.00"
                                type="text"
                                value={rate}
                                readOnly={!isEditable}
                                onChange={(e) => setRate(e.target.value)}
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
                            Amount to be Paid
                        </span>

                        {/* Right side */}
                        <span className="text-white text-[14px]">
                            {amountToBePaid || "0.00"}
                        </span>
                    </div>
                    {/* Denomination Section */}

                    <div className="mt-8">
                        <div className={!isEditable ? "pointer-events-none" : ""}>
                            <Denomination
                                denominationReceived={denominationReceived}
                                setDenominationReceived={setDenominationReceived}
                                denominationPaid={denominationPaid}
                                setDenominationPaid={setDenominationPaid}
                                receivedCurrency={buyCurrency}
                                paidCurrency={sellCurrency}
                                currencySymbols={currencySymbols}
                                receivedReadOnly={!amountEdited}
                                paidReadOnly={!isEditable}
                            />
                        </div>
                    </div>

                    {/* Notes - NOT editable */}
                    <div className="mt-8">
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
                            placeholder="Add any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={true} // Always disabled
                        />
                    </div>

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