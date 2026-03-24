import { useState, useRef, useEffect } from "react";
import calendar from "../../assets/Common/calendar.svg";
import CalendarMini from "./CalendarMini";

const OPTIONS = ["Day", "Weekly", "Monthly", "Date Range"];

/** Returns Monday of the current week */
function getMonday(d) {
  const day = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
  const diff = day === 0 ? -6 : 1 - day; // go back to Monday
  const mon = new Date(d);
  mon.setDate(d.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

/** Returns Friday of the current week */
function getFriday(d) {
  const mon = getMonday(d);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  fri.setHours(23, 59, 59, 999);
  return fri;
}

export default function DateFilter({ onApply, initialOption = "Day" }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [selectedOption, setSelectedOption] = useState(
    initialOption === "Today" ? "Day" : initialOption
  );
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        if (open) handleApply(true);
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, fromDate, toDate]);

  useEffect(() => {
    const mapped = initialOption === "Today" ? "Day" : initialOption;
    applyPreset(mapped);
    setSelectedOption(mapped);
  }, [initialOption]);

  const applyPreset = (option) => {
    const today = new Date();
    if (option === "Day") {
      const d = new Date(today);
      d.setHours(0, 0, 0, 0);
      setFromDate(d);
      setToDate(today);
    } else if (option === "Weekly") {
      setFromDate(getMonday(today));
      const fri = getFriday(today);
      setToDate(fri > today ? today : fri);
    } else if (option === "Monthly") {
      setFromDate(new Date(today.getFullYear(), today.getMonth(), 1));
      setToDate(today);
    }
    // "Date Range" → user picks; don't reset
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option !== "Date Range") {
      applyPreset(option);
    }
  };

  const handleApply = (isOuterClick = false) => {
    if (onApply) onApply({ from: fromDate, to: toDate }, isOuterClick);
    setOpen(false);
  };

  const isDateRange = selectedOption === "Date Range";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <div
        className="flex items-center justify-between gap-2 bg-[#131619] h-9 px-3 rounded-lg border border-[#2A2F33] text-xs sm:text-sm text-white cursor-pointer select-none w-full sm:w-[150px]"
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{selectedOption}</span>
        <img src={calendar} className="w-4 h-4 opacity-80 flex-shrink-0" alt="calendar" />
      </div>

      {open && (
        <div className="absolute top-11 right-0 bg-[#1B1F23] border border-[#2A2F33] rounded-xl z-[100] shadow-2xl overflow-hidden">
          <div className="flex">

            {/* ── Calendar area ── */}
            <div className="p-4">
              {isDateRange ? (
                /* DATE RANGE: two wide calendars */
                <>
                  {/* Date display */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-gray-400 text-xs">From:</label>
                      <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm min-w-[155px]">
                        {fromDate ? fromDate.toLocaleDateString() : "dd-mm-yyyy"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-gray-400 text-xs">To:</label>
                      <div className="bg-[#131619] rounded-lg border border-[#2A2F33] h-10 px-3 flex items-center text-white text-sm min-w-[155px]">
                        {toDate ? toDate.toLocaleDateString() : "dd-mm-yyyy"}
                      </div>
                    </div>
                  </div>
                  {/* Two wide calendars */}
                  <div className="flex gap-4">
                    <CalendarMini
                      wide
                      selectedDate={fromDate}
                      onDateSelect={(date) => setFromDate(date)}
                    />
                    <CalendarMini
                      wide
                      selectedDate={toDate}
                      onDateSelect={(date) => setToDate(date)}
                      disabled={!fromDate}
                      month={toDate ? undefined : fromDate?.getMonth()}
                      year={toDate ? undefined : fromDate?.getFullYear()}
                    />
                  </div>
                </>
              ) : selectedOption === "Day" ? (
                /* SINGLE DAY: Editable calendar */
                <div className="flex justify-center items-center">
                  <CalendarMini
                    wide
                    selectedDate={fromDate}
                    onDateSelect={(date) => {
                      setFromDate(date);
                      setToDate(date);
                    }}
                  />
                </div>
              ) : (
                /* PRESET (Weekly/Monthly): single read-only calendar showing selected range */
                <>
                  <p className="text-gray-400 text-xs mb-3">
                    {fromDate && toDate
                      ? `${fromDate.toLocaleDateString()} → ${toDate.toLocaleDateString()}`
                      : ""}
                  </p>
                  <CalendarMini
                    wide
                    rangeMode
                    rangeStart={fromDate}
                    rangeEnd={toDate}
                    readOnly
                  />
                </>
              )}
            </div>

            {/* ── Options list ── */}
            <div className="flex flex-col gap-3 p-5 border-l border-[#2A2F33] min-w-[150px]">
              <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Range</p>
              {OPTIONS.map((item) => (
                <div
                  key={item}
                  className={`cursor-pointer hover:text-white text-[15px] whitespace-nowrap transition-colors ${selectedOption === item ? "text-white font-semibold" : "text-[#B4B4B4]"
                    }`}
                  onClick={() => handleOptionClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="bg-[#16191C] px-5 py-3 flex justify-end gap-3 border-t border-[#2A2F33]">
            <button
              className="px-5 py-2 rounded-lg bg-[#1F2327] border border-[#2A2F33] text-white text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-[#1D4CB5] hover:bg-[#173B8B] text-white text-sm font-medium"
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
