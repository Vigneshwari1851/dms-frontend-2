import { useState } from "react";

function VaultRow({ currency, amount, breakdown }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-[#16191C]">
            {/* MAIN ROW */}
            <div
                className="
                    flex items-center justify-between 
                    text-white text-[14px] py-3 cursor-pointer 
                    hover:bg-[#2A3036]
                "
                onClick={() => setOpen(!open)}
            >
                <span>{currency}</span>

                {/* Right Side */}
                <div className="flex items-center gap-3 min-w-[150px] justify-end">
                    <span>{amount}</span>

                    {/* Arrow */}
                    <svg
                        className={`transition-transform duration-200 ${
                            open ? "rotate-90" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#6B7280"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </div>

            {/* EXPANDED CONTENT */}
            {open && (
                <div className="bg-[#16191C] rounded-lg p-4 mt-1 mb-3">
                    {/* Header */}
                    <div className="flex justify-between text-[#9CA3AF] text-[13px] pb-2 border-b border-[#262B31]">
                        <span>Denomination</span>
                        <span>Quantity</span>
                        <span>Total</span>
                    </div>

                    {/* Breakdown rows */}
                    {breakdown.map((b, i) => (
                        <div
                            key={i}
                            className="flex justify-between text-white text-[14px] py-2"
                        >
                            <span>{b.denom}</span>
                            <span>{b.qty}</span>
                            <span>{b.total}</span>
                        </div>
                    ))}

                    {/* Total Row */}
                    <div className="flex justify-between text-[14px] font-semibold text-[#2ACC80] pt-2 border-t border-[#262B31]">
                        <span>Total</span>
                        <span></span>
                        <span>{amount}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VaultRow;
