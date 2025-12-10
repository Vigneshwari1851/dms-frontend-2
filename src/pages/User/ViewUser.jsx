import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Dropdown from "../../components/common/Dropdown";
import NotificationCard from "../../components/common/Notification";
import { fetchUserById, updateUser, updateUserStatus, deleteUser } from "../../api/user/user.jsx"; 
import { sendResetPasswordEmail } from "../../api/auth/auth.jsx";

export default function ViewUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();


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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setEditMode(false);
    };

    const handleSave = async () => {
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-[16px] font-medium text-white">User Details</h2>
                    <p className="text-gray-400 text-[12px]">View and manage user information</p>
                </div>

                <div className="flex items-center gap-3">
                <span
                    className={`
                        px-4 py-1 rounded-full text-[12px]
                        ${isActive 
                            ? "bg-[#10B93524] text-[#82E890]"
                            : "bg-[#BD404A24] text-[#FF8A8A]"
                        }
                    `}
                >
                    {isActive ? "Active" : "Inactive"}
                </span>

                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 bg-[#1D4CB5] hover:bg-[#173B8B] h-7 w-[55px] text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>

            {/* MAIN FORM CONTAINER */}
            <div className="mt-4 bg-[#1A1F24] p-6 rounded-xl">
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
                </div>

                {/* EMAIL + PHONE */}
                <div className="grid grid-cols-2 gap-6 mt-6">
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
                    </div>

                    <div>
                        <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                            Phone
                        </label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            readOnly={!editMode}
                            className={`w-full rounded-lg px-3 py-2 text-white bg-[#16191C]
                                ${!editMode 
                                    ? "border border-transparent outline-none focus:ring-0 cursor-not-allowed opacity-80" 
                                    : "border border-[#2A2F33] focus:border-blue-500"}
                            `}
                        />
                    </div>
                </div>

                {/* ROLE */}
                <div className="mt-6">
                <label className="block font-normal text-sm text-[#ABABAB] mb-1">
                    Role
                </label>
                {!editMode && (
                        <input
                            value={formData.role}
                            readOnly
                        className={`w-[575px] bg-[#16191C] rounded-lg px-3 py-2 text-white
                            ${!editMode 
                                ? "border border-transparent hover:border-transparent outline-none focus:ring-0 cursor-not-allowed opacity-80"
                                : "border border-[#2A2F33] focus:border-blue-500"
                            }
                        `}
                        />
                )}
                {editMode && (
                        <Dropdown
                            label="Select Role"
                            options={["Maker", "Checker"]}
                            selected={formData.role}
                        onChange={(value) =>
                            setFormData((prev) => ({ ...prev, role: value }))
                        }
                            className="w-[566px]"
                        />
                    )}
                </div>

                {/* DIVIDER */}
                <div className="border-b border-[#2A2F33] my-6"></div>

                {/* ACCOUNT STATUS */}
                <h3 className="text-white font-semibold text-[14px] mb-3">
                    Account Status
                </h3>

                <div className="bg-[#16191C] px-5 py-4 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-white text-[14px] mb-1">Account Active</p>
                        <p className="text-[#9EA3A7] text-[12px]">
                            User can login and access the system
                        </p>
                    </div>

                    {/* SWITCH */}
                    <label
                        className={`relative inline-flex items-center ${
                            !editMode ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => {
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
                            disabled={!editMode}
                            className="sr-only peer"
                            
                        />
                        <div className={`w-10 h-5 rounded-full transition ${isActive ? "bg-blue-600" : "bg-gray-600"} ${!editMode ? "opacity-60" : ""}`}></div>
                        <div className={`absolute left-1 w-4 h-4 bg-white rounded-full transition ${isActive ? "translate-x-5" : ""} ${!editMode ? "opacity-60" : ""}`}></div>
                    </label>
                </div>

                {/* SECURITY ACTIONS - ONLY IN EDIT MODE */}
                {editMode && (
                    <>
                        <h3 className="text-white font-semibold text-[14px] mt-6 mb-3">
                            Security Actions
                        </h3>
                        <div className="flex gap-3">
                            <button
                                className="
                                    px-4 py-2 
                                    border border-[#1D4CB5] 
                                    text-white 
                                    rounded-md 
                                    text-sm 
                                    transition 
                                    hover:bg-[#1D4CB5]
                                    hover:text-white
                                "
                                onClick={() =>
                                    setConfirmModal({
                                        open: true,
                                        actionType: "resetPassword",
                                        title: "Are you sure you want to send a password reset link?",
                                        message: "You want to send a password reset link to this user’s registered email address? The user will be able to create a new password from their email.",
                                    })
                                }
                            >
                                Reset Password
                            </button>
                            <button
                                className="
                                    px-4 py-2 
                                    border border-[#B51D1D] 
                                    text-[#FF6B6B] 
                                    rounded-md 
                                    text-sm 
                                    transition
                                    hover:bg-[#B51D1D]
                                    hover:text-white
                                "
                                onClick={() =>
                                setConfirmModal({
                                    open: true,
                                    actionType: "delete",
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
                {editMode && (
                    <div className="flex justify-end gap-3 mt-8">
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
                            Save Changes
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
            </div>
        </>
    );
}
