import { useState } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/user/add_person.svg";
import Dropdown from "../../components/common/Dropdown";
import authLogo from "../../assets/verify/authlogo.svg";
import { createUser } from "../../api/user/user.jsx";

export default function AddUser() {
    
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const [phone, setPhone] = useState("");

    const handleAddUser = async () => {
        const payload = {
            full_name: fullName,
            email: email,
            phone_number: phone,
            role: role
        };

        const res = await createUser(payload);

        if (res.success) {
            navigate("/users", {
                state: {
                    toast: {
                        message: "User added successfully",
                        type: "success",
                    },
                },
            });
        } else {
            navigate("/users", {
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
        navigate("/users");
    };

    return (
        <>

            {/* Page Header */}
            <div >
                <h2 className="text-[16px] font-medium">Add New User</h2>
                <p className="text-gray-400 text-[12px] mb-6">Create a new user account for the system</p>

            </div>


            {/* Form Container */}
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

                <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mt-6 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>

                    <Dropdown
                        label="Select Role"
                        options={["Maker", "Checker"]}
                        selected={role}
                        onChange={setRole}
                        className="w-[580px]" 
                    />
                </div>

                <p className="flex items-start gap-2 font-normal text-[14px] text-[#C2C2C2] bg-[#5761D738] p-5 rounded-xl mt-6 mb-1">
                    <img src={authLogo} alt="auth logo" className="w-5 h-5" />
                        Default password will be sent to the user's email address. User will be required to change password on first login.
                </p>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={handleCancel} className="px-6 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200">Cancel</button>
                    <button
                        onClick={handleAddUser}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
                        <img src={add} alt="add" className="w-5 h-5" />
                        Add User
                    </button>
                </div>

            </div>

        </>
    );
}
