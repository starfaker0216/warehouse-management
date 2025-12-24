"use client";

import React, { useState } from "react";
import { formatDate, formatDateInput, parseDate } from "../../utils/dateUtils";
import DatePickerModal from "../import/DatePickerModal";

import { Warehouse } from "../../lib/warehouseService";

interface DateRangeFilterProps {
  startDateInput: string;
  endDateInput: string;
  warehouses: Warehouse[];
  selectedWarehouseId: string | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onWarehouseChange: (warehouseId: string | null) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function DateRangeFilter({
  startDateInput,
  endDateInput,
  warehouses,
  selectedWarehouseId,
  onStartDateChange,
  onEndDateChange,
  onWarehouseChange,
  onApply,
  onClear
}: DateRangeFilterProps) {
  const [isStartDateModalOpen, setIsStartDateModalOpen] = useState(false);
  const [isEndDateModalOpen, setIsEndDateModalOpen] = useState(false);

  const handleStartDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const formatted = formatDateInput(value);
    onStartDateChange(formatted);
  };

  const handleEndDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDateInput(value);
    onEndDateChange(formatted);
  };

  const handleStartCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsStartDateModalOpen(true);
  };

  const handleEndCalendarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEndDateModalOpen(true);
  };

  const handleStartDateSelect = (date: Date) => {
    onStartDateChange(formatDate(date));
    setIsStartDateModalOpen(false);
  };

  const handleEndDateSelect = (date: Date) => {
    onEndDateChange(formatDate(date));
    setIsEndDateModalOpen(false);
  };

  // Parse dates for modal, fallback to today if invalid
  const startDateForModal = parseDate(startDateInput) || new Date();
  const endDateForModal = parseDate(endDateInput) || new Date();

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Kho
          </label>
          <select
            value={selectedWarehouseId || "all"}
            onChange={(e) =>
              onWarehouseChange(
                e.target.value === "all" ? null : e.target.value
              )
            }
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="all">Tất cả kho</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ngày bắt đầu
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="DD / MM / YYYY"
              value={startDateInput}
              onChange={handleStartDateInputChange}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
            <button
              type="button"
              onClick={handleStartCalendarClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
              aria-label="Chọn ngày bắt đầu"
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
        </div>

        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ngày kết thúc
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="DD / MM / YYYY"
              value={endDateInput}
              onChange={handleEndDateInputChange}
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
            <button
              type="button"
              onClick={handleEndCalendarClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-300 transition-colors"
              aria-label="Chọn ngày kết thúc"
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
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-lg bg-blue-600 px-2 py-2 min-w-20 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
          >
            Áp dụng
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-2 min-w-20 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      {/* Start Date Picker Modal */}
      <DatePickerModal
        isOpen={isStartDateModalOpen}
        onClose={() => setIsStartDateModalOpen(false)}
        selectedDate={startDateForModal}
        onDateSelect={handleStartDateSelect}
      />

      {/* End Date Picker Modal */}
      <DatePickerModal
        isOpen={isEndDateModalOpen}
        onClose={() => setIsEndDateModalOpen(false)}
        selectedDate={endDateForModal}
        onDateSelect={handleEndDateSelect}
      />
    </div>
  );
}
