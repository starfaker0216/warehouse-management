"use client";

import { useState, useEffect } from "react";
import {
  formatCurrencyInput,
  parseCurrencyInput,
  formatPriceSuggest,
  getPriceSuggests
} from "../../utils/currencyUtils";

interface PriceInputProps {
  value: number;
  inputValue: string;
  onValueChange: (price: number) => void;
  onInputValueChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  label?: string;
  required?: boolean;
  maxSuggestions?: number;
}

export default function PriceInput({
  value,
  inputValue,
  onValueChange,
  onInputValueChange,
  placeholder = "0",
  id,
  className = "",
  label,
  required = false,
  maxSuggestions = 5
}: PriceInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [currentInputValue, setCurrentInputValue] = useState(inputValue);

  // Sync with prop changes
  useEffect(() => {
    setCurrentInputValue(inputValue);
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentInputValue(newValue);
    const numValue = parseCurrencyInput(newValue);

    onValueChange(numValue);

    if (numValue > 0) {
      const formatted = formatCurrencyInput(numValue);
      onInputValueChange(formatted);
      setCurrentInputValue(formatted);
    } else {
      onInputValueChange("");
      setCurrentInputValue("");
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value > 0) {
      const formatted = formatCurrencyInput(value);
      onInputValueChange(formatted);
      setCurrentInputValue(formatted);
    } else {
      onInputValueChange("");
      setCurrentInputValue("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Use the current input value to parse and format
    const currentValue = currentInputValue || inputValue;
    const numValue = parseCurrencyInput(currentValue);

    if (numValue > 0) {
      const formatted = formatCurrencyInput(numValue);
      onValueChange(numValue);
      onInputValueChange(formatted);
      setCurrentInputValue(formatted);
    } else {
      onValueChange(0);
      onInputValueChange("");
      setCurrentInputValue("");
    }
  };

  const handleSuggestClick = (suggestValue: number) => {
    onValueChange(suggestValue);
    const formattedValue = formatCurrencyInput(suggestValue);
    onInputValueChange(formattedValue);
    setIsFocused(true);

    if (id) {
      setTimeout(() => {
        const input = document.getElementById(id) as HTMLInputElement;
        if (input) {
          input.focus();
          input.setSelectionRange(formattedValue.length, formattedValue.length);
        }
      }, 0);
    }
  };

  const displayValue =
    currentInputValue ||
    inputValue ||
    (value > 0 ? formatCurrencyInput(value) : "");

  const allPriceSuggests =
    isFocused && currentInputValue ? getPriceSuggests(currentInputValue) : [];
  const priceSuggests = allPriceSuggests.slice(0, maxSuggestions);

  const inputElement = (
    <input
      type="text"
      id={id}
      required={required}
      value={displayValue}
      onChange={handleInputChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400 ${className}`}
    />
  );

  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {inputElement}
      {isFocused && inputValue && parseCurrencyInput(inputValue) > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {priceSuggests.map((suggestValue, index) => (
            <button
              key={index}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSuggestClick(suggestValue);
              }}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              {formatPriceSuggest(suggestValue)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
