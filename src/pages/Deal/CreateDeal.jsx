import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import plus from "../../assets/Common/save.svg";
import Denomination from "../../components/deal/Denomination";
import NotificationCard from "../../components/common/Notification";
import { createDeal } from "../../api/deals";
import { searchCustomers } from "../../api/customers";
import { fetchCurrencies } from "../../api/currency/currency";
import Dropdown from "../../components/common/Dropdown";

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
  const [enableDenomination, setEnableDenomination] = useState(true);
  const [manualReceivedTotal, setManualReceivedTotal] = useState("");
  const [manualPaidTotal, setManualPaidTotal] = useState("");
  const [currencyPair, setCurrencyPair] = useState("");
  const [currencyPairOptions, setCurrencyPairOptions] = useState([]);
  const [errors, setErrors] = useState({});

  // Currencies list
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currencyMap, setCurrencyMap] = useState({});
  const [currencySymbols, setCurrencySymbols] = useState({});
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const [denominationReceived, setDenominationReceived] = useState([
    { price: 0, quantity: 0 },
  ]);
  const [denominationPaid, setDenominationPaid] = useState([
    { price: 0, quantity: 0, total: 0 },
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

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

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
          const pairs = [];
          codes.forEach(code => {
            if (code !== "TZS") {
              pairs.push(`${code}/TZS`);
            }
          });
          setCurrencyPairOptions(pairs);

          if (map["USD"] && map["TZS"]) {
            setCurrencyPair("USD/TZS");
          } else if (pairs.length > 0) {
            setCurrencyPair(pairs[0]);
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

  const handleUpdateTransaction = (pair = currencyPair, type = txnType) => {
    setCurrencyPair(pair);
    setTxnType(type);

    if (!type) {
      setBuyCurrency("");
      setSellCurrency("");
      return;
    }

    let bCurr = "";
    let sCurr = "";

    if (type === "Buy") {
      bCurr = foreign;
      sCurr = local;
    } else {
      bCurr = local;
      sCurr = foreign;
    }

    setBuyCurrency(bCurr);
    setSellCurrency(sCurr);

    // Update denominations
    const buyId = currencyMap[bCurr];
    const sellId = currencyMap[sCurr];
    if (buyId) {
      setDenominationReceived(prev => prev.map(item => ({ ...item, currency_id: buyId })));
    }
    if (sellId) {
      setDenominationPaid(prev => prev.map(item => ({ ...item, currency_id: sellId })));
    }

    setErrors(prev => ({ ...prev, currencyPair: "", txnType: "" }));
  };

  const handlePairSelect = (pair) => {
    handleUpdateTransaction(pair, txnType);
  };

  const handleTxnTypeChange = (type) => {
    handleUpdateTransaction(currencyPair, type);
  };

  useEffect(() => {
    if (amount && rate && amount > 0 && rate > 0) {
      const calculatedAmount = parseFloat(amount) * parseFloat(rate);
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
    const totalReceived = enableDenomination ? calculateTotalReceived() : parseFloat(manualReceivedTotal) || 0;
    const totalPaid = enableDenomination ? calculateTotalPaid() : parseFloat(manualPaidTotal) || 0;

    // For "Buy" transaction: Buy Amount is 'amount', Sell Amount is 'amountToBePaid'
    // For "Sell" transaction: Sell Amount is 'amount', Buy Amount is 'amountToBePaid'
    const expectedReceived = txnType?.toLowerCase() === "sell" ? (parseFloat(amountToBePaid) || 0) : (parseFloat(amount) || 0);
    const expectedPaid = txnType?.toLowerCase() === "sell" ? (parseFloat(amount) || 0) : (parseFloat(amountToBePaid) || 0);

    const tolerance = 0.01;

    const receivedMatches = Math.abs(totalReceived - expectedReceived) <= tolerance;
    const paidMatches = Math.abs(totalPaid - expectedPaid) <= tolerance;

    // For split tracking, we only strictly require the relevant side to match
    const relevantMatch = txnType?.toLowerCase() === "buy" ? receivedMatches : paidMatches;

    if (txnMode?.toLowerCase() === "cash") return true;
    return relevantMatch;
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

    if (!currencyPair) {
      newErrors.currencyPair = "Currency pair is required";
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

  const receivedTotal = denominationReceived.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const paidTotal = denominationPaid.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const expectedReceived = txnType?.toLowerCase() === "sell" ? Number(amountToBePaid) : Number(amount);
  const expectedPaid = txnType?.toLowerCase() === "sell" ? Number(amount) : Number(amountToBePaid);

  const isCashManual = !enableDenomination && txnMode?.toLowerCase() === "cash";
  const effectiveReceivedTotal = isCashManual ? expectedReceived : (enableDenomination ? receivedTotal : Number(manualReceivedTotal));
  const effectivePaidTotal = isCashManual ? expectedPaid : (enableDenomination ? paidTotal : Number(manualPaidTotal));

  const isReceivedTallied =
    expectedReceived > 0 && Math.abs(effectiveReceivedTotal - expectedReceived) <= 0.01;

  const isPaidTallied =
    expectedPaid > 0 &&
    Math.abs(effectivePaidTotal - expectedPaid) <= 0.01;

  const isFullyTallied = txnType?.toLowerCase() === "buy" ? isPaidTallied : isReceivedTallied;

  const handleCreateDeal = async () => {
    if (!validateForm()) return;

    // Automatic status logic: 
    // Cash -> Completed
    // Credit -> Pending
    if (txnMode?.toLowerCase() === "cash") {
      await createDealTransaction('Completed');
      return;
    }
    if (txnMode?.toLowerCase() === "credit") {
      await createDealTransaction('Pending');
      return;
    }

    // Check if denomination totals tally for other modes
    const isSavable = checkDenominationTally();
    const isFullyTallied = isReceivedTallied && isPaidTallied;

    if (isSavable) {
      setConfirmModal({
        open: true,
        actionType: isFullyTallied ? 'confirm' : 'delete',
        title: isFullyTallied ? 'Deal Tallied Successfully' : 'Deal Not Tallied',
        message: isFullyTallied
          ? 'The deal has been fully tallied and will be marked as Completed. Do you want to proceed?'
          : 'Since the received amount is missing/optional, the deal will be saved as Pending. Do you want to proceed?',
        confirmText: isFullyTallied ? 'Confirm' : 'Confirm',
        cancelText: 'No',
        isTallied: true
      });
    } else {
      // Show error modal - not tallied
      setConfirmModal({
        open: true,
        actionType: 'delete',
        title: 'Deal Not Tallied',
        message: 'The required denominations are not tallied. Please review before proceeding.',
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
            currency_id: currencyMap[sellCurrency],
          }))
        : [];

      const totalReceived = enableDenomination ? calculateTotalReceived() : parseFloat(manualReceivedTotal) || 0;
      const totalPaid = enableDenomination ? calculateTotalPaid() : parseFloat(manualPaidTotal) || 0;

      const expectedReceived = txnType?.toLowerCase() === "sell" ? (parseFloat(amountToBePaid) || 0) : (parseFloat(amount) || 0);
      const expectedPaid = txnType?.toLowerCase() === "sell" ? (parseFloat(amount) || 0) : (parseFloat(amountToBePaid) || 0);

      const sideReceivedMatches = Math.abs(totalReceived - expectedReceived) <= 0.01;
      const sidePaidMatches = Math.abs(totalPaid - expectedPaid) <= 0.01;

      // Completion Logic:
      // If the relevant split side matches, it's completed.
      const matchesRelevantSide = txnType?.toLowerCase() === "buy" ? sidePaidMatches : sideReceivedMatches;

      let finalStatus = status;
      if (matchesRelevantSide || txnMode.toLowerCase() === "cash") {
        finalStatus = "Completed";
      } else {
        finalStatus = "Pending";
      }

      const dealData = {
        customer_id: selectedCustomer.id,
        deal_type: txnType.toLowerCase(),
        transaction_mode: txnMode.toLowerCase(),

        buy_currency: buyCurrency,
        buy_currency_id: currencyMap[buyCurrency],

        sell_currency: sellCurrency,
        sell_currency_id: currencyMap[sellCurrency],

        amount: Number(amount),
        exchange_rate: Number(rate),
        amount_to_be_paid: Number(amountToBePaid),

        remarks: remarks,
        status: finalStatus,

        receivedItems: receivedItemsWithTotals
          .filter(item => Number(item.price) > 0 && Number(item.quantity) > 0)
          .map(item => ({
            price: String(item.price),
            quantity: String(item.quantity),
            total: String(item.total),
            currency_id: currencyMap[buyCurrency],
          })),

        // ✅ final paid_items
        paidItems: paidItemsPayload,
      };

      const result = await createDeal(dealData);

      if (result.success) {
        navigate("/deals", {
          state: {
            toast: {
              message:
                finalStatus === "Completed"
                  ? "Deal completed successfully"
                  : "Deal is pending.",
              type: finalStatus === "Completed" ? "success" : "pending",
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

    if (!value || value.trim().length === 0) {
      setSelectedCustomer(null);
      setPhone("");
      setTxnType("");
      setBuyCurrency("");
      setSellCurrency("");
      setCurrencyPair("");
    }

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
        const isNumeric = /^\d+$/.test(value.trim());
        const searchType = isNumeric ? "phone" : "name";
        const response = await searchCustomers(value.trim(), searchType);

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

    const defaultTxnType = customer?.deal_type?.toLowerCase() === "sell" ? "Sell" : "Buy";
    setTxnType(defaultTxnType);

    if (currencyMap["USD"] && currencyMap["TZS"]) {
      const pair = "USD/TZS";
      setCurrencyPair(pair);

      let bCurr = "USD";
      let sCurr = "TZS";

      if (defaultTxnType === "Sell") {
        bCurr = "TZS";
        sCurr = "USD";
      }

      setBuyCurrency(bCurr);
      setSellCurrency(sCurr);

      // Update denominations
      const buyId = currencyMap[bCurr];
      const sellId = currencyMap[sCurr];
      if (buyId) {
        setDenominationReceived(prev => prev.map(item => ({ ...item, currency_id: buyId })));
      }
      if (sellId) {
        setDenominationPaid(prev => prev.map(item => ({ ...item, currency_id: sellId })));
      }
    }

    setErrors(prev => ({ ...prev, customer: "" }));
  };

  const hasTxnRowError = Boolean(
    errors.txnType ||
    errors.txnMode ||
    errors.amount ||
    errors.rate
  );

  const handleCurrencySelect = (currency, type) => {
    // This function is now superseded by handlePairSelect but kept for backward compatibility if needed in other parts
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
  const buyCurrencyOptions = currencyOptions;
  const sellCurrencyOptions = currencyOptions;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
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

        {/* Row 2 - Transaction fields (Responsive Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mt-6">
          {/* 1. Transaction Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <Dropdown
              label="Type"
              options={["Buy", "Sell"]}
              selected={txnType}
              onChange={(val) => {
                handleTxnTypeChange(val);
              }}
              className="w-full"
            />
            <div className="min-h-3.5 mt-1">
              {errors.txnType && (
                <p className="text-red-400 text-[11px]">{errors.txnType}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Mode <span className="text-red-500">*</span>
            </label>
            <Dropdown
              label="Mode"
              options={["Cash", "Credit"]}
              selected={txnMode}
              onChange={(val) => {
                setTxnMode(val);
                setErrors(prev => ({ ...prev, txnMode: "" }));
              }}
              className="w-full"
            />
            <div className="min-h-3.5 mt-1">
              {errors.txnMode && (
                <p className="text-red-400 text-[11px]">{errors.txnMode}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Currency Pair <span className="text-red-500">*</span>
            </label>
            <Dropdown
              label="Select Pair"
              options={currencyPairOptions}
              selected={currencyPair}
              onChange={(val) => {
                handlePairSelect(val);
              }}
              className="w-full"
            />
            <div className="min-h-3.5 mt-1">
              {errors.currencyPair && (
                <p className="text-red-400 text-[11px]">{errors.currencyPair}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              {txnType?.toLowerCase() === "sell" ? "Sell Amount" : txnType?.toLowerCase() === "buy" ? "Buy Amount" : "Amount"} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full h-10 bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none"
              // placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={amount}
              onFocus={(e) => {
                if (amount === "0") setAmount("");
              }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setAmount(value);
                  setErrors(prev => ({ ...prev, amount: "" }));
                }
              }}
            />
            <div className="min-h-3.5 mt-1">
              {errors.amount && (
                <p className="text-red-400 text-[11px]">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* 4. Rate */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Rate <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full h-10 bg-[#16191C] rounded-lg px-3 py-2 text-white focus:outline-none"
              // placeholder="0.00"
              type="text"
              inputMode="decimal"
              value={rate}
              onFocus={(e) => {
                if (rate === "0") setRate("");
              }}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setRate(value);
                  setErrors(prev => ({ ...prev, rate: "" }));
                }
              }}
            />
            <div className="min-h-3.5 mt-1">
              {errors.rate && (
                <p className="text-red-400 text-[11px]">{errors.rate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Row 3 - Amount to be Paid (full width) */}
        <div className="">

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
              {txnType?.toLowerCase() === "sell" ? "Buy Amount" : txnType?.toLowerCase() === "buy" ? "Sell Amount" : "Amount "}
            </span>

            {/* Right side */}
            <span className="text-white text-[14px]">
              {currencySymbols[txnType?.toLowerCase() === "sell" ? buyCurrency : sellCurrency] || (txnType?.toLowerCase() === "sell" ? buyCurrency : sellCurrency)} {Math.floor(Number(amountToBePaid)).toLocaleString()}
            </span>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-[#ABABAB] text-[14px] mb-2">
              Notes (Optional)
            </label>
            <textarea
              className="
              w-full bg-[#16191C] rounded-lg 
              p-3 h-24 text-white
              placeholder:text-[#D1D1D1]
              font-poppins
              focus:outline-none
            "
              // placeholder="Add any additional notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex justify-end gap-3 mt-8">
            <button
              className="w-[95px] h-10 border border-gray-500 rounded-lg text-white hover:bg-[#2A2F34]"
              onClick={() => navigate("/deals")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              className="w-auto flex items-center justify-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              onClick={handleCreateDeal}
              disabled={loading}
            >
              <img src={plus} className="w-5 h-5" />
              {loading ? "Saving..." : "Save Deal"}
            </button>
          </div>

          {/* Mobile Action Buttons (sticky at bottom, same line) */}
          <div className="lg:hidden bottom-4 flex justify-between items-center mt-6">
            <button
              className="w-[120px] h-10 rounded-lg border border-white text-white font-medium text-sm flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-colors"
              onClick={() => navigate("/deals")}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="w-[120px] h-10 rounded-lg bg-[#1D4CB5] text-white font-medium text-sm flex items-center justify-center cursor-pointer hover:bg-[#173B8B] transition-colors"
              onClick={handleCreateDeal}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

        </div>

        {/* Notification Card for tally status */}
        <NotificationCard
          confirmModal={confirmModal}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      </div>
      {/* Toast Notification */}
      {toast.show && (
        <NotificationCard
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}