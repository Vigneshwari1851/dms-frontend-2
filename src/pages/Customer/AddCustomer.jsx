import { useState } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/common/save.svg";
import { addCustomer } from "../../api/customers";

export default function AddCustomer() {
    
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");

    const handleAddCustomer = async () => {
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
                <h2 className="text-[16px] font-medium">Add New Customer</h2>
                <p className="text-gray-400 text-[12px] mb-6">Enter customer details.</p>

            </div>

            <div className="mt-4 bg-[#1A1F24] p-5 rounded-xl ">
                <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                        className="w-full bg-[#16191C] rounded-lg px-3 py-2"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                            className="w-full bg-[#16191C] rounded-lg px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>

                        <input
                            className="w-full bg-[#16191C] rounded-lg px-3 py-2 outline-none"
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
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={handleCancel} className="px-6 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200">Cancel</button>
                    <button
                        onClick={handleAddCustomer}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <img src={add} alt="add" className="w-5 h-5" />
                        Add Customer
                    </button>
                </div>

            </div>

        </>
    );
}
