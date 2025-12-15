import { useState, useRef } from "react";
import { formatDate, formatDateInput, parseDate } from "../../utils/dateUtils";
import DatePickerModal from "../import/DatePickerModal";

interface BirthdayInputFieldProps {
  value: string; // DD / MM / YYYY format string
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export default function BirthdayInputField({
  value,
  onChange,
  label = "Sinh nhật",
  required = false
}: BirthdayInputFieldProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Convert string value to Date object for DatePickerModal
  const getDateFromValue = (): Date => {
    if (value) {
      const parsed = parseDate(value);
      if (parsed) {
        return parsed;
      }
    }
    return new Date();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const formatted = formatDateInput(inputVal);
    setInputValue(formatted);
    const parsed = parseDate(formatted);
    if (parsed) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      onChange(`${day} / ${month} / ${year}`);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (!inputValue && value) {
      setInputValue(value);
    } else if (!inputValue) {
      setInputValue("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseDate(inputValue);
    if (parsed) {
      const day = String(parsed.getDate()).padStart(2, "0");
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const year = parsed.getFullYear();
      onChange(`${day} / ${month} / ${year}`);
    } else if (inputValue) {
      // If invalid, clear the input
      setInputValue("");
      onChange("");
    }
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleModalDateSelect = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedValue = `${day} / ${month} / ${year}`;
    onChange(formattedValue);
    setInputValue(formattedValue);
    setIsModalOpen(false);
  };

  const displayValue = isFocused ? inputValue : value || "";

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        <input
          ref={dateInputRef}
          type="text"
          required={required}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="DD / MM / YYYY"
          maxLength={13}
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
        selectedDate={getDateFromValue()}
        onDateSelect={handleModalDateSelect}
      />
    </div>
  );
}
