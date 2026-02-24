import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerById, updateCustomer, searchCustomers } from "../../api/customers";
import saveIcon from "../../assets/Common/save.svg";
import edit from "../../assets/Common/edit.svg";
import tickIcon from "../../assets/Common/tick.svg";
import warning from "../../assets/warning.svg";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Dropdown from "../../components/common/Dropdown";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";
import { normalizePhone, checkDuplicate } from "../../utils/vector";
import PhoneInput from "../../components/common/PhoneInput.jsx";
import { capitalizeWords, onlyAlphabets } from "../../utils/stringUtils.jsx";
import PhoneFlag from "../../components/common/PhoneFlag.jsx";
import DiscardModal from "../../components/common/DiscardModal";
import NotificationCard from "../../components/common/Notification";

export default function ViewCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone_number: "", is_active: false });
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);
  const [customerDeals, setCustomerDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [phoneExists, setPhoneExists] = useState(false);
  const [existingCustomerName, setExistingCustomerName] = useState("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    actionType: "",
    title: "",
    message: "",
  });

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const statuses = ["All Status", "Pending", "Completed"];
  const typeColors = { Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]", Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]" };
  const statusColors = { Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]", Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]" };

  useEffect(() => {
    const loadCustomer = async () => {
      const res = await fetchCustomerById(id);
      if (!res.success) {
        navigate("/customer-info");
        return;
      }

      const customer = res.data;

      setFormData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number,
        deal_type: customer.deal_type,
        is_active: customer.is_active ?? false,
      });

      setInitialData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number,
        is_active: customer.is_active ?? false,
      });

      const deals = (customer.deals || []).map((deal) => {
        const isBuy = (deal.deal_type || "").toLowerCase() === "buy";
        const getCode = (curr) => (typeof curr === 'object' ? curr?.code : curr) || "";
        const buyCode = getCode(deal.buyCurrency);
        const sellCode = getCode(deal.sellCurrency);

        const pair = isBuy
          ? `${buyCode}/${sellCode}`
          : `${sellCode}/${buyCode}`;

        return {
          raw: deal,
          dealId: deal.id,
          id: deal.deal_number,
          date: new Date(deal.created_at).toLocaleDateString("en-IN"),
          type: deal.deal_type,
          customer: customer.name,
          buyAmt: (Number(isBuy ? deal.amount : deal.amount_to_be_paid) || 0).toLocaleString(),
          sellAmt: (Number(isBuy ? deal.amount_to_be_paid : deal.amount) || 0).toLocaleString(),
          pair: pair || "---",
          buyCurrencyCode: buyCode,
          sellCurrencyCode: sellCode,
          rate: deal.exchange_rate || deal.rate,
          status: deal.status
        };
      });

      setCustomerDeals(deals);
    };

    loadCustomer();
  }, [id, navigate]);

  useEffect(() => {
    const runCheck = async () => {
      const match = await checkDuplicate(formData.phone_number, id);
      if (match) {
        setPhoneExists(true);
        setExistingCustomerName(match.name);
      } else {
        setPhoneExists(false);
        setExistingCustomerName("");
      }
    };

    if (editMode) {
      runCheck();
    }
  }, [formData.phone_number, editMode, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "name") {
      newValue = onlyAlphabets(capitalizeWords(newValue));
    }

    if (name === "phone_number") {
      newValue = newValue.replace(/[^\d+]/g, "");
      if (newValue.length > 15) return;
    }

    setFormData((p) => ({ ...p, [name]: newValue }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) {
      e.name = "Full Name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      e.name = "Name should only contain letters and spaces";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Invalid email format";
    }

    if (!formData.phone_number.trim()) {
      e.phone_number = "Phone number is required";
    } else {
      const digits = formData.phone_number.replace(/\D/g, "");
      if (digits.length < 10) {
        e.phone_number = "Phone number must be at least 10 digits";
      }
    }

    if (phoneExists) {
      e.phone = "Duplicate phone number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const res = await updateCustomer(id, formData);
    if (res.success) {
      navigate("/customer-info", {
        state: {
          toast: {
            message: "Customer updated successfully",
            type: "success",
          },
        },
      });
    } else {
      navigate("/customer-info", {
        state: {
          toast: {
            message: "Failed to update customer",
            type: "error",
          },
        },
      });
    }
  };

  const isDirty = initialData && (
    formData.name !== initialData.name ||
    formData.email !== initialData.email ||
    formData.phone_number !== initialData.phone_number ||
    formData.is_active !== initialData.is_active
  );

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      navigate("/customer-info");
    }
  };

  const handleDiscard = () => {
    navigate("/customer-info");
  };

  const handleRowClick = (item) => {
    const deal = item.raw;

    setSelectedDeal({
      dealId: item.dealId,
      type: deal.deal_type,
      date: item.date,
      id: item.id,
      mode: deal.transaction_mode,
      buyCurrency: deal.buyCurrency,
      sellCurrency: deal.sellCurrency,
      rate: `${deal.exchange_rate || deal.rate} ${deal.sellCurrency} / ${deal.buyCurrency}`,
      buyAmt: Number(deal.buyAmount),
      sellAmt: Number(deal.sellAmount),
      notes: deal.remarks
    });
  };

  const Row = ({ label, value }) => (
    <div className="flex justify-between">
      <span className="text-sm text-[#8F8F8F]">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="space-y-2">
      {title && <h4 className="text-[#7B8CFF] font-normal">{title}</h4>}
      <div className="space-y-2">{children}</div>
    </div>
  );


  let filteredData = customerDeals.filter(
    (d) =>
      (statusFilter === "All Status" || d.status === statusFilter) &&
      (currencyFilter === "All Currencies" || d.buyCurrencyCode === currencyFilter || d.sellCurrencyCode === currencyFilter)
  );

  if (sortBy) {
    filteredData.sort((a, b) => {
      if (sortBy === "type") return sortAsc ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      if (sortBy === "currency") return sortAsc ? a.pair.localeCompare(b.pair) : b.pair.localeCompare(a.pair);
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 lg:gap-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            {/* Back arrow */}
            <button
              onClick={() => editMode ? handleCancel() : navigate("/customer-info")}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#2A2F33] transition-colors text-[#ABABAB] hover:text-white"
              title="Back to Customers"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0">
              <h2 className="text-white text-base lg:text-[16px] font-semibold truncate">
                {editMode ? "Edit Customer" : `Customer Name: ${formData.name}`}
              </h2>
              <p className="mt-2 text-gray-400 text-xs lg:text-[12px] truncate hidden lg:block">
                {editMode ? "Edit customer info" : (
                  <span className="inline-flex items-center gap-1.5">
                    Contact:
                    <PhoneFlag phone={formData.phone_number} />
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Mobile Only: Edit Icons (Pencil or Save/Cancel) */}
          <div className="lg:hidden flex items-center gap-2 ml-3 shrink-0">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="p-1 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-lg transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                  <path d="M12.8492 27.15H13.9472L24.1455 16.952L23.0472 15.8788L12.8492 26.077V27.15ZM11.1992 28.8V25.3808L25.13 11.4115C25.2158 11.3202 25.3122 11.2621 25.4192 11.2373C25.5264 11.2124 25.6305 11.2 25.7315 11.2C25.8325 11.2 25.9251 11.2045 26.0095 11.2135C26.0936 11.2225 26.189 11.2738 26.2955 11.3673L28.6127 13.6655C28.7062 13.7718 28.7607 13.8718 28.7762 13.9655C28.7916 14.0593 28.7992 14.1614 28.7992 14.2718C28.7992 14.3739 28.7847 14.4744 28.7557 14.5733C28.7267 14.6719 28.6707 14.7642 28.5877 14.85L14.6185 28.8H11.1992ZM23.6117 16.4125L23.0472 15.8788L24.1455 16.952L23.6117 16.4125Z" fill="currentColor" />
                </svg>
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center px-1 py-1.5 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-lg transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 41 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M12.8492 27.15H13.9472L24.1455 16.952L23.0472 15.8788L12.8492 26.077V27.15ZM11.1992 28.8V25.3808L25.13 11.4115C25.2158 11.3202 25.3122 11.2621 25.4192 11.2373C25.5264 11.2124 25.6305 11.2 25.7315 11.2C25.8325 11.2 25.9251 11.2045 26.0095 11.2135C26.0936 11.2225 26.189 11.2738 26.2955 11.3673L28.6127 13.6655C28.7062 13.7718 28.7607 13.8718 28.7762 13.9655C28.7916 14.0593 28.7992 14.1614 28.7992 14.2718C28.7992 14.3739 28.7847 14.4744 28.7557 14.5733C28.7267 14.6719 28.6707 14.7642 28.5877 14.85L14.6185 28.8H11.1992ZM23.6117 16.4125L23.0472 15.8788L24.1455 16.952L23.6117 16.4125Z"
                  fill="currentColor"
                />
              </svg>
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={phoneExists}
                className={`flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] px-4 py-2 rounded-md text-white ${phoneExists ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <img src={saveIcon} alt="save" className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
        <div className="w-full lg:flex-1 bg-[#1A1F24] p-4 lg:p-5 rounded-xl overflow-y-auto scrollbar-grey ml-10">
          {editMode ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm text-[#ABABAB] mb-1">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border ${errors.name ? "border-red-500" : "border-[#2A2F33]"} focus:border-blue-500`} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div>
                  <label className="block text-sm text-[#ABABAB] mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border ${errors.email ? "border-red-500" : "border-[#2A2F33]"} focus:border-blue-500`} />
                </div>
                <div>
                  <label className="block text-sm text-[#ABABAB] mb-1">Phone</label>
                  <PhoneInput
                    value={formData.phone_number}
                    onChange={(value) => setFormData(p => ({ ...p, phone_number: value }))}
                    error={errors.phone_number || phoneExists}
                  />
                  {phoneExists && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <img src={warning} alt="warning" className="w-4 h-4" />
                      <p className="text-red-400 text-[11px] font-medium">
                        Duplicate phone number detected {existingCustomerName ? `(${existingCustomerName})` : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-3 h-[38px] rounded-lg">
                  <button
                    type="button"
                    disabled={!editMode}
                    onClick={() => {
                      if (!editMode) return;
                      setConfirmModal({
                        open: true,
                        actionType: formData.is_active ? "deactivate" : "activate",
                        title: formData.is_active
                          ? "Are you sure you want to deactivate this customer account?"
                          : "Are you sure you want to activate this customer account?",
                        message: formData.is_active
                          ? "You are about to deactivate this customer. They will be marked as inactive in the system. Do you want to continue?"
                          : "You are about to activate this customer. They will be marked as active in the system. Do you want to continue?",
                      });
                    }}
                    className={`relative flex items-center w-[110px] h-[32px] rounded-full transition-all duration-300 focus:outline-none
                                    ${formData.is_active ? "bg-[#2bc5b4]" : "bg-[#C52B2B]"}
                                    ${!editMode ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                `}
                  >
                    <span className={`absolute flex items-center justify-center text-white text-[11px] font-semibold tracking-wide transition-all duration-300
                                    ${formData.is_active ? "left-0 right-[32px]" : "left-[32px] right-0"}`}
                    >
                      {formData.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className={`absolute w-[24px] h-[24px] bg-white rounded-full shadow-md transition-all duration-300
                                    ${formData.is_active ? "left-[80px]" : "left-[4px]"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 lg:gap-0 mb-4">
                <h2 className="text-white text-base lg:text-[16px] font-semibold">Related Deals</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
                  <Dropdown label="All Status" options={statuses} selected={statusFilter} onChange={setStatusFilter} className="w-full sm:w-[150px]" />
                  <Dropdown label="All Currencies" options={["All Currencies", ...new Set(customerDeals.flatMap(d => [d.buyCurrencyCode, d.sellCurrencyCode]).filter(Boolean))]} selected={currencyFilter} onChange={setCurrencyFilter} className="w-full sm:w-[180px]" />
                </div>
              </div>
              <div className="border-t-[3px] border-[#16191C] mt-4 pt-4 -mx-4 lg:-mx-5 px-4 lg:px-5"></div>
              <div className="-mx-4 lg:-mx-5 overflow-x-auto scrollbar-grey">
                <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse min-w-[800px] lg:min-w-full">
                  <thead>
                    <tr className="text-[#FFFFFF] text-[12px] font-normal">
                      <th className="py-3 text-left pl-3 lg:pl-5 ">Date</th>
                      <th className="py-3 cursor-pointer select-none " onClick={() => { if (sortBy === "type") setSortAsc(!sortAsc); else { setSortBy("type"); setSortAsc(true); } }}>
                        <div className="flex items-center gap-1 ml-0 lg:ml-2 justify-center">
                          Type
                          <span className="flex flex-col">
                            <img src={uparrowIcon} className={`w-3 h-3 -mt-[5px] ${sortBy === "type" && !sortAsc ? "opacity-100" : "opacity-30"}`} />
                            <img src={downarrowIcon} className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "type" && sortAsc ? "opacity-100" : "opacity-30"}`} />
                          </span>
                        </div>
                      </th>
                      <th className="text-left">Customer Name</th>
                      <th className="text-left">Currency Pair</th>
                      <th className="text-left">Buy Amount</th>
                      <th className="text-left">Rate</th>
                      <th className="text-left">Sell Amount</th>
                      <th className="text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => (
                      <tr key={idx} className="rounded-2xl odd:bg-[#16191C] hover:bg-[#151517] transition-colors cursor-pointer" onClick={() => handleRowClick(item)}>
                        <td className="py-3 font-normal text-[14px] text-left pl-3 lg:pl-5 ">{item.date}</td>
                        <td><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}>{item.type}</span></td>
                        <td className="text-left">{item.customer}</td>
                        <td className="text-left">{item.pair}</td>
                        <td className="text-left">{item.buyAmt}</td>
                        <td className="text-left">{item.rate}</td>
                        <td className="text-left">{item.sellAmt}</td>
                        <td className="text-left"><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center lg:justify-end px-4 lg:px-0">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-2 py-1 border border-[#2A2F33] rounded-lg text-white flex items-center gap-2 text-sm ${currentPage === 1 ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <span className="hidden sm:inline">‹</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <span className="text-xs lg:text-sm text-[#8F8F8F] whitespace-nowrap">
                      <span className="text-white mr-1">{currentPage}</span>
                      <span className="mx-1">of</span>
                      <span className="text-white ml-1">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-2 py-1 border border-[#2A2F33] rounded-lg text-white flex items-center gap-2 text-sm ${currentPage === totalPages ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <span className="hidden sm:inline">›</span>
                      <span className="sm:hidden">Next</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!editMode && (
          <div className={`w-full lg:w-80 bg-[#1A1F24] p-4 lg:p-5 rounded-xl overflow-y-auto scrollbar-grey transition-all duration-300
                          ${!selectedDeal ? "min-h-[200px] lg:min-h-[calc(100vh-200px)] flex items-center justify-center" : "max-h-[600px] lg:max-h-[calc(100vh-200px)]"}`}>
            {!selectedDeal ? (
              <span className="text-gray-400 text-center">Click a row to see details</span>
            ) : (
              <div className="space-y-3 lg:space-y-4 text-sm">
                <div
                  className="flex items-center justify-between gap-2 cursor-pointer group"
                  onClick={() => navigate(`/deals/edit-deal/${selectedDeal.dealId}`)}
                  title="Click to view full deal details"
                >
                  <h3 className="text-white font-semibold text-base lg:text-lg truncate group-hover:text-[#7B8CFF] transition-colors">
                    Deal Detail
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-2xl text-xs lg:text-sm whitespace-nowrap ${typeColors[selectedDeal.type]}`}
                    >
                      {selectedDeal.type}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-[#7B8CFF] transition-all group-hover:translate-x-0.5">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>


                <div className="border-t-[3px] border-[#16191C] -mx-1 px-5"></div>

                <Row label="Date" value={selectedDeal.date} />
                <Row label="Deal ID" value={selectedDeal.id} />
                <Row label="Transaction Mode" value={selectedDeal.mode} />
                <div className="border-t-[3px] border-[#16191C] -mx-1 px-5"></div>

                <Section title="Currency Information">
                  <Row label="Buy Currency" value={selectedDeal.buyCurrency} />
                  <Row label="Sell Currency" value={selectedDeal.sellCurrency} />
                  <Row label="Exchange Rate" value={selectedDeal.rate} />
                </Section>
                <div className="border-t-[3px] border-[#16191C] -mx-1 px-5"></div>

                <Section title="Amount Details">
                  <Row label="Buy Amount" value={`${selectedDeal.buyAmt.toLocaleString()} ${selectedDeal.buyCurrency}`} />
                  <Row label="Sell Amount" value={`${selectedDeal.sellAmt.toLocaleString()} ${selectedDeal.sellCurrency}`} />
                </Section>
                <div className="border-t-[3px] border-[#16191C] -mx-1 px-5"></div>

                <Section title="Notes">
                  <p className="text-white text-xs">{selectedDeal.notes || "—"}</p>
                </Section>
              </div>
            )}
          </div>
        )}

      </div >

      {/* Mobile Sticky Action Bar */}
      {
        editMode && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 flex gap-4 z-50">
            <button
              onClick={handleCancel}
              className="flex-1 bg-[#2A2F34] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#343a40]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={phoneExists}
              className={`flex-1 bg-[#1D4CB5] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#173B8B] ${phoneExists ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Save
            </button>
          </div>
        )
      }

      <DiscardModal
        show={showDiscardModal}
        onDiscard={handleDiscard}
        onKeep={() => setShowDiscardModal(false)}
      />

      <NotificationCard
        confirmModal={confirmModal}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, open: false }))
        }
        onConfirm={() => {
          switch (confirmModal.actionType) {
            case "deactivate":
              setFormData(prev => ({ ...prev, is_active: false }));
              break;
            case "activate":
              setFormData(prev => ({ ...prev, is_active: true }));
              break;
            default:
              break;
          }
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }}
      />
    </>
  );
}
