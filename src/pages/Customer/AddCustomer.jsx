import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/Common/save.svg";
import warning from "../../assets/warning.svg";
import { addCustomer } from "../../api/customers";
import { normalizePhone, checkDuplicate } from "../../utils/vector";
import PhoneInput from "../../components/common/PhoneInput.jsx";
import { capitalizeWords, onlyAlphabets } from "../../utils/stringUtils.jsx";
import Dropdown from "../../components/common/Dropdown";
import DiscardModal from "../../components/common/DiscardModal";

export default function AddCustomer() {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [deal_type, setDealType] = useState("");
    const [errors, setErrors] = useState({});
    const [phoneExists, setPhoneExists] = useState(false);
    const [existingCustomerName, setExistingCustomerName] = useState("");
    const [showDiscardModal, setShowDiscardModal] = useState(false);

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
        const runCheck = async () => {
            const match = await checkDuplicate(phone);
            if (match) {
                setPhoneExists(true);
                setExistingCustomerName(match.name);
            } else {
                setPhoneExists(false);
                setExistingCustomerName("");
            }
        };

        runCheck();
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

    const isDirty = !!(fullName.trim() || email.trim() || phone.trim() || deal_type);

    const handleCancel = () => {
        if (isDirty) {
            setShowDiscardModal(true);
        } else {
            navigate("/customer-info");
        }
    };

    const handleDiscard = () => navigate("/customer-info");

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
                        onChange={(e) => setFullName(onlyAlphabets(capitalizeWords(e.target.value)))}
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

                        <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            error={phoneExists || errors.phone}
                        />
                        {phoneExists && (
                            <div className="flex items-center gap-1.5 mt-2">
                                <img src={warning} alt="warning" className="w-4 h-4" />
                                <p className="text-red-400 text-[11px] font-medium">
                                    Duplicate phone number detected
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm text-[#ABABAB] mt-2 mb-3">
                            Customer Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6">
                            {["Buy", "Sell"].map((type) => (
                                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="radio"
                                            name="deal_type"
                                            value={type.toLowerCase()}
                                            checked={deal_type === type.toLowerCase()}
                                            onChange={(e) => setDealType(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded-full border-2 transition-all duration-200 
                                            ${deal_type === type.toLowerCase()
                                                ? "border-[#1D4CB5] bg-[#1D4CB5]"
                                                : "border-[#2A2F33] group-hover:border-[#4A5568]"}`}
                                        >
                                            {deal_type === type.toLowerCase() && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-sm font-medium transition-colors duration-200 
                                        ${deal_type === type.toLowerCase() ? "text-white" : "text-[#8F8F8F] group-hover:text-gray-300"}`}
                                    >
                                        {type}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.deal_type && (
                            <p className="text-red-400 text-xs mt-2">{errors.deal_type}</p>
                        )}
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

            <DiscardModal
                show={showDiscardModal}
                onDiscard={handleDiscard}
                onKeep={() => setShowDiscardModal(false)}
            />
        </>
    );
}
