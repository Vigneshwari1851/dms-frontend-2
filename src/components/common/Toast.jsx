import React from "react";
import successIcon from "../../assets/toast/success.svg";
import failIcon from "../../assets/toast/fail.svg";
import pendingIcon from "../../assets/toast/pending.svg";

export default function Toast({ show, message, type }) {

    const getIcon = () => {
        if (type === "success") return successIcon;
        if (type === "error") return failIcon;
        return pendingIcon;
    };

    if (!show) return null;

    return (
        <>
            
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

            {/* TOAST */}
            <div
                className={`
           fixed top-[100px] left-[1150px] z-50
          flex items-center gap-4
           w-auto   h-14
          px-4 py-3 pr-10  
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
                <img src={getIcon()} alt="icon" className="w-20 h-20" />
                <span>
                    {message}
                </span>
            </div>
        </>
    );
}
