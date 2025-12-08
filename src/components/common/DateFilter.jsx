import { useState, useRef, useEffect } from "react";
import calendar from "../../assets/common/calendar.svg";
import CalendarMini from "./CalendarMini";

export default function DateFilter({ onApply }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState("Today");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);

    const today = new Date();
    let start = null, end = null;

    if (option === "Today") {
      start = end = today;
    } else if (option === "Yesterday") {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      start = end = yesterday;
    } else if (option === "Last 7 days") {
      start = new Date();
      start.setDate(today.getDate() - 6);
      end = today;
    } else if (option === "This month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
    } else if (option === "Custom") {
      start = fromDate;
      end = toDate;
    }

    setFromDate(start);
    setToDate(end);
  };

  const handleApply = () => {
    if (onApply) onApply({ from: fromDate, to: toDate });
    setOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between gap-2 bg-[#131619] h-9 px-3 rounded-lg border border-[#2A2F33] text-sm text-white cursor-pointer select-none w-[140px]"
        onClick={() => setOpen(!open)}
      >
        <span>{selectedOption}</span>
        <img src={calendar} className="w-4 h-4 opacity-80" />
      </div>

      {open && (
        <div className="absolute top-12 right-2 w-[850px] bg-[#1B1F23] border border-[#2A2F33] rounded-xl p-5 z-50 shadow-lg flex gap-8">
          <div className="w-[180px] flex flex-col gap-4 border-r border-[#2A2F33] pr-4">
            {["Today", "Yesterday", "Last 7 days", "This month", "Custom"].map(
              (item) => (
                <div
                  key={item}
                  className={`text-white cursor-pointer hover:text-blue-400 text-[15px] ${
                    selectedOption === item ? "text-blue-400" : ""
                  }`}
                  onClick={() => handleOptionClick(item)}
                >
                  {item}
                </div>
              )
            )}
          </div>

          <div className="flex-1">
            {/* FROM / TO Row */}
            <div className="flex items-center gap-5 mb-4">
              <div className="flex flex-col flex-1">
                <label className="text-gray-400 text-xs mb-1">From:</label>
                <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm">
                  {fromDate
                    ? fromDate.toLocaleDateString()
                    : "dd-mm-yyyy"}
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-gray-400 text-xs mb-1">To:</label>
                <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm">
                  {toDate ? toDate.toLocaleDateString() : "dd-mm-yyyy"}
                </div>
              </div>
            </div>

            {/* Two Calendars */}
            <div className="flex gap-5">
              <CalendarMini
                onDateSelect={(date) => setFromDate(new Date(date.split("-").reverse().join("-")))}
                disabled={selectedOption !== "Custom"}
              />
              <CalendarMini
                onDateSelect={(date) => setToDate(new Date(date.split("-").reverse().join("-")))}
                disabled={selectedOption !== "Custom"}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end mt-5 gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-[#2A2F33] text-white text-sm"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
                onClick={handleApply}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
