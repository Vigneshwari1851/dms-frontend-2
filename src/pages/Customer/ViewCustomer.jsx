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
  const [selectedDeal, setSelectedDeal] = useState(null);

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
        phone_number: customer.phone_number
      });

      setInitialData({
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone_number
      });

      const deals = (customer.deals || []).map((deal) => ({
        raw: deal,
        dealId: deal.id,
        id: deal.deal_number,
        date: new Date(deal.created_at).toLocaleDateString("en-IN"),
        type: deal.deal_type,
        customer: customer.name,
        buyAmt: Number(deal.buyAmount).toLocaleString(),
        sellAmt: Number(deal.sellAmount).toLocaleString(),
        currency: deal.buyCurrency || "---",
        currency1: deal.sellCurrency || "---",
        rate: deal.rate,
        status: deal.status
      }));

      setCustomerDeals(deals);
    };

    loadCustomer();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name) e.name = "Required";
    if (!formData.email) e.email = "Required";
    if (!formData.phone_number) e.phone_number = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const res = await updateCustomer(id, formData);
    if (res.success) {
      setEditMode(false);
      setInitialData(formData);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setEditMode(false);
  };

  const handleRowClick = (item) => {
    const deal = item.raw;
    const isBuy = deal.deal_type === "Buy";

    const receivedSource = isBuy ? deal.received_items : deal.paid_items;
    const paidSource = isBuy ? deal.paid_items : deal.received_items;

    const receivedItems = (receivedSource || []).map((i) => ({
      denomination: `${i.currency.symbol}${i.price}`,
      quantity: i.quantity,
      total: Number(i.total).toLocaleString()
    }));

    const paidItems = (paidSource || []).map((i) => ({
      denomination: `${i.currency.symbol}${i.price}`,
      quantity: i.quantity,
      total: Number(i.total).toLocaleString()
    }));

    setSelectedDeal({
      type: deal.deal_type,
      date: item.date,
      id: item.id,
      mode: deal.transaction_mode,
      buyCurrency: deal.buyCurrency,
      sellCurrency: deal.sellCurrency,
      rate: `${deal.rate} ${deal.sellCurrency} / ${deal.buyCurrency}`,
      buyAmt: item.buyAmt,
      sellAmt: item.sellAmt,
      receivedItems,
      paidItems,
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
      <h4 className="text-[#7B8CFF] font-medium">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const DenominationTable = ({ title, items }) => (
    <div className="bg-[#16191C] p-2 rounded-lg space-y-2 shadow-md"> 
      {title && <h3 className="text-white text-sm font-semibold">{title}</h3>}
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left">Denomination</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, idx) => (
            <tr key={idx} className="text-white">
              <td>{i.denomination}</td>
              <td className="text-center">{i.quantity}</td>
              <td className="text-right">{i.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <div className="flex items-center justify-between mb-6">
        <div>
        <h2 className="text-white text-[16px] font-semibold">
          {editMode ? "Edit Customer" : formData.name}
        </h2>
        <p className="text-gray-400 text-[12px]">
          {editMode ? "Edit customer info" : `${formData.phone_number} - ${formData.email}`}
        </p>
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

      <div className="flex gap-6 items-start">
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
          <div className="w-80 bg-[#1A1F24] p-5 rounded-xl min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-grey">
            {!selectedDeal ? (
              <div className="text-center text-gray-400 h-full flex items-center justify-center">
                Click a row to see details
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <h3 className="text-white font-semibold">Deal Detail</h3>
                  <span className={`px-3 py-1 rounded-2xl ${typeColors[selectedDeal.type]}`}>
                    {selectedDeal.type}
                  </span>
                </div>

                <Row label="Date" value={selectedDeal.date} />
                <Row label="Deal ID" value={selectedDeal.id} />
                <Row label="Transaction Mode" value={selectedDeal.mode} />

                <Section title="Currency Information">
                  <Row label="Buy Currency" value={selectedDeal.buyCurrency} />
                  <Row label="Sell Currency" value={selectedDeal.sellCurrency} />
                  <Row label="Exchange Rate" value={selectedDeal.rate} />
                  <Row label="Amount (Buy)" value={`${selectedDeal.buyAmt} ${selectedDeal.buyCurrency}`} />
                </Section>

                <Section title="Denomination Details">
                  <DenominationTable title="Received Items" items={selectedDeal.receivedItems} />
                </Section>
                
                <Section title="">
                    <DenominationTable title="Paid Items" items={selectedDeal.paidItems} />
                </Section>

                <Section title="Final Summary">
                  <Row label="Total Buy Amount" value={`${selectedDeal.buyAmt} ${selectedDeal.buyCurrency}`} />
                  <Row label="Total Sell Amount" value={`${selectedDeal.sellAmt} ${selectedDeal.sellCurrency}`} />
                </Section>

                <Section title="Notes">
                  <p className="text-white text-xs">{selectedDeal.notes || "—"}</p>
                </Section>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
