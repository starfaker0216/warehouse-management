"use client";

import { useState } from "react";
import PriceInput from "../common/PriceInput";

interface ItemPriceInputProps {
  value: number;
  onValueChange: (price: number) => void;
  index: number;
  label?: string;
  required?: boolean;
}

export default function ItemPriceInput({
  value,
  onValueChange,
  index,
  label = "Giá",
  required = false
}: ItemPriceInputProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <PriceInput
        value={value}
        inputValue={inputValue}
        onValueChange={onValueChange}
        onInputValueChange={setInputValue}
        placeholder="0"
        id={`price-input-${label}-${index}`}
        className="px-4 py-2"
        required={required}
      />
    </div>
  );
}
