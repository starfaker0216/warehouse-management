import { useState, useRef } from "react";
import { formatDate, formatDateInput, parseDate } from "../../utils/dateUtils";
import DatePickerModal from "./DatePickerModal";

interface DateInputFieldProps {
  importDate: Date;
  dateInputValue: string;
  isDateFocused: boolean;
  onDateChange: (date: Date) => void;
  onDateInputValueChange: (value: string) => void;
  onDateFocus: (focused: boolean) => void;
}

export default function DateInputField({
  importDate,
  dateInputValue,
  isDateFocused,
  onDateChange,
  onDateInputValueChange,
  onDateFocus
}: DateInputFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDateInput(value);
    onDateInputValueChange(formatted);
    const parsed = parseDate(formatted);
    if (parsed) {
      onDateChange(parsed);
    }
  };

  const handleFocus = () => {
    onDateFocus(true);
    if (!dateInputValue) {
      onDateInputValueChange(formatDate(importDate));
    }
  };

  const handleBlur = () => {
    onDateFocus(false);
    const parsed = parseDate(dateInputValue);
    if (parsed) {
      onDateChange(parsed);
    } else if (dateInputValue) {
      // If invalid, reset to current date
      onDateInputValueChange(formatDate(importDate));
    }
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalDateSelect = (date: Date) => {
    onDateChange(date);
    onDateInputValueChange(formatDate(date));
    setIsModalOpen(false);
  };

  const displayValue = isDateFocused ? dateInputValue : formatDate(importDate);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Ngày Nhập <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          ref={dateInputRef}
          type="text"
          required
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="DD / MM / YYYY"
          maxLength={16}
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
        />
        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
          aria-label="Chọn ngày"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>
      </div>
      <DatePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={importDate}
        onDateSelect={handleModalDateSelect}
      />
    </div>
  );
}
