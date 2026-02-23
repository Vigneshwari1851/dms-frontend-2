import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Dropdown from "../../components/common/Dropdown";
import NotificationCard from "../../components/common/Notification";
import { fetchUserById, updateUser, updateUserStatus, deleteUser } from "../../api/user/user.jsx";
import { sendResetPasswordEmail } from "../../api/auth/auth.jsx";
import PhoneInput from "../../components/common/PhoneInput.jsx";
import { capitalizeWords, onlyAlphabets } from "../../utils/stringUtils.jsx";
import edit from "../../assets/Common/edit.svg";
import PhoneFlag from "../../components/common/PhoneFlag.jsx";

export default function ViewUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [errors, setErrors] = useState({});
    const initialEdit = location.state?.edit || false;
    const [editMode, setEditMode] = useState(initialEdit);
    const [isActive, setIsActive] = useState(true);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        role: "",
    });

    const [initialData, setInitialData] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(false);
    const [pendingReset, setPendingReset] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        actionType: "",
        title: "",
        message: "",
    });

    const validate = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) newErrors.full_name = "Full Name is required";

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "Phone number is required";
        }

        if (!formData.role.trim()) newErrors.role = "Role is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        const loadUser = async () => {
            const res = await fetchUserById(id);

            if (!res.success) {
                return navigate("/users", {
                    state: {
                        toast: {
                            message: "Failed to load user data",
                            type: "error",
                        },
                    },
                });
            }

            const user = res.data.user;

            setFormData({
                full_name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                role: user.role,
            });

            setIsActive(user.is_active);

            setInitialData({
                full_name: user.full_name,
                email: user.email,
                phone: user.phone_number,
                role: user.role,
                is_active: user.is_active,
            });
        };

        loadUser();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === "full_name") {
            finalValue = onlyAlphabets(capitalizeWords(value));
        }
        setFormData((prev) => ({ ...prev, [name]: finalValue }));
    };

    const handleCancel = () => {
        setEditMode(false);
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            if (pendingDelete) {
                const delRes = await deleteUser(id);
                if (!delRes.success) throw new Error("Delete failed");
            }
            if (pendingReset) {
                const resetRes = await sendResetPasswordEmail(formData.email);
                if (!resetRes) throw new Error("Reset password email failed");
            }
            const payload = {
                full_name: formData.full_name,
                email: formData.email,
                phone_number: formData.phone,
                role: formData.role,
            };

            const res = await updateUser(id, payload);
            if (!res.success) throw new Error("Update failed");
            const statusRes = await updateUserStatus(id, isActive);
            if (!statusRes.success) throw new Error("Status update failed");
            navigate("/users", {
                state: {
                    toast: {
                        message: "Changes saved successfully",
                        type: "success",
                    },
                },
            });
        } catch (err) {
            console.error(err);
            if (initialData) {
                setFormData({
                    full_name: initialData.full_name,
                    email: initialData.email,
                    phone: initialData.phone,
                    role: initialData.role,
                });
                setIsActive(initialData.is_active);
                setPendingDelete(false);
                setPendingReset(false);
            }

            navigate("/users", {
                state: {
                    toast: {
                        message: "Changes not updated",
                        type: "error",
                    },
                },
            });
        }
    };

    return (
        <>
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                    {/* Back arrow */}
                    <button
                        onClick={() => navigate("/users")}
                        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#2A2F33] transition-colors text-[#ABABAB] hover:text-white"
                        title="Back to Users"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-[16px] font-semibold text-white lg:text-[20px] flex items-center gap-2">
                        User Details
                        {formData.full_name && (
                            <>
                                <span className="text-[#3A3F45] font-light">—</span>
                                <span className="text-[#ABABAB] font-normal">{formData.full_name}</span>
                            </>
                        )}
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {!editMode && (
                        <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] text-white rounded-md px-3 py-1.5"
                        >
                        <img
                            src={edit}
                            alt="edit"
                            className="w-6 h-6"
                        />
                        <span>Edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN FORM CONTAINER */}
            <div className="mt-4 ml-10 bg-[#1A1F24] p-4 lg:p-6 rounded-xl">
                {/* FULL NAME */}
                <div>
                    <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                        Full Name
                    </label>
                    <input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        readOnly={!editMode}
                        className={`w-full rounded-lg px-3 py-2 text-white bg-[#16191C]
                            ${!editMode
                                ? "border border-transparent outline-none focus:ring-0 cursor-not-allowed opacity-80"
                                : "border border-[#2A2F33] focus:border-blue-500"}
                            `}
                    />
                    {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name}</p>}
                </div>

                {/* EMAIL + PHONE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!editMode}
                            className={`w-full rounded-lg px-3 py-2 text-white bg-[#16191C]
                                ${!editMode
                                    ? "border border-transparent outline-none focus:ring-0 cursor-not-allowed opacity-80"
                                    : "border border-[#2A2F33] focus:border-blue-500"}
                            `}
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Phone
                        </label>
                        {!editMode ? (
                            <div className="w-full rounded-lg px-3 py-2 bg-[#16191C] border border-transparent opacity-80">
                                <PhoneFlag phone={formData.phone} />
                            </div>
                        ) : (
                            <PhoneInput
                                value={formData.phone}
                                onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                                error={errors.phone}
                            />
                        )}
                        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                </div>

                {/* ROLE + STATUS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mt-6">
                    {/* ROLE */}
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Role
                        </label>
                        {!editMode ? (
                            <input
                                value={formData.role}
                                readOnly
                                className="w-full bg-[#16191C] rounded-lg px-3 py-2 text-white border border-transparent outline-none focus:ring-0 cursor-not-allowed opacity-80"
                            />
                        ) : (
                            <Dropdown
                                label="Select Role"
                                options={["Maker", "Checker"]}
                                selected={formData.role}
                                onChange={(value) =>
                                    setFormData((prev) => ({ ...prev, role: value }))
                                }
                                className="w-full"
                            />
                        )}
                        {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
                    </div>

                    {/* STATUS */}
                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Account Status
                        </label>
                        <div className="flex items-center gap-3 h-[38px] rounded-lg px-3">
                            {/* Custom pill toggle with text inside */}
                            <button
                                type="button"
                                disabled={!editMode}
                                onClick={() => {
                                    if (!editMode) return;
                                    setConfirmModal({
                                        open: true,
                                        actionType: isActive ? "deactivate" : "activate",
                                        title: isActive
                                            ? "Are you sure you want to deactivate this user account?"
                                            : "Are you sure you want to activate this user account?",
                                        message: isActive
                                            ? "You are about to deactivate this user account. The user will be unable to log in until reactivated. Do you want to continue?"
                                            : "You are about to activate this user account. The user will be able to log in. Do you want to continue?",
                                    });
                                }}
                                className={`relative flex items-center w-[110px] h-[32px] rounded-full transition-all duration-300 focus:outline-none
                                    ${isActive ? "bg-[#2bc5b4]" : "bg-[#C52B2B]"}
                                    ${!editMode ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                                `}
                            >
                                {/* Text inside pill — fills zone opposite the knob, centered */}
                                <span className={`absolute flex items-center justify-center text-white text-[11px] font-semibold tracking-wide transition-all duration-300
                                    ${isActive ? "left-0 right-[32px]" : "left-[32px] right-0"}`}
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                                {/* White circle knob */}
                                <span className={`absolute w-[24px] h-[24px] bg-white rounded-full shadow-md transition-all duration-300
                                    ${isActive ? "left-[80px]" : "left-[4px]"}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>


                {/* SECURITY ACTIONS - ONLY IN EDIT MODE */}
                {editMode && (
                    <>
                        <h3 className="text-white font-semibold text-[14px] mt-6 mb-4">
                            User Actions
                        </h3>
                        <div className="flex flex-col lg:flex-row gap-3">
                            <button
                                className="
                                    w-full lg:w-auto
                                    px-4 py-3 lg:py-2
                                    h-12 lg:h-auto
                                    border border-[#1D4CB5] 
                                    text-white 
                                    rounded-lg lg:rounded-md
                                    text-sm font-medium lg:font-normal
                                    transition 
                                    hover:bg-[#1D4CB5]
                                    hover:text-white
                                    active:opacity-80
                                "
                                onClick={() =>
                                    setConfirmModal({
                                        open: true,
                                        actionType: "resetPassword",
                                        title: "Are you sure you want to send a password reset link?",
                                        message: "You want to send a password reset link to this user's registered email address? The user will be able to create a new password from their email.",
                                    })
                                }
                            >
                                Reset Password
                            </button>
                            <button
                                className="
                                    w-full lg:w-auto
                                    px-4 py-3 lg:py-2
                                    h-12 lg:h-auto
                                    border border-[#B51D1D] 
                                    text-[#FF6B6B] lg:text-[#FF6B6B]
                                    rounded-lg lg:rounded-md
                                    text-sm font-medium lg:font-normal
                                    transition
                                    hover:bg-[#B51D1D]
                                    hover:text-white
                                    active:opacity-80
                                "
                                onClick={() =>
                                    setConfirmModal({
                                        open: true,
                                        actionType: "remove",
                                        title: "Are you sure you want to delete this account?",
                                        message: "You are about to delete this user account. Once deleted, the user will lose all system access. Do you wish to continue?",
                                    })
                                }
                            >
                                Delete Account
                            </button>
                        </div>
                    </>
                )}

                {/* Mobile Divider and Static Buttons */}
                {editMode && (
                    <div className="lg:hidden mt-8">
                        <div className="border-b border-[#2A2F33] mb-6"></div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    navigate("/users");
                                }}
                                className="flex-1 bg-[#2A2F34] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#343a40]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-[#1D4CB5] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#173B8B]"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}

                {editMode && (
                    <div className="hidden lg:flex justify-end gap-3 mt-8">
                        <button
                            onClick={() => {
                                navigate("/users", {
                                    state: {
                                        toast: {
                                            show: true,
                                            message: "Changes reverted",
                                            type: "error",
                                        },
                                    },
                                });
                            }}
                            className="px-6 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-[#1D4CB5] hover:bg-[#173B8B] px-6 py-2 rounded-lg text-white"
                        >
                            Save
                        </button>
                    </div>
                )}
                <NotificationCard
                    confirmModal={confirmModal}
                    onCancel={() =>
                        setConfirmModal((prev) => ({ ...prev, open: false }))
                    }
                    onConfirm={() => {
                        switch (confirmModal.actionType) {
                            case "delete":
                                setPendingDelete(true);
                                break;
                            case "resetPassword":
                                setPendingReset(true);
                                break;
                            case "deactivate":
                                setIsActive(false);
                                break;
                            case "activate":
                                setIsActive(true);
                                break;
                            default:
                                break;
                        }
                        setConfirmModal((prev) => ({ ...prev, open: false }));
                    }}
                />
            </div >


        </>
    );
}
