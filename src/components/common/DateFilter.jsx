import { useState, useRef, useEffect } from "react";
import calendar from "../../assets/Common/calendar.svg";
import CalendarMini from "./CalendarMini";
import Dropdown from "./Dropdown";

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
        className="flex items-center justify-between gap-2 bg-[#131619] h-9 px-3 rounded-lg border border-[#2A2F33] text-xs sm:text-sm text-white cursor-pointer select-none w-full sm:w-[140px]"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selectedOption}</span>
        <img src={calendar} className="w-4 h-4 opacity-80 flex-shrink-0" />
      </div>

      {open && (
        <div className="fixed sm:absolute inset-0 sm:inset-auto sm:top-12 sm:right-2 w-full sm:w-[750px] max-w-full sm:max-w-[750px] bg-[#1B1F23] sm:border sm:border-[#2A2F33] sm:rounded-xl z-[100] shadow-2xl flex flex-col h-full sm:h-auto overflow-hidden">

          {/* MOBILE HEADER */}
          <div className="flex sm:hidden items-center justify-between px-5 py-4 border-b border-[#2A2F33] bg-[#16191C]">
            <h3 className="text-white font-semibold">Select Date Range</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col sm:flex-row px-3 sm:px-5 pt-5 flex-1 overflow-y-auto sm:overflow-visible">

            {/* LEFT SIDE FULL COLUMN */}
            <div className="flex flex-col flex-1">

              {/* ROW 1: FROM + TO */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">

                <div className="flex flex-col flex-1">
                  <label className="text-gray-400 text-xs mb-1">From:</label>
                  <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm">
                    {fromDate ? fromDate.toLocaleDateString() : "dd-mm-yyyy"}
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <label className="text-gray-400 text-xs mb-1">To:</label>
                  <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm">
                    {toDate ? toDate.toLocaleDateString() : "dd-mm-yyyy"}
                  </div>
                </div>

                {/* MOBILE ONLY DROPDOWN */}
                <div className="sm:hidden flex flex-col mt-2">
                  <label className="text-gray-400 text-xs mb-1">Range:</label>
                  <Dropdown
                    options={["Today", "Yesterday", "Last 7 days", "This month", "Custom"]}
                    selected={selectedOption}
                    onChange={(val) => handleOptionClick(val)}
                    buttonClassName="h-10 bg-[#131619] border-[#2A2F33] text-sm text-white"
                  />
                </div>

              </div>

              {/* ROW 2: CALENDARS */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mt-4 pb-4 sm:ml-2 items-center sm:items-start justify-center sm:justify-start">

                <CalendarMini
                  selectedDate={fromDate}
                  onDateSelect={(date) => setFromDate(date)}
                  disabled={selectedOption !== "Custom"}
                />

                <CalendarMini
                  selectedDate={toDate}
                  onDateSelect={(date) => setToDate(date)}
                  disabled={selectedOption !== "Custom"}
                />


              </div>

            </div>

            {/* RIGHT SIDE OPTIONS (Desktop only) */}
            <div className="hidden sm:flex w-[180px] flex-col gap-3 ml-5 mt-5">
              {["Today", "Yesterday", "Last 7 days", "This month", "Custom"].map(
                (item) => (
                  <div
                    key={item}
                    className={`cursor-pointer hover:text-white text-[15px] ${selectedOption === item ? "text-white" : "text-[#B4B4B4]"
                      }`}
                    onClick={() => handleOptionClick(item)}
                  >
                    {item}
                  </div>
                )
              )}
            </div>

          </div>

          {/* FOOTER BUTTONS */}
          <div className="bg-[#16191C] px-3 sm:px-5 py-4 flex justify-between sm:justify-end gap-3 rounded-b-xl border-t border-[#2A2F33] mt-auto">
            <button
              className="flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-2 rounded-lg bg-[#1F2327] border border-[#2A2F33] text-white text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="flex-1 sm:flex-none px-4 sm:px-5 py-3 sm:py-2 rounded-lg bg-[#1D4CB5] text-white text-sm font-medium"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>

        </div>
      )}


    </div>
  );
}
