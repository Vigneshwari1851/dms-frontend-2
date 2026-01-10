import { useState, useRef, useEffect } from "react";
import down from "../../assets/dashboard/down.svg";
import tick from "../../assets/Common/tick.svg";

export default function Dropdown({
    label,
    options,
    selected,
    onChange,
    className = "",
    renderOption
}) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                className="w-full px-4 py-2 bg-[#16191C] rounded-lg text-[14px] text-white font-normal flex items-center justify-between"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
            >
                {selected || label}
                <img src={down} alt="chevrondown" />
            </button>

            {open && (
                <ul className="w-full mt-2 bg-[#2E3439] border border-[#2A2F33] rounded-lg z-10  max-h-48 overflow-y-auto scrollbar-dark absolute">
                    {options.map((item, index) => {
                        const value = typeof item === "string" ? item : item.label;

                        return (
                            <li
                                key={value ?? index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(item);
                                    setOpen(false);
                                }}
                                className="px-4 py-2 whitespace-nowrap flex items-center justify-between hover:bg-[#2A2F33] cursor-pointer text-white"
                            >
                                <span>
                                    {renderOption ? renderOption(item) : value}
                                </span>

                                {value ===
                                    (typeof selected === "string"
                                        ? selected
                                        : selected?.label) && (
                                        <img
                                            src={tick}
                                            alt="selected"
                                            className="w-4 h-4 ml-4 mr-2"
                                        />
                                    )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
