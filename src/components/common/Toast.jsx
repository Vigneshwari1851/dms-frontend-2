import React from "react";
import successIcon from "../../assets/toast/success.svg";
import failIcon from "../../assets/toast/fail.svg";
import pendingIcon from "../../assets/toast/pending.svg";

export default function Toast({ show, message, type }) {
  const getGradient = () => {
    switch (type) {
      case "success":
        return "bg-[radial-gradient(circle_at_top_left,_#00ED51,_#00ED7B00),_#2E3439]";
      case "error":
        return "bg-[radial-gradient(circle_at_top_left,_#EB1D2E,_#EB1D2E00),_#2E3439]";
      case "pending":
        return "bg-[radial-gradient(circle_at_top_left,_#FFCC00,_#D8AD0000),_#2E3439]";
      default:
        return "bg-[#2E3439]";
    }
  };

  const getIcon = () => {
    if (type === "success") return successIcon;
    if (type === "error") return failIcon;
    return pendingIcon;
  };

  if (!show) return null;

  return (
    <>
      {/* 🔹 BACKGROUND OVERLAY (SAME AS HEADER) */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* 🔹 TOAST */}
      <div
        className={`
          fixed top-8 left-[1050px] z-50
          flex items-center gap-4
          w-[459px] h-14
          px-4 py-3
          rounded-lg
          text-white text-[16px] font-medium

          shadow-[0px_8px_10px_0px_#00000033,
                  0px_6px_30px_0px_#0000001F,
                  0px_16px_24px_0px_#00000024]

          backdrop-blur-xl
          transition-all duration-300
          ${getGradient()}
        `}
      >
        <img src={getIcon()} alt="icon" className="w-6 h-6" />
        <span className="whitespace-nowrap leading-none">
          {message}
        </span>
      </div>
    </>
  );
}
