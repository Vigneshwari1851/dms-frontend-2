import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";

export default function Dropdown({ label, options, selected, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            {/* Button */}
            <button
                className="px-4 py-2 bg-[#16191C] rounded-lg text-[14px] text-[#E3E3E3] font-medium flex items-center gap-2"
                onClick={() => setOpen(!open)}
            >
                {selected || label}
                <img src={down} alt="chevrondown" />
            </button>

            {/* Dropdown List */}
            {open && (
                <ul className="absolute mt-2 min-w-[150px] bg-[#2E3439] border border-[#2A2F33] rounded-lg z-10">
                    {options.map((item) => (
                        <li
                            key={item}
                            onClick={() => {
                                onChange(item);
                                setOpen(false);
                            }}
                            className={`px-4 py-2 whitespace-nowrap flex items-center justify-between hover:bg-[#2A2F33] cursor-pointer text-white`}
                        >
                            <span>{item}</span>

                            {/* Tick Icon on Selected */}
                            {selected === item && (
                                <img src={tick} alt="selected" className="w-4 h-4 ml-4 mr-2" />
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
