import React from "react";

// Icons
import deactivateIcon from "../../assets/notification/deactivate.svg";
import deleteIcon from "../../assets/notification/cancel.svg";
import resetIcon from "../../assets/notification/link.svg";
import confirmIcon from "../../assets/notification/save.svg";
import activateIcon from "../../assets/notification/activate.svg";
import logoutIcon from "../../assets/notification/logout.svg";
import trashIcon from "../../assets/notification/trash.svg";

function NotificationCard({ confirmModal, onConfirm, onCancel }) {
    if (!confirmModal.open) return null;

    const {
        actionType,
        title,
        message,
        confirmText,
        cancelText = "Cancel",
    } = confirmModal;

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
        remove: trashIcon,
        authError: deleteIcon,
    };

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
        remove: "Delete",
    };

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
        remove: "#BD404A",
        authError: "#1D4CB5",
    };

    const iconToShow = iconMap[actionType] || confirmIcon;
    const finalConfirmLabel = confirmText || labelMap[actionType] || "Confirm";
    const confirmBtnColor = colorMap[actionType] || "#1E902D";

    // Filter for blue cross icon if it's an auth error
    const iconStyle = actionType === "authError" ? { filter: "invert(24%) sepia(91%) saturate(2251%) hue-rotate(212deg) brightness(95%) contrast(92%)" } : {};

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">

            <div className="w-full max-w-[470px] min-h-[374px] bg-[#1E2328] rounded-lg shadow-xl px-6 sm:px-10 pt-6 sm:pt-10 pb-6 flex flex-col items-center">

                <img
                    src={iconToShow}
                    alt="icon"
                    style={iconStyle}
                    className="w-full max-w-[150px] sm:max-w-none h-auto sm:h-[150px]"
                />
                <div className="mt-3 w-full flex flex-col gap-3 sm:gap-4 text-center">
                    <h2 className="text-lg sm:text-xl font-semibold text-white px-2">
                        {title}
                    </h2>

                    <p className="text-gray-400 text-sm sm:text-[15px] leading-relaxed px-2">
                        {message}
                    </p>
                </div>

                <div className="mt-auto w-full flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-6">
                    <button
                        onClick={onCancel}
                        className="flex-1 w-full sm:w-auto h-12 sm:h-11 border border-gray-500 rounded-lg text-white font-semibold hover:bg-white hover:text-black transition-all duration-200 text-sm sm:text-base py-3 sm:py-0 active:opacity-80"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        className="flex-1 w-full sm:w-auto h-12 sm:h-11 rounded-lg text-white font-semibold transition-all duration-200 hover:opacity-80 text-sm sm:text-base py-3 sm:py-0 active:opacity-80"
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
