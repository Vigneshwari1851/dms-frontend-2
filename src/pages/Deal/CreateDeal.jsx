import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";
import plus from "../../assets/common/Hplus.svg";
import Denomination from "../../components/deal/Denomination";
import Toast from "../../components/common/Toast";
import { createDeal } from "../../api/deals";
import { searchCustomers } from "../../api/customers";

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
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [denominationReceived, setDenominationReceived] = useState([
    { price: 0, quantity: 0, currency_id: 1 },
  ]);
  const [denominationPaid, setDenominationPaid] = useState([
    { price: 0, quantity: 0, total: 0, currency_id: 1 },
  ]);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2500);
  };

  const validateForm = () => {
    if (!selectedCustomer?.id) {
      showToast("Please select a customer", "error");
      return false;
    }
    if (!txnType) {
      showToast("Transaction type is required", "error");
      return false;
    }
    if (!txnMode) {
      showToast("Transaction mode is required", "error");
      return false;
    }
    if (!amount || amount <= 0) {
      showToast("Valid amount is required", "error");
      return false;
    }
    if (!rate || rate <= 0) {
      showToast("Valid rate is required", "error");
      return false;
    }
    return true;
  };

  const handleCreateDeal = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const dealData = {
        customer_id: selectedCustomer.id,
        deal_type: txnType.toLowerCase(),
        transaction_mode: txnMode.toLowerCase(),
        amount: Number(amount),
        rate: Number(rate),
        remarks: remarks,
        status: "Pending",
        received_items: denominationReceived
          .filter((item) => item.price && item.quantity)
          .map((item) => ({
            price: String(item.price),
            quantity: String(item.quantity),
            total: String(Number(item.price) * Number(item.quantity)), // ADD THIS
            currency_id: item.currency_id,
          })),

        paid_items: denominationPaid
          .filter((item) => item.price && item.quantity)
          .map((item) => ({
            price: String(item.price),
            quantity: String(item.quantity),
            total: String(item.total ?? Number(item.price) * Number(item.quantity)),
            currency_id: item.currency_id,
          })),

      };

      const result = await createDeal(dealData);

      if (result.success) {
        // Show pending toast after successful creation
        showToast("Deal is pending. Please review and complete", "pending");
        setTimeout(() => {
          navigate("/deals");
        }, 2000);
      } else {
        showToast(result.error?.message || "Failed to create deal", "error");
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

    if (!value || value.trim().length < 2) {
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
  };


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

        {/* Row 1 */}
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
                // placeholder="Enter customer name"
                onFocus={() => {
                  if (customerResults.length > 0) setCustomerDropdownOpen(true);
                }}
              />

              {customerDropdownOpen && (
                <ul
                  className="
                    absolute left-0 right-0 mt-2 
                    bg-[#2E3439] border border-[#2A2F33] 
                    rounded-lg z-20 max-h-48 overflow-y-auto
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
                          border-b border-[#2A2F33] last:border-0
                        "
                      >
                        <p className="text-sm font-medium">{displayName}</p>
                      </li>
                    );
                  })}
                </ul>
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
              // placeholder="Auto-filled after selecting customer"
              readOnly
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-4 gap-6 mt-6">

          {/* Transaction Type */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Type <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                onClick={() => setTxnTypeOpen(!txnTypeOpen)}
                className="
                  w-full
                  h-10
                  bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#E3E3E3]
                  font-medium
                  flex items-center justify-between
                  px-4
                "
              >
                <span>{txnType}</span>
                <img src={down} alt="down" className="w-3" />
              </button>

              {txnTypeOpen && (
                <ul className="
                  absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10
                ">
                  {["Buy", "Sell"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setTxnType(item);
                        setTxnTypeOpen(false);
                      }}
                      className="
                        px-4 py-2 
                        flex items-center justify-between
                        hover:bg-[#1E2328]
                        cursor-pointer
                        text-white
                      "
                    >
                      <span>{item}</span>
                      {txnType === item && (
                        <img src={tick} className="w-4 h-4" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Transaction Mode */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Transaction Mode <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <button
                onClick={() => setTxnModeOpen(!txnModeOpen)}
                className="
                  w-full
                  h-10
                  bg-[#16191C]
                  rounded-lg
                  text-[14px]
                  text-[#E3E3E3]
                  font-medium
                  flex items-center justify-between
                  px-4
                "
              >
                <span>{txnMode}</span>
                <img src={down} alt="down" className="w-3" />
              </button>

              {txnModeOpen && (
                <ul className="
                  absolute left-0 right-0 mt-2 
                  bg-[#2E3439] border border-[#2A2F33] 
                  rounded-lg z-10
                ">
                  {["Cash", "Credit"].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setTxnMode(item);
                        setTxnModeOpen(false);
                      }}
                      className="
                        px-4 py-2 
                        flex items-center justify-between
                        hover:bg-[#1E2328]
                        cursor-pointer
                        text-white
                      "
                    >
                      <span>{item}</span>
                      {txnMode === item && (
                        <img src={tick} className="w-4 h-4" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
              placeholder="0.00"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Rate */}
          <div>
            <label className="text-[#ABABAB] text-sm mb-1 block">
              Rate <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full bg-[#16191C] rounded-lg p-2 text-white focus:outline-none"
              placeholder="0.00"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
        </div>

        {/* Denomination Section */}
        <div className="mt-8">
          <Denomination
            denominationReceived={denominationReceived}
            setDenominationReceived={setDenominationReceived}
            denominationPaid={denominationPaid}
            setDenominationPaid={setDenominationPaid}
            
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
            {loading ? "Creating..." : "Create Deal"}
          </button>
        </div>

      </div>

      {toast.show && (
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
        />
      )}
    </>
  );
}
