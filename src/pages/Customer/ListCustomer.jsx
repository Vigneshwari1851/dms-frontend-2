import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Table from "../../components/common/Table";
import { searchCustomers } from "../../api/customers";
import add from "../../assets/Common/HPlus.svg";
import Toast from "../../components/common/Toast";

export default function ListCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("");

  useEffect(() => {
    if (location.state?.toast) {
      setToastMessage(location.state.toast.message);
      setToastType(location.state.toast.type);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  }, [location.state]);

  useEffect(() => {
    fetchCustomers("");
  }, []);

  const fetchCustomers = async (value) => {
    try {
      setLoading(true);
      const res = await searchCustomers(value.trim());
      if (res.success) {
        setCustomers(res.data || []);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      fetchCustomers(value);
    }, 300);
  };

  const handleAddCustomer = () => {
    navigate("/customer-info/add-customer");
  };

  const columns = [
    { label: "Customer Name", key: "full_name", align: "left" },
    { label: "Customer Type", key: "deal_type", align: "center" },
    { label: "Email", key: "email", align: "center" },
    { label: "Phone", key: "phone_number", align: "center" },
    { label: "Amount", key: "balance", align: "left"},
    { label: "Created At", key: "created_at", align: "center" },
  ];

  const dealTypeStyles = {
    Buy: "bg-[#10B93524] text-[#10B935] border border-[#10B935]",
    Sell: "bg-[#D8AD0024] text-[#D8AD00] border border-[#D8AD00]",
  };

  const tableData = customers.map((c) => {
    const dealTypeLabel = c.deal_type
      ? c.deal_type.charAt(0).toUpperCase() + c.deal_type.slice(1)
      : "-";

    return {
      id: c.id,
      full_name: c.name || c.full_name || c.customer_name || "-",
      deal_type: dealTypeLabel !== "-" ? (
        <span
          className={`
            inline-flex items-center justify-center
            px-3 py-1
            rounded-2xl
            text-xs font-medium
            ${dealTypeStyles[dealTypeLabel]}
          `}
        >
          {dealTypeLabel}
        </span>
      ) : (
        "-"
      ),
      email: c.email || "-",
      phone_number: c.phone_number || c.phone || c.mobile || "-",
      balance: c.balance,
      created_at: new Date(c.created_at).toISOString().split("T")[0],
    };
  });

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-white text-2xl font-semibold">Customer Ledger</h1>
        <button
          onClick={handleAddCustomer}
          className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <img src={add} alt="add" className="w-5 h-5" />
          Add Customer
        </button>
      </div>
      <p className="text-gray-400 mb-6">View all customers and their ledger</p>

      <div className="mt-8">
        <Table
          title="Search Customer"
          columns={columns}
          data={tableData}
          itemsPerPage={10}
          onSearch={handleSearch}
          onRowClick={(row) =>
            navigate(`/customer-info/view/${row.id}`)
          }          
          showRightSection={false}
        />
        {loading && <p className="text-white text-center mt-4">Searching...</p>}
      </div>
      <Toast show={showToast} message={toastMessage} type={toastType} />
    </>
  );
}
