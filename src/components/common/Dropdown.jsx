import { useState } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/common/tick.svg";

export default function Dropdown({ label, options, selected, onChange, className = "", renderOption }) {
    const [open, setOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <button
                className="w-full px-4 py-2 bg-[#16191C] rounded-lg text-[14px] text-[#ABABAB] font-normal flex items-center justify-between"
                onClick={() => setOpen(!open)}
            >
                {selected || label}
                <img src={down} alt="chevrondown" />
            </button>

            {open && (
                <ul className="absolute w-full mt-2 bg-[#2E3439] border border-[#2A2F33] rounded-lg z-10">
                    {options.map((item) => {
                        const key = typeof item === "string" ? item : item.label;

                        return (
                            <li
                                key={item}
                                onClick={() => {
                                    onChange(item);
                                    setOpen(false);
                                }}
                                className="px-4 py-2 whitespace-nowrap flex items-center justify-between hover:bg-[#2A2F33] cursor-pointer text-white"
                            >
                                <span>
                                    {renderOption ? renderOption(item) : typeof item === "string" ? item : item.label}
                                </span>

                                {(typeof item === "string" ? item : item.label) === (typeof selected === "string" ? selected : selected?.label) && (
                                    <img src={tick} alt="selected" className="w-4 h-4 ml-4 mr-2" />
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
