"use client";

import { useState } from "react";
import { format, startOfWeek, addDays } from "date-fns"; // npm i date-fns

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onChange: (range: DateRange) => void;
  className?: string;
}

export default function DateRangePicker({ onChange, className = "" }: DateRangePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  const today = new Date();
  const [range, setRange] = useState<DateRange>({ startDate: null, endDate: null });

  const days = [];
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Segunda-feira

  for (let i = 0; i < 42; i++) {
    const day = addDays(startDate, i);
    days.push(day);
  }

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  const isInRange = (day: Date) => {
    if (!range.startDate || !range.endDate) return false;
    return day >= range.startDate && day <= range.endDate;
  };

  const onDayClick = (day: Date) => {
    if (!range.startDate) {
      setRange({ startDate: day, endDate: null });
    } else if (!range.endDate && day > range.startDate) {
      setRange({ startDate: range.startDate, endDate: day });
      onChange(range);
      setShowPicker(false);
    } else {
      setRange({ startDate: day, endDate: null });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
      >
        <span>
          {range.startDate && range.endDate
            ? `${format(range.startDate, "dd/MM")} - ${format(range.endDate, "dd/MM")}`
            : "Todas as datas"}
        </span>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showPicker && (
        <div className="absolute left-0 top-full z-20 mt-1 w-80 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          <div className="grid grid-cols-7 gap-1 pt-2">
            {days.map((day) => {
              const isToday = isSameDay(day, today);
              const isStart = range.startDate && isSameDay(day, range.startDate);
              const isEnd = range.endDate && isSameDay(day, range.endDate);
              const isHovered = hoverDay && isSameDay(day, hoverDay);
              const isRange = isInRange(day);

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => onDayClick(day)}
                  onMouseEnter={() => setHoverDay(day)}
                  onMouseLeave={() => setHoverDay(null)}
                  disabled={day < new Date(Date.now() - 86400000 * 365)} // 1 ano atrás
                  className={`
                    relative h-10 w-10 rounded-md text-sm font-medium transition-all
                    disabled:text-gray-300 disabled:cursor-not-allowed
                    ${isToday && "ring-2 ring-blue-500 ring-offset-1"}
                    ${isStart && "bg-blue-500 text-white"}
                    ${isEnd && "bg-blue-500 text-white"}
                    ${isRange && !isStart && !isEnd && "bg-blue-100 text-blue-900"}
                    ${isHovered && !range.endDate && range.startDate && day > range.startDate && "bg-blue-100 text-blue-900"}
                    hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                />
              );
            })}
          </div>

          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => setShowPicker(false)}
              className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </button>
            {range.startDate && range.endDate && (
              <button
                onClick={() => {
                  onChange(range);
                  setShowPicker(false);
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Aplicar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}