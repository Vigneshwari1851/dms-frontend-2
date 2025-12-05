import { useState } from "react";
import { useLocation } from "react-router-dom";
import Dropdown from "../../components/common/Dropdown";
import NotificationCard from "../../components/common/Notification";

export default function ViewUser() {
    const location = useLocation();

    const initialEdit = location.state?.edit || false;
    const [editMode, setEditMode] = useState(initialEdit);
    const [isActive, setIsActive] = useState(true);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        actionType: "",
        title: "",
        message: "",
    });

    const originalData = {
        full_name: "Vishnu VK",
        email: "email@example.com",
        phone: "+255 xxx xxx xxx",
        role: "Maker",
    };

    const [formData, setFormData] = useState(originalData);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setFormData(originalData); 
        setEditMode(false);
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
                    {/* ACTIVE BADGE */}
                    <span className="px-4 py-1 bg-[#10B93524] text-[#82E890] rounded-full text-[12px]">
                        Active
                    </span>

                    {/* EDIT BUTTON (Hidden in edit mode) */}
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
                                    actionType: "deactivate",
                                    title: isActive ? "Are you sure you want to deactivate this user account?" : "Activate Account",
                                    message: isActive
                                        ? "You are about to deactivate this user account. The user will be unable to log in or perform any actions until reactivated. Do you wish to continue?"
                                        : "You are about to activate this user account. The user will be able to log in or perform any actions until deactivated. Do you wish to continue?",
                                });
                            }}
                            disabled={!editMode}
                            className="sr-only peer"
                            
                        />

                        <div
                            className={`w-10 h-5 rounded-full transition ${
                                isActive ? "bg-blue-600" : "bg-gray-600"
                            } ${!editMode ? "opacity-60" : ""}`}
                        ></div>

                        <div
                            className={`absolute left-1 w-4 h-4 bg-white rounded-full transition ${
                                isActive ? "translate-x-5" : ""
                            } ${!editMode ? "opacity-60" : ""}`}
                        ></div>
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
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-500 text-white rounded-lg hover:bg-white hover:text-black transition-all duration-200"
                        >
                            Cancel
                        </button>

                        <button className="bg-[#1D4CB5] hover:bg-[#173B8B] px-6 py-2 rounded-lg text-white">
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
                                console.log("User deleted");
                                break;
                            case "resetPassword":
                                console.log("Password reset");
                                break;
                            case "deactivate":
                                setIsActive((prev) => !prev);
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
