import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerById, updateCustomer } from "../../api/customers";
import saveIcon from "../../assets/common/save.svg";
import edit from "../../assets/Common/edit.svg";
import Dropdown from "../../components/common/Dropdown";
import uparrowIcon from "../../assets/up_arrow.svg";
import downarrowIcon from "../../assets/down_arrow.svg";

export default function ViewCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone_number: "" });
  const [errors, setErrors] = useState({});
  const [initialData, setInitialData] = useState(null);
  const [customerDeals, setCustomerDeals] = useState([]);

  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currencyFilter, setCurrencyFilter] = useState("All Currencies");
  const [sortBy, setSortBy] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  const itemsPerPage = 10;

  const statuses = ["All Status", "Pending", "Completed"];
  const typeColors = { Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]", Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]" };
  const statusColors = { Pending: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]", Completed: "bg-[#1D4CB53D] text-[#88ACFC] border border-[#88ACFC]" };

  useEffect(() => {
    const loadCustomer = async () => {
      const res = await fetchCustomerById(id);
      if (!res.success) {
        return navigate("/customer-info", { state: { toast: { message: "Failed to load customer", type: "error" } } });
      }

      const customer = res.data;

      setFormData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number,
      });
      setInitialData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number,
      });

      const deals = (customer.deals || []).map((deal) => ({
        dealId: deal.id,
        id: deal.deal_number,
        date: new Date(deal.created_at).toLocaleDateString("en-IN"),
        type: deal.deal_type === "buy" ? "Buy" : "Sell",
        customer: customer.name,
        buyAmt: deal.buyAmount > 0 ? Number(deal.buyAmount).toLocaleString() : "--------",
        currency: deal.buyCurrency || "---",
        rate: deal.rate,
        sellAmt: deal.sellAmount > 0 ? Number(deal.sellAmount).toLocaleString() : "--------",
        currency1: deal.sellCurrency || "---",
        status: deal.status,
      }));

      setCustomerDeals(deals);
    };

    loadCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = { ...formData };
    const res = await updateCustomer(id, payload);

    if (res.success) {
      setEditMode(false);
      setInitialData(payload);
      navigate("/customer-info", { state: { toast: { message: "Customer updated successfully", type: "success" } } });
    } else {
      navigate("/customer-info", { state: { toast: { message: "Failed to update customer", type: "error" } } });
    }
  };

  const handleCancel = () => {
    if (initialData) setFormData(initialData);
    setEditMode(false);
  };

  let filteredData = customerDeals.filter(
    (d) =>
      (statusFilter === "All Status" || d.status === statusFilter) &&
      (currencyFilter === "All Currencies" || d.currency === currencyFilter) &&
      (d.id.toLowerCase().includes(search.toLowerCase()) || d.customer.toLowerCase().includes(search.toLowerCase()))
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

  const handleRowClick = (deal) => {
    if (deal?.dealId) navigate(`/edit-deal/${deal.dealId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[16px] font-medium text-white">{editMode ? "Edit Customer" : "Customer Deals"}</h2>
          <p className="text-gray-400 text-[12px]">{editMode ? "Edit customer info" : "View customer deals"}</p>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <button onClick={() => setEditMode(true)} className=" bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-md">
              <img src={edit} alt="edit" className="w-8 h-8 cursor-pointer" />
            </button>
          ) : (
            <>
              <button onClick={handleCancel} className="px-4 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] px-4 py-2 rounded-md text-white">
                <img src={saveIcon} alt="save" className="w-4 h-4" />
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        <div className={`${!editMode ? "flex-1" : "w-full"} bg-[#1A1F24] p-5 rounded-xl`}>
          {editMode ? (
            <>
              <div className="mb-4">
                <label className="block text-sm text-[#ABABAB] mb-1">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border border-[#2A2F33] focus:border-blue-500" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-[#ABABAB] mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border border-[#2A2F33] focus:border-blue-500" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[#ABABAB] mb-1">Phone</label>
                  <input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-[#16191C] text-white border border-[#2A2F33] focus:border-blue-500" />
                  {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-white text-[16px] font-semibold">Deals</h2>
                </div>
                <div className="flex items-center gap-3">
                  <Dropdown label="All Status" options={statuses} selected={statusFilter} onChange={setStatusFilter} className="w-[150px]" />
                  <Dropdown label="All Currencies" options={["All Currencies", ...new Set(customerDeals.map(d => d.currency))]} selected={currencyFilter} onChange={setCurrencyFilter} className="w-[180px]" />
                </div>
              </div>

              <div className="-mx-5">
                <table className="w-full text-center text-[#8F8F8F] font-normal text-[13px] border-collapse">
                  <thead>
                    <tr className="text-[#FFFFFF] text-[12px] font-normal">
                      <th className="py-3 text-left pl-5">Date</th>
                      <th
                        className="py-3 cursor-pointer select-none"
                        onClick={() => {
                          if (sortBy === "type") setSortAsc(!sortAsc);
                          else { setSortBy("type"); setSortAsc(true); }
                        }}
                      >
                        <div className="flex items-center gap-1 ml-2 justify-center">
                          Type
                          <span className="flex flex-col">
                            <img src={uparrowIcon} className={`w-3 h-3 -mt-[5px] ${sortBy === "type" && !sortAsc ? "opacity-100" : "opacity-30"}`} />
                            <img src={downarrowIcon} className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "type" && sortAsc ? "opacity-100" : "opacity-30"}`} />
                          </span>
                        </div>
                      </th>
                      <th>Customer Name</th>
                      <th>Buy Amount</th>
                      <th
                        className="py-3 cursor-pointer select-none"
                        onClick={() => {
                          if (sortBy === "currency") setSortAsc(!sortAsc);
                          else { setSortBy("currency"); setSortAsc(true); }
                        }}
                      >
                        <div className="flex items-center gap-1 ml-5 justify-center">
                          Currency
                          <span className="flex flex-col">
                            <img src={uparrowIcon} className={`w-3 h-3 -mt-[5px] ${sortBy === "currency" && !sortAsc ? "opacity-100" : "opacity-30"}`} />
                            <img src={downarrowIcon} className={`w-3 h-3 -mt-3 ml-1.5 ${sortBy === "currency" && sortAsc ? "opacity-100" : "opacity-30"}`} />
                          </span>
                        </div>
                      </th>
                      <th>Rate</th>
                      <th>Sell Amount</th>
                      <th>Currency</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => (
                      <tr key={idx} className="rounded-2xl hover:bg-[#151517] transition-colors cursor-pointer" onClick={() => handleRowClick(item)}>
                        <td className="py-3 font-normal text-[14px] text-left pl-5">{item.date}</td>
                        <td><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${typeColors[item.type]}`}>{item.type}</span></td>
                        <td>{item.customer}</td>
                        <td>{item.buyAmt}</td>
                        <td>{item.currency}</td>
                        <td>{item.rate}</td>
                        <td>{item.sellAmt}</td>
                        <td>{item.currency1}</td>
                        <td><span className={`px-3 py-1 rounded-2xl text-xs font-medium ${statusColors[item.status]}`}>{item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {!editMode && (
          <div className="w-80 bg-[#1A1F24] p-5 rounded-xl text-gray-400 flex items-center justify-center">
            Click a row to see details.
          </div>
        )}
      </div>
    </div>
  );
}
