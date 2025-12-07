import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function ActionDropdown({ options = [] }) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef();
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = options.length * 36;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      if (spaceBelow >= dropdownHeight) {
        top = rect.bottom;
      } else if (spaceAbove >= dropdownHeight) {
        top = rect.top - dropdownHeight;
      } else if (spaceBelow >= spaceAbove) {
        top = rect.bottom;
      } else {
        top = 0;
      }

      setDropdownStyle({
        position: "fixed",
        top,
        left: rect.left,
        minWidth: rect.width,
        maxHeight: "300px",
        overflowY: "auto",
        zIndex: 9999,
      });
    }

    setOpen(!open);
  };

  const handleClickOutside = (e) => {
    if (
      buttonRef.current &&
      dropdownRef.current &&
      !buttonRef.current.contains(e.target) &&
      !dropdownRef.current.contains(e.target)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center relative z-10 hover:bg-[#2E3439]"
      >
        &#8942;
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-[#1A1F24] rounded shadow-lg pointer-events-auto"
          >
            {options.map((opt, idx) => (
              <button
                key={idx}
                className="block w-full text-left text-xs px-4 py-2 text-[#FFFFFF] hover:bg-[#151517] whitespace-nowrap"
                onClick={() => {
                  opt.onClick();
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

export default ActionDropdown;
