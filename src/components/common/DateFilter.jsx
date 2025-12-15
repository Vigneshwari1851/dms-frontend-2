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
        <div className="absolute top-12 right-2 w-[750px] bg-[#1B1F23] border border-[#2A2F33] rounded-xl z-50 shadow-lg">

          <div className="flex px-5 pt-5">

            {/* LEFT SIDE FULL COLUMN */}
            <div className="flex flex-col flex-1">

              {/* ROW 1: FROM + TO */}
              <div className="flex gap-5">

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

              </div>

              {/* ROW 2: CALENDARS */}
              <div className="flex gap-5 mt-4 pb-4 ml-2">

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

            {/* RIGHT SIDE OPTIONS */}
            <div className="w-[180px] flex flex-col gap-3 ml-5 mt-5">
              {["Today", "Yesterday", "Last 7 days", "This month", "Custom"].map(
                (item) => (
                  <div
                    key={item}
                    className={`text-[#B4B4B4] cursor-pointer hover:text-white text-[15px] ${selectedOption === item ? "text-white" : ""
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
          <div className="bg-[#16191C] px-5 py-4 flex justify-end gap-3 rounded-b-xl border-t border-[#2A2F33]">
            <button
              className="px-5 py-2 rounded-lg bg-[#1F2327] border border-[#2A2F33] text-white text-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm"
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
