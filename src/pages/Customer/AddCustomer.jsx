import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/Common/save.svg";
import warning from "../../assets/warning.svg";
import { addCustomer, searchCustomers } from "../../api/customers";
import { appendCustomerLocal } from "../../utils/customerLocalStore";
import Dropdown from "../../components/common/Dropdown";

export default function AddCustomer() {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [deal_type, setDealType] = useState("");
    const [errors, setErrors] = useState({});
    const [phoneExists, setPhoneExists] = useState(false);
    const [existingCustomerName, setExistingCustomerName] = useState("");

    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) {
            newErrors.fullName = "Full Name is required";
        } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
            newErrors.fullName = "Name should only contain letters and spaces";
        }

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else {
            const digits = phone.replace(/[^\d+]/g, "");
            if (digits.length < 10) {
                newErrors.phone = "Phone number must be at least 10 digits";
            }
        }

        if (!deal_type) newErrors.deal_type = "Deal type is required";

        if (phoneExists) {
            newErrors.phone = "Phone number already exists";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        const checkPhone = async () => {
            const digitsValue = phone.replace(/[^\d+]/g, "");
            const onlyDigits = phone.replace(/\D/g, "");

            if (onlyDigits.length === 0) {
                setPhoneExists(false);
                setExistingCustomerName("");
                return;
            }

            // 1. Check Local Storage first (synchronous & fast)
            const localCustomers = JSON.parse(localStorage.getItem("customers_local")) || [];
            const localMatch = localCustomers.find(c => c.phone === onlyDigits);

            if (localMatch) {
                setPhoneExists(true);
                setExistingCustomerName(localMatch.name);
                return;
            }

            // 2. Check Server API
            try {
                const res = await searchCustomers(digitsValue, "phone", { limit: 20 });
                if (res.success && res.data) {
                    const match = res.data.find(c => {
                        const targetDigits = (c.phone_number || "").replace(/\D/g, "");
                        return targetDigits === onlyDigits;
                    });

                    if (match) {
                        setPhoneExists(true);
                        setExistingCustomerName(match.name);
                    } else {
                        setPhoneExists(false);
                        setExistingCustomerName("");
                    }
                } else {
                    setPhoneExists(false);
                    setExistingCustomerName("");
                }
            } catch (err) {
                console.error("Error checking phone:", err);
            }
        };

        checkPhone();
    }, [phone]);

    const handleAddCustomer = async () => {
        if (!validate()) return;

        const payload = {
            name: fullName,
            email: email || "",
            phone_number: phone,
            deal_type,
        };

        const res = await addCustomer(payload);

        if (res.success) {
            // Update local storage for immediate sync
            appendCustomerLocal(fullName, phone);

            navigate("/customer-info", {
                state: {
                    toast: {
                        message: "Customer added successfully",
                        type: "success",
                    },
                },
            });
        } else {
            navigate("/customer-info", {
                state: {
                    toast: {
                        message: "Failed to add customer",
                        type: "error",
                    },
                },
            });
        }
    };

    const handleCancel = () => {
        navigate("/customer-info");
    };

    const digits = phone.replace(/\D/g, "");
    const isPhoneValid = digits.length >= 10;

    return (
        <>
            <div >
                <h2 className="text-[16px] font-medium text-white lg:text-[16px]">Add New Customer</h2>
                <p className="text-gray-400 text-[12px] mb-6">Enter customer details.</p>

            </div>

            <div className="mt-4 bg-[#1A1F24] p-4 lg:p-5 rounded-xl">
                <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                        className={`w-full bg-[#16191C] rounded-lg px-3 py-2 ${errors.fullName ? "border border-red-500" : ""}`}
                        value={fullName}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^[a-zA-Z\s]*$/.test(val)) setFullName(val);
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Email</label>
                        <input
                            className={`w-full bg-[#16191C] rounded-lg px-3 py-2 ${errors.email ? "border border-red-500" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>

                        <input
                            className={`w-full bg-[#16191C] rounded-lg px-3 py-2 border
                                ${phoneExists || errors.phone
                                    ? "border-red-500"
                                    : "border-transparent"
                                }`}
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value;
                                const allowedChars = value.replace(/[^\d+]/g, "");
                                if (allowedChars.length > 15) return;
                                setPhone(allowedChars);
                            }}
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
                    <div>
                        <label className="block text-sm text-[#ABABAB] mt-2 mb-2">
                            Customer Type <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            label="Customer Type"
                            options={["Buy", "Sell"]}
                            selected={
                                deal_type === "buy" ? "Buy" :
                                    deal_type === "sell" ? "Sell" :
                                        ""
                            }
                            onChange={(val) => setDealType(val.toLowerCase())}
                            className={`w-full ${errors.deal_type ? "border border-red-500 rounded-lg" : ""}`}
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-8 lg:justify-end">
                    <button
                        onClick={handleCancel}
                        className="flex-1 lg:flex-none px-4 lg:px-6 py-3 lg:py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddCustomer}
                        disabled={phoneExists}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 lg:px-6 py-3 lg:py-2 rounded-lg text-sm font-medium ${phoneExists ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        <img src={add} alt="add" className="w-5 h-5" />
                        <span className="lg:hidden">Save</span>
                        <span className="hidden lg:inline">Save Customer</span>
                    </button>
                </div>

            </div>

        </>
    );
}
