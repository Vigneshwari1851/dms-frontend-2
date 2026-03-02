import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function ActionDropdown({ options = [] }) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [arrowInfo, setArrowInfo] = useState({ direction: "down", left: 0 });
  const buttonRef = useRef();
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = options.length * 36;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      let direction;
      if (spaceBelow >= dropdownHeight) {
        top = rect.bottom;
        direction = "down"; // dropdown is below → arrow points up (toward button)
      } else if (spaceAbove >= dropdownHeight) {
        top = rect.top - dropdownHeight;
        direction = "up"; // dropdown is above → arrow points down (toward button)
      } else if (spaceBelow >= spaceAbove) {
        top = rect.bottom;
        direction = "down";
      } else {
        top = 0;
        direction = "down";
      }


      // Arrow horizontal center aligned with button center
      const arrowLeft = rect.left + rect.width / 2;

      setArrowInfo({ direction, left: arrowLeft });
      setDropdownStyle({
        position: "fixed",
        right: window.innerWidth - rect.right,
        width: "max-content",
        top,
        minWidth: "120px",
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

  // Arrow sits on the edge of the dropdown facing the button
  const arrowSize = 7; // px
  const arrowStyle =
    arrowInfo.direction === "down"
      ? {
        // dropdown is below button → arrow on top edge, pointing up
        position: "fixed",
        left: arrowInfo.left,
        top: dropdownStyle.top,
        transform: "translate(-50%, -100%)",
        width: 0,
        height: 0,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderBottom: `${arrowSize}px solid #1A1F24`,
        zIndex: 10000,
        pointerEvents: "none",
      }
      : {
        // dropdown is above button → arrow on bottom edge, pointing down
        position: "fixed",
        left: arrowInfo.left,
        top: Number(dropdownStyle.top) + options.length * 36,
        transform: "translate(-50%, 0)",
        width: 0,
        height: 0,
        borderLeft: `${arrowSize}px solid transparent`,
        borderRight: `${arrowSize}px solid transparent`,
        borderTop: `${arrowSize}px solid #1A1F24`,
        zIndex: 10000,
        pointerEvents: "none",
      };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        className="text-white w-8 h-8 rounded-full flex items-center justify-center relative z-10 hover:bg-[#2E3439]"
      >
        &#8943;
      </button>

      {open &&
        createPortal(
          <>
            {/* Directional arrow */}
            <div style={arrowStyle} />

            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="bg-[#1A1F24] rounded shadow-lg pointer-events-auto"
            >
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  className="block w-full text-left text-xs px-4 py-2 text-[#FFFFFF] hover:bg-[#151517] whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation();
                    opt.onClick();
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

export default ActionDropdown;
