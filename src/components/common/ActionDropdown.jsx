import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function ActionDropdown({ options = [], vertical = false }) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [arrowInfo, setArrowInfo] = useState({ direction: "down", left: 0 });
  const buttonRef = useRef();
  const dropdownRef = useRef();

  const toggleDropdown = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuMaxHeight = 250; // slightly less than 300 to be safe

      let direction = "down";
      // If not enough space below AND more space above, flip it
      if (spaceBelow < menuMaxHeight && spaceAbove > spaceBelow) {
        direction = "up";
      }

      // Arrow horizontal center aligned with button center
      const arrowLeft = rect.left + rect.width / 2;
      setArrowInfo({ direction, left: arrowLeft });

      const newStyle = {
        position: "fixed",
        right: window.innerWidth - rect.right,
        width: "max-content",
        minWidth: "125px",
        overflowY: "auto",
        zIndex: 9999,
      };

      if (direction === "down") {
        newStyle.top = rect.bottom;
        newStyle.maxHeight = `${Math.max(100, spaceBelow - 20)}px`;
      } else {
        newStyle.bottom = window.innerHeight - rect.top;
        newStyle.maxHeight = `${Math.max(100, spaceAbove - 20)}px`;
      }

      setDropdownStyle(newStyle);
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
  const baseArrowStyle = {
    position: "fixed",
    left: arrowInfo.left,
    transform: "translate(-50%, 0)",
    width: 0,
    height: 0,
    borderLeft: `${arrowSize}px solid transparent`,
    borderRight: `${arrowSize}px solid transparent`,
    zIndex: 10000,
    pointerEvents: "none",
  };

  const arrowStyle =
    arrowInfo.direction === "down"
      ? {
        ...baseArrowStyle,
        top: dropdownStyle.top,
        transform: "translate(-50%, -100%)",
        borderBottom: `${arrowSize}px solid #1A1F24`,
      }
      : {
        ...baseArrowStyle,
        bottom: dropdownStyle.bottom,
        transform: "translate(-50%, 100%)", // shift it below the dropdown bottom edge
        borderTop: `${arrowSize}px solid #1A1F24`,
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
        {vertical ? <>&#8942;</> : <>&#8943;</>}
      </button>

      {open &&
        createPortal(
          <>
            {/* Directional arrow */}
            <div style={arrowStyle} />

            <div
              ref={dropdownRef}
              style={dropdownStyle}
              className="bg-[#1A1F24] rounded-xl shadow-2xl pointer-events-auto border border-[#2E3439]"
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
