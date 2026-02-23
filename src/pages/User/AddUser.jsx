import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import add from "../../assets/Common/save.svg";
import Dropdown from "../../components/common/Dropdown";
import authLogo from "../../assets/verify/authlogo.svg";
import { createUser } from "../../api/user/user.jsx";
import Toast from "../../components/common/Toast";
import PhoneInput from "../../components/common/PhoneInput.jsx";
import { capitalizeWords, onlyAlphabets } from "../../utils/stringUtils.jsx";

export default function AddUser() {

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [phone, setPhone] = useState("");
    const [toast, setToast] = useState({ show: false, message: "", type: "" });
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

        if (!role) newErrors.role = "Role is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddUser = async () => {
        if (!validate()) return;

        const payload = {
            full_name: fullName,
            email,
            phone_number: phone,
            role,
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
            const errorMessage = res.error?.message || res.error?.error || "Failed to create user";
            // Show toast on current page instead of navigating
            setToast({
                show: true,
                message: errorMessage,
                type: "error"
            });

            // Hide toast after 3 seconds
            setTimeout(() => {
                setToast({ show: false, message: "", type: "" });
            }, 3000);
        }
    };

    const handleCancel = () => navigate("/users");

    return (
        <>

            {/* Page Header */}
            <div >
                <h2 className="text-[16px] font-semibold text-white lg:text-[20px]">Add New User</h2>
                <p className="text-gray-400 text-sm mt-1 hidden lg:block">Create a new user account for the system</p>

            </div>

            {/* Form Container */}
            <div className="mt-4 bg-[#1A1F24] p-4 lg:p-5 rounded-xl">
                {/* <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input
                        className="w-full bg-[#16191C] rounded-lg px-3 py-2"
                        value={fullName}
                        onChange={(e) => setFullName(onlyAlphabets(capitalizeWords(e.target.value)))}
                    />
                    {errors.fullName && (
                        <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                    )}
                </div> */}

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                     <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input
                            className="w-full bg-[#16191C] rounded-lg px-3 py-2"
                            value={fullName}
                            onChange={(e) => setFullName(onlyAlphabets(capitalizeWords(e.target.value)))}
                        />
                        {errors.fullName && (
                            <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                        )}
                      </div>
                        <div>
                            <label className="block text-sm text-[#ABABAB] mb-1">
                                Phone <span className="text-red-500">*</span>
                            </label>

                            <PhoneInput
                                value={phone}
                                onChange={setPhone}
                                error={errors.phone}
                            />
                            {errors.phone && (
                                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                            )}
                        </div>
                    </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB]  mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                            className="w-full bg-[#16191C] rounded-lg px-3 py-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Role <span className="text-red-500">*</span>
                        </label>

                        <Dropdown
                            label="Select Role"
                            options={["Maker", "Admin"]}
                            selected={role}
                            onChange={setRole}
                            className="w-full lg:w-[580px] max-w-full"
                        />
                        {errors.role && (
                            <p className="text-red-400 text-xs mt-1">{errors.role}</p>
                        )}
                    </div>
                </div>

                {/* <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mt-6 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>

                    <Dropdown
                        label="Select Role"
                        options={["Maker", "Admin"]}
                        selected={role}
                        onChange={setRole}
                        className="w-full lg:w-[580px] max-w-full"
                    />
                    {errors.role && (
                        <p className="text-red-400 text-xs mt-1">{errors.role}</p>
                    )}
                </div> */}

                {/* <p className="flex items-start gap-2 font-normal text-[14px] text-[#C2C2C2] bg-[#5761D738] p-5 rounded-xl mt-6 mb-1">
                    <img src={authLogo} alt="auth logo" className="w-5 h-5" />
                    Default password will be sent to the user's email address. User will be required to change password on first login.
                </p> */}

                {/* Buttons */}
                <div className="flex flex-col lg:flex-row justify-between lg:justify-end items-stretch lg:items-center gap-3 mt-8">
                    <button
                        onClick={handleCancel}
                        className="lg:hidden w-full h-12 px-4 py-3 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200 text-sm font-medium active:opacity-80"
                    >
                        Cancel
                    </button>
                    <div className="hidden lg:flex justify-end gap-3">
                        <button onClick={handleCancel} className="px-6 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200">Cancel</button>
                        <button
                            onClick={handleAddUser}
                            className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-10 text-white px-4 py-2 rounded-md text-sm font-medium">
                            <img src={add} alt="add" className="w-5 h-5" />
                            Save User
                        </button>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="lg:hidden w-full h-12 flex items-center justify-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white px-4 py-3 rounded-lg text-sm font-medium active:opacity-80">
                        <img src={add} alt="add" className="w-5 h-5" />
                        Save
                    </button>
                </div>

            </div>
            <Toast show={toast.show} message={toast.message} type={toast.type} />

        </>
    );
}
