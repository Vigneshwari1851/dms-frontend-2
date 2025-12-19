import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import plus from "../../assets/common/save.svg";
import Denomination from "../../components/deal/Denomination";
import NotificationCard from "../../components/common/Notification";
import { createDeal } from "../../api/deals";
import { searchCustomers } from "../../api/customers";
import { fetchCurrencies } from "../../api/currency/currency";

export default function CreateDeal() {
  const navigate = useNavigate();

  // Form State
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [txnType, setTxnType] = useState("");
  const [txnTypeOpen, setTxnTypeOpen] = useState(false);
  const [txnMode, setTxnMode] = useState("");
  const [txnModeOpen, setTxnModeOpen] = useState(false);
  const [buyCurrency, setBuyCurrency] = useState("");
  const [buyCurrencyOpen, setBuyCurrencyOpen] = useState(false);
  const [sellCurrency, setSellCurrency] = useState("");
  const [sellCurrencyOpen, setSellCurrencyOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [amountToBePaid, setAmountToBePaid] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});

  // Currencies list
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencyMap, setCurrencyMap] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const [denominationReceived, setDenominationReceived] = useState([
    { price: 0, quantity: 0, currency_id: 1 },
  ]);
  const [denominationPaid, setDenominationPaid] = useState([
    { price: 0, quantity: 0, total: 0, currency_id: 1 },
  ]);

  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Add state for confirmation modal
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    actionType: '',
    title: '',
    message: '',
    confirmText: '',
    cancelText: 'Cancel',
    isTallied: false // Track if deal is tallied
  });

  // Fetch currencies on component mount
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const data = await fetchCurrencies({ page: 1, limit: 100 });
        if (data && data.length > 0) {
          const map = {};
          const symbols = {};
          const codes = [];
          data.forEach((c) => {
            map[c.code] = c.id;
            symbols[c.code] = c.symbol || "";
            codes.push(c.code);
          });

          setCurrencyOptions(codes);
          setCurrencyMap(map);
          setCurrencySymbols(symbols);

          if (!buyCurrency && map["USD"]) {
            setBuyCurrency("USD");
          }

          if (!sellCurrency && map["TZS"]) {
            setSellCurrency("TZS");
          }
        }
      } catch (error) {
        console.error("Error fetching currencies:", error);
        showToast("Failed to load currencies", "error");
      } finally {
        setLoadingCurrencies(false);
      }
    };

    loadCurrencies();
  }, []);

  // Calculate amount to be paid when amount or rate changes
  useEffect(() => {
    if (amount && rate && amount > 0 && rate > 0) {
      const calculatedAmount = parseFloat(amount) / parseFloat(rate);
      setAmountToBePaid(calculatedAmount.toFixed(2));
    } else {
      setAmountToBePaid(0);
    }
  }, [amount, rate]);

  // Calculate total received denominations
  const calculateTotalReceived = () => {
    return denominationReceived.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Calculate total paid denominations
  const calculateTotalPaid = () => {
    return denominationPaid.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Check if denomination totals match
  const checkDenominationTally = () => {
    const totalReceived = calculateTotalReceived();
    const totalPaid = calculateTotalPaid();
    const expectedAmount = parseFloat(amount) || 0;
    const expectedPaidAmount = parseFloat(amountToBePaid) || 0;
    const tolerance = 0.01;

    const receivedMatches = Math.abs(totalReceived - expectedAmount) <= tolerance;
    const paidMatches = Math.abs(totalPaid - expectedPaidAmount) <= tolerance;

    return receivedMatches && paidMatches;
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedCustomer?.id) {
      newErrors.customer = "Please select a customer";
    }

    if (!txnType) {
      newErrors.txnType = "Transaction type is required";
    }

    if (!txnMode) {
      newErrors.txnMode = "Transaction mode is required";
    }

    if (!buyCurrency) {
      newErrors.buyCurrency = "Buy currency type is required";
    }

    if (!sellCurrency) {
      newErrors.sellCurrency = "Sell currency type is required";
    }

    if (!amount || amount <= 0) {
      newErrors.amount = "Enter a valid amount";
    }

    if (!rate || rate <= 0) {
      newErrors.rate = "Enter a valid rate";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateDeal = async () => {
    if (!validateForm()) return;

    // Check if denomination totals tally
    const isTallied = checkDenominationTally();

    if (isTallied) {
      // Show success modal - tallied successfully
      setConfirmModal({
        open: true,
        actionType: 'confirm',
        title: 'Deal Tallied Successfully',
        message: 'The deal has been tallied. Do you want to proceed?',
        confirmText: 'Confirm',
        cancelText: 'No',
        isTallied: true
      });
    } else {
      // Show error modal - not tallied
      setConfirmModal({
        open: true,
        actionType: 'delete',
        title: 'Deal Not Tallied',
        message: 'The deal is not tallied. Please review before proceeding.',
        confirmText: 'Review',
        cancelText: 'No',
        isTallied: false
      });
    }
  };

  // Handle modal confirmation
  const handleModalConfirm = async () => {
    const isTallied = confirmModal.isTallied;

    if (isTallied) {
      // For "Deal Tallied Successfully" -> "Confirm" button was clicked
      // Create deal with "Completed" status
      setConfirmModal({ ...confirmModal, open: false });
      await createDealTransaction('Completed');
    } else {
      // For "Deal Not Tallied" -> "Review" button was clicked
      // Just close the modal, user stays on form to review
      setConfirmModal({ ...confirmModal, open: false });
    }
  };

  // Handle modal cancel (NO button)
  const handleModalCancel = async () => {
    const isTallied = confirmModal.isTallied;

    if (isTallied) {
      // For "Deal Tallied Successfully" -> "No" button was clicked
      // Create deal with "Completed" status
      setConfirmModal({ ...confirmModal, open: false });
      await createDealTransaction('Completed');
    } else {
      // For "Deal Not Tallied" -> "No" button was clicked
      // Create deal with "Pending" status
      setConfirmModal({ ...confirmModal, open: false });
      await createDealTransaction('Pending');
    }
  };

  // Create deal transaction with status parameter
  const createDealTransaction = async (status = 'Pending') => {
    try {
      setLoading(true);

      const receivedItemsWithTotals = denominationReceived.map(item => ({
        ...item,
        total: (Number(item.price) || 0) * (Number(item.quantity) || 0)
      }));

      const paidItemsWithTotals = denominationPaid.map(item => ({
        ...item,
        total: (Number(item.price) || 0) * (Number(item.quantity) || 0)
      }));

      
      const hasPaidDenomination = denominationPaid.some(
        item => Number(item.price) > 0 && Number(item.quantity) > 0
      );

      
      const paidItemsPayload = hasPaidDenomination
        ? paidItemsWithTotals
          .filter(item => Number(item.price) > 0 && Number(item.quantity) > 0)
          .map(item => ({
            price: String(item.price),
            quantity: String(item.quantity),
            total: String(item.total),
            currency_id: item.currency_id || currencyMap[sellCurrency],
          }))
        : [
          {
            price: "0",
            quantity: "0",
            total: "0",
            currency_id: currencyMap[sellCurrency],
          }
        ];

      const dealData = {
        customer_id: selectedCustomer.id,
        deal_type: txnType.toLowerCase(),
        transaction_mode: txnMode.toLowerCase(),

        buy_currency: buyCurrency,
        buy_currency_id: currencyMap[buyCurrency],

        sell_currency: sellCurrency,
        sell_currency_id: currencyMap[sellCurrency],

        amount: Number(amount),
        rate: Number(rate),
        amount_to_be_paid: Number(amountToBePaid),

        remarks: remarks,
        status: status,

        received_items: receivedItemsWithTotals
          .filter(item => Number(item.price) > 0 && Number(item.quantity) > 0)
          .map(item => ({
            price: String(item.price),
            quantity: String(item.quantity),
            total: String(item.total),
            currency_id: item.currency_id || currencyMap[buyCurrency],
          })),

        // ✅ final paid_items
        paid_items: paidItemsPayload,
      };

      const result = await createDeal(dealData);

      if (result.success) {
        navigate("/deals", {
          state: {
            toast: {
              message:
                status === "Completed"
                  ? "Deal completed successfully"
                  : "Deal is pending.",
              type: status === "Completed" ? "success" : "pending",
            },
          },
        });
      } else {
        navigate("/deals", {
          state: {
            toast: {
              message: result.error?.message || "Failed to create deal",
              type: "error",
            },
          },
        });
      }
    } catch (err) {
      console.error("Error creating deal:", err);
      showToast("Error creating deal", "error");
    } finally {
      setLoading(false);
    }
  };


  const handleCustomerSearch = async (value) => {
    setCustomerQuery(value);
    setSelectedCustomer(null);
    setPhone("");

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value || value.trim().length < 1) {
      setCustomerResults([]);
      setCustomerDropdownOpen(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setCustomerSearchLoading(true);
        const response = await searchCustomers(value.trim());

        if (response.success) {
          setCustomerResults(response.data || []);
          setCustomerDropdownOpen(true);
        } else {
          setCustomerResults([]);
          setCustomerDropdownOpen(false);
        }
      } finally {
        setCustomerSearchLoading(false);
      }
    }, 300);
  };

  const handleSelectCustomer = (customer) => {
    const displayName =
      customer?.full_name ||
      customer?.name ||
      customer?.customer_name ||
      "";
    const displayPhone =
      customer?.phone_number || customer?.phone || customer?.mobile || "";

    setSelectedCustomer(customer);
    setCustomerQuery(displayName);
    setPhone(displayPhone);
    setCustomerDropdownOpen(false);
    setErrors(prev => ({ ...prev, customer: "" }));
  };

  const hasTxnRowError = Boolean(
    errors.txnType ||
    errors.txnMode ||
    errors.amount ||
    errors.rate
  );

  const handleCurrencySelect = (currency, type) => {
    if (type === 'buy') {
      setBuyCurrency(currency);
      setBuyCurrencyOpen(false);

      // Update received denomination currency
      const currencyId = currencyMap[currency];
      setDenominationReceived(prev => prev.map(item => ({
        ...item,
        currency_id: currencyId
      })));
    } else {
      setSellCurrency(currency);
      setSellCurrencyOpen(false);

      // Update paid denomination currency
      const currencyId = currencyMap[currency];
      setDenominationPaid(prev => prev.map(item => ({
        ...item,
        currency_id: currencyId
      })));
    }
  };

  const buyCurrencyOptions = currencyOptions.filter(
    (c) => c !== sellCurrency
  );

  const sellCurrencyOptions = currencyOptions.filter(
    (c) => c !== buyCurrency
  );
  // Custom dropdown with fixed dimensions
  const CustomDropdown = ({
    value,
    setValue,
    isOpen,
    setIsOpen,
    options,
    placeholder,
    loading = false
  }) => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-[172px] h-8
         bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#ABABAB]
                  font-medium
                  flex items-center justify-between
                  px-4
        "
      >
        <span className="truncate">{value || placeholder}</span>
        <img src={down} alt="down" className="w-3" />
      </button>

      {isOpen && (
        <ul className="
         absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10
        ">
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
                        pl-2
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

  return (
    <>
      {/* Page Header */}
      <div>
        <h2 className="text-[16px] font-medium text-white">New Deal</h2>
        <p className="text-gray-400 text-[12px] mb-6">
          Complete all required fields.
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl">

        {/* Row 1 - Full Name & Phone */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Full Name <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <input
                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none"
                value={customerQuery}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onFocus={() => {
                  if (customerResults.length > 0) setCustomerDropdownOpen(true);
                }}
              />

              {customerDropdownOpen && (
                <ul
                  className="
                    absolute left-0 right-0 mt-2 
                    bg-[#2E3439]
                    rounded-lg z-20 max-h-48 overflow-y-auto scrollbar-dark
                  "
                >
                  {customerSearchLoading && (
                    <li className="px-4 py-2 text-sm text-gray-300">
                      Searching...
                    </li>
                  )}

                  {!customerSearchLoading && customerResults.length === 0 && (
                    <li className="px-4 py-2 text-sm text-gray-300">
                      No customers found
                    </li>
                  )}

                  {customerResults.map((customer) => {
                    const displayName =
                      customer?.full_name ||
                      customer?.name ||
                      customer?.customer_name ||
                      "Unnamed";

                    return (
                      <li
                        key={customer.id || displayName}
                        onClick={() => handleSelectCustomer(customer)}
                        className="
                          px-4 py-2 
                          hover:bg-[#1E2328]
                          cursor-pointer
                          text-white
                          
                        "
                      >
                        <p className="text-sm font-medium">{displayName}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
              {errors.customer && (
                <p className="text-red-400 text-[11px] mt-1">
                  {errors.customer}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Phone Number <span className="text-red-500">*</span>
            </label>

            <input
              className="w-full bg-[#16191C] rounded-lg px-3 py-2 outline-none text-white"
              value={phone}
              readOnly
            />
          </div>
        </div>

        {/* Row 2 - Transaction fields in one line (6 fields) */}
        <div className="flex items-end gap-6 mt-6">
          {/* Transaction Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              value={txnType}
              setValue={(val) => {
                setTxnType(val);
                setErrors(prev => ({ ...prev, txnType: "" }));
              }}
              isOpen={txnTypeOpen}
              setIsOpen={setTxnTypeOpen}
              options={["Buy", "Sell"]}
            />
            {hasTxnRowError && (
              <div className="h-3.5 mt-1">
                {errors.txnType && (
                  <p className="text-red-400 text-[11px] leading-3.5">
                    {errors.txnType}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Transaction Mode */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Mode <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              value={txnMode}
              setValue={(val) => {
                setTxnMode(val);
                setErrors(prev => ({ ...prev, txnMode: "" }));
              }}
              isOpen={txnModeOpen}
              setIsOpen={setTxnModeOpen}
              options={["Cash", "Credit"]}
            />
            {errors.txnMode && (
              <p className="text-red-400 text-[11px] mt-1">
                {errors.txnMode}
              </p>
            )}
          </div>

          {/* Buy Currency Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Buy Currency Type <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              value={buyCurrency}
              setValue={(val) => {
                handleCurrencySelect(val, "buy");
                setErrors(prev => ({ ...prev, buyCurrency: "" }));
              }}
              isOpen={buyCurrencyOpen}
              setIsOpen={setBuyCurrencyOpen}
              options={buyCurrencyOptions}
              placeholder="Select"
              loading={loadingCurrencies}
            />
            {hasTxnRowError && <div className="h-3.5 mt-1" />}
          </div>

          {/* Amount */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              className="w-[167px] h-8 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                  setErrors(prev => ({ ...prev, amount: "" }));
                }
              }}
            />
            {errors.amount && (
              <p className="text-red-400 text-[11px] mt-1">
                {errors.amount}
              </p>
            )}
          </div>

          {/* Sell Currency Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Sell Currency Type <span className="text-red-500">*</span>
            </label>
            <CustomDropdown
              value={sellCurrency}
              setValue={(val) => {
                handleCurrencySelect(val, "sell");
                setErrors(prev => ({ ...prev, sellCurrency: "" }));
              }}
              isOpen={sellCurrencyOpen}
              setIsOpen={setSellCurrencyOpen}
              options={sellCurrencyOptions}
              placeholder="Select"
              loading={loadingCurrencies}
            />
            {hasTxnRowError && <div className="h-3.5 mt-1" />}
          </div>

          {/* Rate */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Rate <span className="text-red-500">*</span>
            </label>
            <input
              className="w-[167px] h-8 bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
              placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setRate(value);
                  setErrors(prev => ({ ...prev, rate: "" }));
                }
              }}
            />
            {errors.rate && (
              <p className="text-red-400 text-[11px] mt-1">
                {errors.rate}
              </p>
            )}

          </div>
        </div>

        {/* Row 3 - Amount to be Paid (full width) */}
        <div className="mt-6">

          <div
            className="
    w-full
    h-[37px]
    bg-[#5761D738]
    rounded-lg
    px-3
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

        </div>

        {/* Denomination Section */}
        <div className="mt-8">
          <Denomination
            denominationReceived={denominationReceived}
            setDenominationReceived={setDenominationReceived}
            denominationPaid={denominationPaid}
            setDenominationPaid={setDenominationPaid}
            receivedCurrency={buyCurrency}
            paidCurrency={sellCurrency}
            currencySymbols={currencySymbols}
            receivedReadOnly={false}

            paidReadOnly={false}
          />
        </div>

        {/* Notes */}
        <div className="mt-8">
          <label className="block text-[#ABABAB] text-[14px] mb-2">
            Notes (Optional)
          </label>
          <textarea
            className="
              w-full bg-[#16191C] rounded-lg 
              p-3 h-24 text-white
              placeholder:text-[#ABABAB]
              font-poppins
              focus:outline-none
            "
            placeholder="Add any additional notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <button
            className="w-[95px] h-10 border border-gray-500 rounded-lg text-white hover:bg-[#2A2F34]"
            onClick={() => navigate("/deals")}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-blue-600 h-10 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            onClick={handleCreateDeal}
            disabled={loading}
          >
            <img src={plus} className="w-5 h-5" />
            {loading ? "Saving..." : "Save Deal"}
          </button>
        </div>

      </div>

      {/* Notification Card for tally status */}
      <NotificationCard
        confirmModal={confirmModal}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </>
  );
}