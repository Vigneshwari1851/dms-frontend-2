import React from "react";
import successIcon from "../../assets/toast/success.svg";
import failIcon from "../../assets/toast/fail.svg";
import pendingIcon from "../../assets/toast/pending.svg";

export default function Toast({ show, message, type, onHide }) {
    React.useEffect(() => {
        if (show && onHide) {
            const timer = setTimeout(() => {
                onHide();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onHide]);

    const getIcon = () => {
        if (type === "success") return successIcon;
        if (type === "error") return failIcon;
        return pendingIcon;
    };

    if (!show) return null;

    return (
        <>
            {/* TOAST */}
            <div
                className={`
           fixed top-[100px] lg:top-[112px] z-50
           left-1/2 -translate-x-1/2 md:right-6 md:left-auto md:translate-x-0 lg:right-10
           flex items-center gap-4
           w-[90%] md:w-auto h-auto md:h-14
           px-4 py-2 md:py-3 pr-10
           rounded-lg
           text-white text-[16px] font-medium
           bg-[#2E3439]
           shadow-[0px_8px_10px_0px_#00000033,
                   0px_6px_30px_0px_#0000001F,
                   0px_16px_24px_0px_#00000024]

           backdrop-blur-xl
           transition-all duration-300
        `}
            >
                <img src={getIcon()} alt="icon" className="w-14 h-14 lg:w-20 lg:h-20" />
                <span>
                    {message}
                </span>
            </div>
        </>
    );
}
