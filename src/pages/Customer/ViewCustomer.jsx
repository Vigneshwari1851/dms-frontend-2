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
        return {
          raw: deal,
          dealId: deal.id,
          id: deal.deal_number,
          date: new Date(deal.created_at).toLocaleDateString("en-IN"),
          type: deal.deal_type,
          customer: customer.name,
          buyAmt: (Number(isBuy ? deal.amount : deal.amount_to_be_paid) || 0).toLocaleString(),
          sellAmt: (Number(isBuy ? deal.amount_to_be_paid : deal.amount) || 0).toLocaleString(),
          currency: deal.buyCurrency || "---",
          currency1: deal.sellCurrency || "---",
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
      if (!/^[a-zA-Z\s]*$/.test(newValue)) return;
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

  const handleCancel = () => {
    setFormData(initialData);
    setEditMode(false);
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
      (currencyFilter === "All Currencies" || d.currency === currencyFilter)
  );

  if (sortBy) {
    filteredData.sort((a, b) => {
      if (sortBy === "type") return sortAsc ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      if (sortBy === "currency") return sortAsc ? a.currency.localeCompare(b.currency) : b.currency.localeCompare(a.currency);
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3 lg:gap-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="min-w-0 flex-1 lg:flex-initial">
            <h2 className="text-white text-base lg:text-[16px] font-semibold truncate">
              {editMode ? "Edit Customer" : `Customer Name: ${formData.name}`}
            </h2>
            <p className="mt-2 text-gray-400 text-xs lg:text-[12px] truncate hidden lg:block">
              {editMode ? "Edit customer info" : `Contact Number: ${formData.phone_number}`}
            </p>
          </div>

          {/* Mobile Only: Edit Icons (Pencil or Save/Cancel) */}
          <div className="lg:hidden flex items-center gap-2 ml-3 shrink-0">
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="p-1 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-lg transition-colors"
              >
                <img src={edit} alt="edit" className="w-6 h-6 cursor-pointer" />
              </button>
            )}
          </div>
        </div>

        <div className="hidden lg:flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="p-1 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-lg transition-colors"
            >
              <img src={edit} alt="edit" className="w-8 h-8 cursor-pointer" />
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
        <div className="w-full lg:flex-1 bg-[#1A1F24] p-4 lg:p-5 rounded-xl overflow-y-auto scrollbar-grey">
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
                  <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={`w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border ${errors.phone_number || phoneExists ? "border-red-500" : "border-[#2A2F33]"} focus:border-blue-500`} />
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
                <label className="flex items-center gap-2 text-sm text-[#ABABAB] cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-[#16191C] border-[#2A2F33] focus:ring-blue-500"
                  />
                  Is Active
                </label>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 lg:gap-0 mb-4">
                <h2 className="text-white text-base lg:text-[16px] font-semibold">Deals</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:gap-3">
                  <Dropdown label="All Status" options={statuses} selected={statusFilter} onChange={setStatusFilter} className="w-full sm:w-[150px]" />
                  <Dropdown label="All Currencies" options={["All Currencies", ...new Set(customerDeals.map(d => d.currency))]} selected={currencyFilter} onChange={setCurrencyFilter} className="w-full sm:w-[180px]" />
                </div>
              </div>
              <div className="border-t-[3px] border-[#16191C] mt-4 pt-4 -mx-4 lg:-mx-5 px-4 lg:px-5"></div>
              <div className="-mx-4 lg:-mx-5 overflow-x-auto">
                <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse min-w-[800px] lg:min-w-full">
                  <thead>
                    <tr className="text-[#FFFFFF] text-[12px] font-normal">
                      <th className="py-3 text-left pl-3 lg:pl-5 px-2 lg:px-0">Date</th>
                      <th className="py-3 cursor-pointer select-none px-2 lg:px-0" onClick={() => { if (sortBy === "type") setSortAsc(!sortAsc); else { setSortBy("type"); setSortAsc(true); } }}>
                        <div className="flex items-center gap-1 ml-0 lg:ml-2 justify-center">
                          Type
                          <span className="flex flex-col">
                            <img src={uparrowIcon} className={`w-3 h-3 -mt-[5px] ${sortBy === "type" && !sortAsc ? "opacity-100" : "opacity-30"}`} />
                            <img src={downarrowIcon} className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "type" && sortAsc ? "opacity-100" : "opacity-30"}`} />
                          </span>
                        </div>
                      </th>
                      <th className="px-2 lg:px-0">Customer Name</th>
                      <th className="px-2 lg:px-0">Buy Amount</th>
                      <th className="py-3 cursor-pointer select-none px-2 lg:px-0" onClick={() => { if (sortBy === "currency") setSortAsc(!sortAsc); else { setSortBy("currency"); setSortAsc(true); } }}>
                        <div className="flex items-center gap-1 ml-0 lg:ml-5 justify-center">
                          Currency
                          <span className="flex flex-col">
                            <img src={uparrowIcon} className={`w-3 h-3 -mt-[5px] ${sortBy === "currency" && !sortAsc ? "opacity-100" : "opacity-30"}`} />
                            <img src={downarrowIcon} className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "currency" && sortAsc ? "opacity-100" : "opacity-30"}`} />
                          </span>
                        </div>
                      </th>
                      <th className="px-2 lg:px-0">Rate</th>
                      <th className="px-2 lg:px-0">Sell Amount</th>
                      <th className="px-2 lg:px-0">Currency</th>
                      <th className="px-2 lg:px-0">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => (
                      <tr key={idx} className="rounded-2xl hover:bg-[#151517] transition-colors cursor-pointer" onClick={() => handleRowClick(item)}>
                        <td className="py-3 font-normal text-[14px] text-left pl-3 lg:pl-5 px-2 lg:px-0">{item.date}</td>
                        <td className="px-2 lg:px-0"><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}>{item.type}</span></td>
                        <td className="px-2 lg:px-0">{item.customer}</td>
                        <td className="px-2 lg:px-0">{item.buyAmt}</td>
                        <td className="px-2 lg:px-0">{item.currency}</td>
                        <td className="px-2 lg:px-0">{item.rate}</td>
                        <td className="px-2 lg:px-0">{item.sellAmt}</td>
                        <td className="px-2 lg:px-0">{item.currency1}</td>
                        <td className="px-2 lg:px-0"><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
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

      </div>

      {/* Mobile Sticky Action Bar */}
      {editMode && (
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
      )}
    </div>
  );
}
