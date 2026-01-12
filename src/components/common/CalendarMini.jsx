import { useState, useEffect } from "react";

export default function CalendarMini({
  onDateSelect,
  month,
  year,
  selectedDate,
  disabled = false
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(month ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(year ?? today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    if (month !== undefined) setCurrentMonth(month);
    if (year !== undefined) setCurrentYear(year);
  }, [month, year]);

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

  const handlePrevMonth = () => {
    setCurrentMonth(m => {
      if (m === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(m => {
      if (m === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  return (
    <div className={`w-full max-w-[280px] h-auto min-h-[260px] rounded-lg border border-[#2A2F33] p-3 text-white ${disabled ? "opacity-50 pointer-events-none" : ""}`}>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-2 px-1">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2A2F33] transition-colors"
        >
          &lt;
        </button>
        <span className="text-sm font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2A2F33] transition-colors"
        >
          &gt;
        </button>
      </div>

      {/* DAYS */}
      <div className="grid grid-cols-7 text-xs text-gray-400 mb-1 text-center">
        {days.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* DATES */}
      <div className="grid grid-cols-7 text-center text-sm">
        {Array(blanks).fill("").map((_, i) => <div key={i}></div>)}

        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(currentYear, currentMonth, day);

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={`py-1 rounded-md cursor-pointer hover:bg-[#2A2F33]
                ${isSameDate(dateObj, selectedDate) ? "bg-blue-600" : ""}
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
