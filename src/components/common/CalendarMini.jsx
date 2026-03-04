import { useState, useEffect } from "react";

export default function CalendarMini({
  onDateSelect,
  month,
  year,
  selectedDate,
  // Range-mode props
  rangeMode = false,
  rangeStart = null,
  rangeEnd = null,
  onRangeSelect = null,
  disabled = false,
  readOnly = false,  // shows highlight but no interaction
  wide = false,      // wider calendar for Date Range view
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(month ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(year ?? today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (month !== undefined) setCurrentMonth(month);
    if (year !== undefined) setCurrentYear(year);
  }, [month, year]);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate.getMonth());
      setCurrentYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (rangeMode && rangeStart) {
      setCurrentMonth(rangeStart.getMonth());
      setCurrentYear(rangeStart.getFullYear());
    }
  }, [rangeMode, rangeStart]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const isSameDate = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const isInRange = (dateObj) => {
    if (!rangeStart || !rangeEnd) return false;
    const startNorm = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const endNorm = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    const dNorm = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    return dNorm > startNorm && dNorm < endNorm;
  };

  const handleDateClick = (day) => {
    if (readOnly) return;
    const dateObj = new Date(currentYear, currentMonth, day);
    if (rangeMode && onRangeSelect) {
      onRangeSelect(dateObj);
    } else if (onDateSelect) {
      onDateSelect(dateObj);
    }
  };

  const handlePrevMonth = () => {
    if (readOnly) return;
    setCurrentMonth((m) => {
      if (m === 0) { setCurrentYear((y) => y - 1); return 11; }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    if (readOnly) return;
    setCurrentMonth((m) => {
      const nextMonth = m === 11 ? 0 : m + 1;
      const nextYear = m === 11 ? currentYear + 1 : currentYear;
      if (nextYear > today.getFullYear() || (nextYear === today.getFullYear() && nextMonth > today.getMonth())) return m;
      if (m === 11) { setCurrentYear((y) => y + 1); return 0; }
      return m + 1;
    });
  };

  const sizeClass = wide ? "w-[340px] min-h-[300px]" : "w-[280px] min-h-[260px]";

  return (
    <div
      className={`${sizeClass} h-auto rounded-lg border border-[#2A2F33] p-3 text-white ${disabled ? "opacity-50 pointer-events-none" : ""
        }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 px-1">
        <button
          onClick={handlePrevMonth}
          className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${readOnly ? "opacity-0 pointer-events-none" : "hover:bg-[#2A2F33]"}`}
        >
          &lt;
        </button>
        <span className="text-sm font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          disabled={currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth >= today.getMonth())}
          className={`w-8 h-8 flex items-center justify-center rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${readOnly ? "opacity-0 pointer-events-none" : "hover:bg-[#2A2F33]"}`}
        >
          &gt;
        </button>
      </div>

      {/* DAY HEADERS */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-1 text-center">
        {days.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      {/* DATES */}
      <div className="grid grid-cols-7 text-center text-sm">
        {Array(blanks).fill("").map((_, i) => <div key={i} />)}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(currentYear, currentMonth, day);
          const isFuture = dateObj > today;
          const isStart = rangeMode && isSameDate(dateObj, rangeStart);
          const isEnd = rangeMode && isSameDate(dateObj, rangeEnd);
          const isSelected = !rangeMode && isSameDate(dateObj, selectedDate);
          const inRange = rangeMode && isInRange(dateObj);

          return (
            <div
              key={day}
              onClick={() => !isFuture && handleDateClick(day)}
              className={`py-1.5 rounded-md transition-colors
                ${isStart || isEnd ? "bg-blue-600 text-white" : ""}
                ${isSelected ? "bg-blue-600 text-white" : ""}
                ${inRange ? "bg-blue-600/30 text-white" : ""}
                ${isFuture ? "opacity-30 text-gray-500" : ""}
                ${!isFuture && !readOnly ? "cursor-pointer hover:bg-[#2A2F33]" : ""}
                ${readOnly ? "cursor-default" : ""}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
