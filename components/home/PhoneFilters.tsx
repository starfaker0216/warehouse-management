"use client";

import { memo, useRef, useEffect } from "react";
import { Warehouse } from "../../lib/warehouseService";

interface PhoneFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAdmin: boolean;
  warehouses: Warehouse[];
  selectedWarehouseId: string | null;
  onWarehouseChange: (warehouseId: string) => void;
}

function PhoneFilters({
  searchTerm,
  onSearchChange,
  isAdmin,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange
}: PhoneFiltersProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocusedRef = useRef(false);

  // Track focus state
  const handleFocus = () => {
    isFocusedRef.current = true;
  };

  const handleBlur = () => {
    isFocusedRef.current = false;
  };

  // Restore focus after any re-render if it was focused
  useEffect(() => {
    if (isFocusedRef.current && inputRef.current) {
      // Use requestAnimationFrame to ensure focus happens after render
      const rafId = requestAnimationFrame(() => {
        if (inputRef.current && isFocusedRef.current) {
          inputRef.current.focus();
          // Restore cursor position
          const length = inputRef.current.value.length;
          inputRef.current.setSelectionRange(length, length);
        }
      });
      return () => cancelAnimationFrame(rafId);
    }
  });

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Tìm kiếm theo tên, IMEI..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
          />
        </div>
        {isAdmin && warehouses.length > 0 && (
          <div className="sm:w-64">
            <select
              value={selectedWarehouseId || ""}
              onChange={(e) => onWarehouseChange(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Chọn kho</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PhoneFilters);
