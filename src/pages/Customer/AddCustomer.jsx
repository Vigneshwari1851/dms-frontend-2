import { useState } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/Common/save.svg";
import { addCustomer } from "../../api/customers";

export default function AddCustomer() {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = "Full Name is required";
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Enter a valid email";
        }
        if (!phone.trim()) newErrors.phone = "Phone number is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCustomer = async () => {
        if (!validate()) return;

        const payload = {
            name: fullName,
            email: email,
            phone_number: phone,
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
                        message: "Failed to add user",
                        type: "error",
                    },
                },
            });
        }
    };

    const handleCancel = () => {
        navigate("/customer-info");
    };

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
                        className={`w-full bg-[#16191C] rounded-lg px-3 py-2`}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                    {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                            className={`w-full bg-[#16191C] rounded-lg px-3 py-2 `}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>

                        <input
                            className={`w-full bg-[#16191C] rounded-lg px-3 py-2`}
                            value={phone}
                            onChange={(e) => {
                                let value = e.target.value;
                                const digits = value.replace(/\D/g, "");
                                if (digits.length > 15) return;
                                setPhone(value);
                            }}
                            onKeyDown={(e) => {
                                const allowedControlKeys = [
                                    "Backspace",
                                    "Delete",
                                    "ArrowLeft",
                                    "ArrowRight",
                                    "Tab",
                                ];
                                if (allowedControlKeys.includes(e.key)) return;
                                if (["+", " ", "-", "(", ")"].includes(e.key)) return;
                                if (/^[0-9]$/.test(e.key)) {
                                    const currentDigits = phone.replace(/\D/g, "");
                                    if (currentDigits.length >= 15) e.preventDefault();
                                    return;
                                }
                                e.preventDefault();
                            }}
                        />
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
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
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 lg:px-6 py-3 lg:py-2 rounded-lg text-sm font-medium"
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
