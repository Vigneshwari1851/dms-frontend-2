import React from "react";
import deactivateIcon from "../../assets/notification/deactivate.svg";
import deleteIcon from "../../assets/notification/cancel.svg";
import resetIcon from "../../assets/notification/link.svg";
import confirmIcon from "../../assets/notification/save.svg";

function NotificationCard({ confirmModal, onConfirm, onCancel }) {
    if (!confirmModal.open) return null;

    const { actionType, title, message } = confirmModal;

    const iconMap = {
        deactivate: deactivateIcon,
        delete: deleteIcon,
        resetPassword: resetIcon,
        confirm: confirmIcon,
    };

    const iconToShow = iconMap[actionType] || confirmIcon;

    const isReset = actionType === "resetPassword";
    const rightButtonLabel = isReset ? "Send Link" : "Confirm";
    const rightButtonClasses = isReset
        ? "flex-1 bg-[#1D4CB5] hover:bg-[#173B8B] text-white font-semibold rounded-lg transition-all duration-200"
        : "flex-1 bg-[#BD404A] hover:bg-[#9A2932] text-white font-semibold rounded-lg transition-all duration-200";


    return (
        <div className="fixed inset-0 bg-black flex justify-center items-center z-50">
            <div className="w-[470px] h-[408px] bg-[#1E2328] rounded-lg shadow-xl p-8 text-center relative">

                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center">
                        <img src={iconToShow} alt="icon" className="max-w-[150px] max-h-[200px] object-contain" />
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-white mt-12">
                    {title}
                </h2>

                <p className="text-gray-400 text-[15px] mt-3 mb-8 leading-relaxed">
                    {message}
                </p>

                <div
                    className="absolute left-10 top-[324px] flex gap-2 w-[390px]"
                    style={{ height: "44px" }}
                >
                    {/* Cancel Button */}
                    <button
                        onClick={onCancel}
                        className="flex-1 border border-gray-500 rounded-lg text-white font-semibold hover:bg-white hover:text-black transition-all duration-200"
                    >
                        No
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={onConfirm}
                        className={rightButtonClasses}
                    >
                        {rightButtonLabel}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default NotificationCard;
