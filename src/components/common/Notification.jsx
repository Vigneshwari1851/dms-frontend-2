import React from "react";

// Icons
import deactivateIcon from "../../assets/notification/deactivate.svg";
import deleteIcon from "../../assets/notification/cancel.svg";
import resetIcon from "../../assets/notification/link.svg";
import confirmIcon from "../../assets/notification/save.svg";
import activateIcon from "../../assets/notification/activate.svg";
import logoutIcon from "../../assets/notification/logout.svg";

function NotificationCard({ confirmModal, onConfirm, onCancel }) {
    if (!confirmModal.open) return null;

    const {
        actionType,
        title,
        message,
        confirmText,
        cancelText = "Cancel",
    } = confirmModal;

    // -------------------------------
    // ICON MAPPING
    // -------------------------------
    const iconMap = {
        deactivate: deactivateIcon,
        delete: deleteIcon,
        resetPassword: resetIcon,
        confirm: confirmIcon,
        approveDeal: confirmIcon,
        rejectDeal: deleteIcon,
        cancelApproveDeal: deactivateIcon,
        cancelRejectDeal: deactivateIcon,
        activate: activateIcon,
        logout: logoutIcon,
    };

    const iconToShow = iconMap[actionType] || confirmIcon;

    // -------------------------------
    // AUTO BUTTON LABELS
    // -------------------------------
    const labelMap = {
        approveDeal: "Approve",
        rejectDeal: "Reject",
        resetPassword: "Send Link",
        deactivate: "Deactivate Account",
        delete: "Delete",
        cancelApproveDeal: "Cancel Approve",
        cancelRejectDeal: "Cancel Reject",
        confirm: "Confirm",
        activate: "Activate Account",
        logout: "Log Out",
    };

    const finalConfirmLabel = confirmText || labelMap[actionType] || "Confirm";

    // -------------------------------
    // AUTO BUTTON COLORS
    // -------------------------------
    const colorMap = {
        approveDeal: "#1E902D",        
        rejectDeal: "#BD404A", 
        deactivate: "#BD404A",
        delete: "#BD404A",
        cancelApproveDeal: "#BD404A",
        cancelRejectDeal: "#BD404A",
        resetPassword: "#1D4CB5",
        activate: "#1E902D",
        logout: "#BD404A",
    };

    const confirmBtnColor = colorMap[actionType] || "#1E902D";

    // Confirm button class
    const confirmClasses =
        "flex-1 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-80";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="w-[475px] h-[408px] bg-[#1E2328] rounded-lg shadow-xl p-8 text-center relative">

                {/* Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 mt-5 flex items-center justify-center">
                        <img src={iconToShow} alt="icon" className="max-w-[150px] max-h-[200px]" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-white mt-7">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-gray-400 text-[15px] mt-3 mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Buttons */}
                <div className="absolute left-10 top-[324px] flex gap-2 w-[390px]" style={{ height: "44px" }}>

                    {/* Cancel */}
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-gray-500 rounded-lg text-white font-semibold hover:bg-white hover:text-black transition-all duration-200"
                    >
                        {cancelText}
                    </button>

                    {/* Confirm */}
                    <button
                        onClick={onConfirm}
                        className={confirmClasses}
                        style={{ backgroundColor: confirmBtnColor }}
                    >
                        {finalConfirmLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default NotificationCard;
