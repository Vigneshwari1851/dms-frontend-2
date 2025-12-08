import { useState, useEffect } from "react";

export default function CalendarMini({ 
  onDateSelect, 
  month, 
  year, 
  selectedDate: parentSelectedDate, 
  disabled = false 
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(month ?? today.getMonth());
  const [currentYear, setCurrentYear] = useState(year ?? today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(parentSelectedDate);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October",
    "November", "December"
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Update calendar when props change
  useEffect(() => {
    if (month !== undefined) setCurrentMonth(month);
    if (year !== undefined) setCurrentYear(year);
    setSelectedDate(parentSelectedDate);
  }, [month, year, parentSelectedDate]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const blanks = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dates = [...Array(daysInMonth).keys()].map((d) => d + 1);

  const prevMonth = () => {
    if (currentMonth === 0) setCurrentYear((y) => y - 1);
    setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  };

  const nextMonth = () => {
    if (currentMonth === 11) setCurrentYear((y) => y + 1);
    setCurrentMonth((m) => (m === 11 ? 0 : m + 1));
  };

  const handleDateClick = (day) => {
    if (disabled) return; // Do nothing if disabled
    const date = new Date(currentYear, currentMonth, day);
    const formatted = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
    setSelectedDate(formatted);
    if (onDateSelect) onDateSelect(formatted);
  };

  return (
    <div className={`w-[280px] h-[260px] rounded-lg border border-[#2A2F33] p-3 text-white ${disabled ? "opacity-50 pointer-events-none bg-[#131619]" : "bg-[#131619]"}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="text-gray-400 hover:text-white">&lt;</button>
        <span className="font-semibold text-sm">{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={nextMonth} className="text-gray-400 hover:text-white">&gt;</button>
      </div>

      {/* DAYS LABEL */}
      <div className="grid grid-cols-7 text-center text-gray-400 text-xs mb-1">
        {days.map((d) => <div key={d}>{d}</div>)}
      </div>

      {/* DATES */}
      <div className="grid grid-cols-7 text-center text-sm">
        {Array(blanks).fill("").map((_, idx) => <div key={"b" + idx}></div>)}
        {dates.map((day) => {
          const dateStr = `${String(day).padStart(2,"0")}-${String(currentMonth+1).padStart(2,"0")}-${currentYear}`;
          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              className={`py-1 cursor-pointer rounded-md hover:bg-[#2A2F33] ${
                selectedDate === dateStr ? "bg-blue-600" : ""
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
