import { useState, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import editIcon from "../../assets/common/edit.svg";
import save from "../../assets/common/save.svg";
import Denomination from "../../components/deal/Denomination";
import { useNavigate, useParams } from "react-router-dom";
import { fetchDealById, updateDeal } from "../../api/deals";
import { fetchCurrencies } from "../../api/currency/currency";

export default function EditDeal() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [deal, setDeal] = useState(null);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);

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

    // Currencies data
    const [currencyOptions, setCurrencyOptions] = useState([]);
    const [currencyMap, setCurrencyMap] = useState({});
    const [currencySymbols, setCurrencySymbols] = useState({});
    const [loadingCurrencies, setLoadingCurrencies] = useState(false);

    const isPending = (deal?.status || "").toLowerCase() === "pending";
    const isEditable = isPending && editMode;

    // Calculate amount to be paid when amount or rate changes
    useEffect(() => {
        if (amount && rate && amount > 0 && rate > 0) {
            const calculatedAmount = parseFloat(amount) * parseFloat(rate);
            setAmountToBePaid(calculatedAmount.toFixed(2));
        } else {
            setAmountToBePaid("");
        }
    }, [amount, rate]);

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
            (dealData.received_items?.[0]?.currency?.name || "");

        const sellCurrencyFromResponse = dealData.sell_currency ||
            (dealData.paid_items?.[0]?.currency?.name || "");

        setBuyCurrency(buyCurrencyFromResponse);
        setSellCurrency(sellCurrencyFromResponse);

        console.log("Buy currency set to:", buyCurrencyFromResponse);
        console.log("Sell currency set to:", sellCurrencyFromResponse);

        setAmount(dealData.amount || "");
        setRate(dealData.rate || "");

        // Calculate amount to be paid if not provided
        if (dealData.amount && dealData.rate) {
            const calculated = parseFloat(dealData.amount) * parseFloat(dealData.rate);
            setAmountToBePaid(calculated.toFixed(2));
        } else {
            setAmountToBePaid(dealData.amount_to_be_paid || "");
        }

        setNotes(dealData.remarks || "");

        const received = dealData.received_items || [];
        const paid = dealData.paid_items || [];

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
            console.log("Received items:", deal.received_items);
            console.log("Paid items:", deal.paid_items);
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
        }
    };

    const handleCancelEdit = () => {
        if (deal) {
            populateFormFromDeal(deal);
        }
        setEditMode(false);
    };

    const handleSave = async () => {
        try {
            // Only send transaction_mode and paid_items in update
            const dealData = {
                // Only include transaction_mode and paid_items
                transaction_mode: txnMode.toLowerCase(),
                paid_items: denominationPaid
                    .filter((item) => item.price && item.quantity)
                    .map((item) => ({
                        price: String(item.price),
                        quantity: String(item.quantity),
                        currency_id: item.currency_id || currencyMap[sellCurrency],
                    })),
            };

            if (isEditable) {
                await updateDeal(id, dealData);
                setEditMode(false);
                navigate("/deals");
            }
        } catch (err) {
            console.error("Error updating deal:", err);
            setError("Failed to update deal");
        }
    };

    // Custom dropdown component with fixed width like CreateDeal
    const CustomDropdown = ({
        value,
        setValue,
        isOpen,
        setIsOpen,
        options,
        placeholder,
        loading = false,
        width = "172px",
        editable = false // Add editable prop
    }) => (
        <div className="relative">
            <button
                onClick={() => editable && setIsOpen(!isOpen)}
                className={`
                   w-[${width}]
                   h-10
                  bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#E3E3E3]
                  font-medium
                  flex items-center justify-between
                  px-4
                   
                    ${!editable ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                `}
                disabled={!editable}
            >
                <span className="truncate">{value || placeholder}</span>
                <img src={down} alt="down" className="w-3" />
            </button>

            {isOpen && editable && (
                <ul className={`
                    absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10 w-[${width}]                    
                `}>
                    {loading ? (
                        <li className="px-3 py-2 text-sm text-gray-300">
                            Loading...
                        </li>
                    ) : options.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-gray-300">
                            No options
                        </li>
                    ) : (
                        options.map((option) => (
                            <li
                                key={option}
                                onClick={() => {
                                    setValue(option);
                                    setIsOpen(false);
                                }}
                                className="
                                    px-4 py-2 
                        flex items-center justify-between
                        hover:bg-[#1E2328]
                        cursor-pointer
                        text-white
                                "
                            >
                                <span className="truncate">{option}</span>
                                {value === option && (
                                    <img src={tick} className="w-4 h-4" />
                                )}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );

    // Custom input component with fixed width like CreateDeal
    const CustomInput = ({
        value,
        onChange,
        placeholder,
        type = "text",
        readOnly = false,
        width = "167px"
    }) => (
        <input
            className={`
                w-[${width}]
                h-10
                bg-[#16191C]
                rounded-lg
                px-3
                text-white
                focus:outline-none
                
                text-[14px]
                ${!isEditable ? 'cursor-not-allowed opacity-70' : ''}
            `}
            placeholder={placeholder}
            type={type}
            min="0"
            step="0.01"
            value={value}
            onChange={onChange}
            readOnly={readOnly || !isEditable}
            disabled={readOnly || !isEditable}
        />
    );

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
                                className="flex items-center justify-center gap-2 w-[91px] h-[40px] rounded-[8px] bg-[#1D4CB5] text-white font-medium text-sm cursor-pointer hover:bg-blue-600 px-2"
                            >
                                <img src={save} className="w-5 h-5" alt="Save" />
                                Save
                            </button>
                        </>
                    )}

                    {!editMode && isPending && (
                        <button
                            onClick={handleStartEdit}
                            className="flex items-center justify-center w-[41px] h-[40px] rounded-[8px] bg-[#1D4CB5] text-white cursor-pointer hover:bg-blue-600"
                        >
                            <img src={editIcon} className="w-[41px] h-[40px]" alt="Edit" />
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
                                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none cursor-not-allowed opacity-70"
                                value={customerName}
                                disabled
                            />
                        </div>

                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white cursor-not-allowed opacity-70"
                                value={phoneNumber}
                                disabled
                            />
                        </div>
                    </div>

                    {/* Row 2 - All transaction fields in one line (like CreateDeal) */}
                    <div className="flex items-end gap-6 mt-6">
                        {/* Transaction Type - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Transaction Type <span className="text-red-500">*</span>
                            </label>
                            <CustomDropdown
                                value={txnType}
                                setValue={setTxnType}
                                isOpen={txnTypeOpen}
                                setIsOpen={setTxnTypeOpen}
                                options={["Buy", "Sell"]}
                                placeholder="Select"
                                editable={false} // Not editable
                            />
                        </div>

                        {/* Transaction Mode - EDITABLE */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Transaction Mode <span className="text-red-500">*</span>
                            </label>
                            <CustomDropdown
                                value={txnMode}
                                setValue={setTxnMode}
                                isOpen={txnModeOpen}
                                setIsOpen={setTxnModeOpen}
                                options={["Cash", "Credit"]}
                                placeholder="Select"
                                editable={isEditable} // Only editable in edit mode
                            />
                        </div>

                        {/* Buy Currency Type - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Buy Currency Type <span className="text-red-500">*</span>
                            </label>
                            <CustomDropdown
                                value={buyCurrency}
                                setValue={setBuyCurrency}
                                isOpen={buyCurrencyOpen}
                                setIsOpen={setBuyCurrencyOpen}
                                options={currencyOptions}
                                placeholder="Select"
                                loading={loadingCurrencies}
                                editable={false} // Not editable
                            />
                        </div>

                        {/* Amount - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Amount <span className="text-red-500">*</span>
                            </label>
                            <CustomInput
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                type="text"
                                readOnly={true} // Always read-only
                            />
                        </div>

                        {/* Sell Currency Type - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Sell Currency Type <span className="text-red-500">*</span>
                            </label>
                            <CustomDropdown
                                value={sellCurrency}
                                setValue={setSellCurrency}
                                isOpen={sellCurrencyOpen}
                                setIsOpen={setSellCurrencyOpen}
                                options={currencyOptions}
                                placeholder="Select"
                                loading={loadingCurrencies}
                                editable={false} // Not editable
                            />
                        </div>

                        {/* Rate - NOT editable */}
                        <div>
                            <label className="text-[#ABABAB] text-sm mb-1 block">
                                Rate <span className="text-red-500">*</span>
                            </label>
                            <CustomInput
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                placeholder="0.00"
                                type="text"
                                readOnly={true} // Always read-only
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
                        <div className={!isEditable ? "pointer-events-none opacity-70" : ""}>
                            <Denomination
                                denominationReceived={denominationReceived}
                                setDenominationReceived={setDenominationReceived}
                                denominationPaid={denominationPaid}
                                setDenominationPaid={setDenominationPaid}
                                receivedCurrency={buyCurrency}
                                paidCurrency={sellCurrency}
                                currencySymbols={currencySymbols}
                                isEditable={isEditable}
                                // Denomination Received is ALWAYS read-only after creation
                                receivedReadOnly={true}
                                // Denomination Paid is editable only in edit mode for pending deals
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
                                cursor-not-allowed opacity-70
                            `}
                            placeholder="Add any additional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={true} // Always disabled
                        />
                    </div>

                </div>
            )}
        </>
    );
}