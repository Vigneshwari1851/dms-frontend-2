import bgIcon from "../../assets/customer/bgimage.svg";
import searchIcon from "../../assets/Common/search.svg";
import add from "../../assets/Common/Hplus.svg";
import { useState,useEffect , useRef } from "react";
import { searchCustomers } from "../../api/customers";
import { useNavigate, useLocation } from "react-router-dom";
import Toast from "../../components/common/Toast";

export default function ListCustomer() {
    const navigate = useNavigate();
    const location = useLocation();
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const searchTimeoutRef = useRef(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    const handleAddcustomer = () => {
        navigate("/customer-info/add-customer");
    };

    useEffect(() => {
        if (location.state?.toast) {
            setToastMessage(location.state.toast.message);
            setToastType(location.state.toast.type);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        }
    }, [location.state]);
    
    const handleSearch = (value) => {
        setSearch(value);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!value || value.trim().length < 2) {
            setCustomers([]);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await searchCustomers(value.trim());
                if (res.success) {
                    setCustomers(res.data || []);
                } else {
                    setCustomers([]);
                }
            } catch (err) {
                console.error("Error searching customers:", err);
                setCustomers([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const showEmptyBox = !search;
    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-white text-2xl font-semibold">Customer Management</h1>

                <button onClick={handleAddcustomer} className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
                    <img src={add} alt="add" className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            <p className="text-gray-400 mb-6">View all customers and their deals</p>

            <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl" style={{ height: "515px" }}>
                      <div className="flex items-center gap-4">
                            <h2 className="text-white text-[16px] font-semibold">
                            Customer List
                            </h2>
                        <div
                        className="flex items-center bg-[#131619] border border-[#2A2F33] rounded-lg"
                        style={{
                            width: "508px",
                            height: "32px",
                            padding: "0 16px",
                            gap: "8px",
                        }}
                    >
                        <img src={searchIcon} alt="search" className="w-4 h-4 opacity-70" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search for Customers"
                            className="bg-transparent text-gray-400 text-sm outline-none w-full placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="border-t-[3px] border-[#16191C] mt-4 pt-4 -mx-6 px-5"></div>

                {showEmptyBox ? (
                    <div
                        className="bg-[#16191C] p-10 rounded-xl flex flex-col items-center justify-center h-[400px]"
                        style={{
                            borderWidth: "1px",
                            borderStyle: "dashed",
                            borderColor: "#155DFC",
                            borderRadius: "10px",
                        }}
                    >
                        <img src={bgIcon} alt="No Data" className="w-64 opacity-90" />

                        <h2 className="text-white font-semibold text-lg mt-8">
                            Search for Customers
                        </h2>

                        <p className="text-gray-400 mt-2 text-sm text-center w-[60%]">
                            Enter a customer name, email, or phone number in the search box above to find customers
                        </p>
                    </div>
                ) : loading ? (
                    <p className="text-white text-center mt-4">Searching...</p>
                ) : search && customers.length === 0 ? (
                    <p className="text-white text-center mt-4">No customers found</p>
                ) : (
                    <div className="w-full text-white overflow-y-auto" style={{ maxHeight: "calc(100% - 16px)" }}>
                        <div className="grid grid-cols-3 gap-4 mb-1 text-sm font-semibold pb-2">
                            <span>Customer Name</span>
                            <span className="text-center">Email</span>
                            <span className="text-center">Phone</span>
                        </div>

                        {customers.map((customer) => {
                            const name = customer.name || customer.full_name || customer.customer_name || "-";
                            const email = customer.email || "-";
                            const phone = customer.phone_number || customer.phone || customer.mobile || "-";

                            return (
                                <div
                                    key={customer.id || name}
                                    className="grid grid-cols-3 gap-4 py-2 text-sm text-gray-400"
                                    onClick={() => navigate(`/customer-info/view/${customer.id}`, { state: { customer } })}
                                >
                                    <span>{name}</span>
                                    <span className="text-center">{email}</span>
                                    <span className="text-center">{phone}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Toast show={showToast} message={toastMessage} type={toastType} />
        </>
    );
}
