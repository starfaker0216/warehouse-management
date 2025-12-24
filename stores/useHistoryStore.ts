"use client";

import { create } from "zustand";
import { getImportRecords, type ImportRecord } from "../lib/importService";
import { getExportRecords, type ExportRecord } from "../lib/exportService";
import { formatDateInput, parseDate } from "../utils/dateUtils";

export type HistoryType = "all" | "import" | "export";

export interface HistoryItem {
  id: string;
  type: "import" | "export";
  date: Date;
  warehouseId?: string;
  // Import fields
  phoneType?: string;
  quantity?: number;
  supplier?: string;
  employeeName?: string;
  // Export fields
  customerName?: string;
  customerPhone?: string;
  phoneName?: string;
  salePrice?: number;
  // Common
  note?: string;
}

interface HistoryState {
  loading: boolean;
  error: string | null;
  historyItems: HistoryItem[];
  startDate: Date | null;
  endDate: Date | null;
  startDateInput: string;
  endDateInput: string;
  selectedWarehouseId: string | null;
  selectedType: HistoryType;
  setStartDateInput: (value: string) => void;
  setEndDateInput: (value: string) => void;
  setSelectedWarehouseId: (warehouseId: string | null) => void;
  setSelectedType: (type: HistoryType) => void;
  fetchHistory: () => Promise<void>;
  applyFilter: () => Promise<void>;
  clearFilter: () => Promise<void>;
  resetError: () => void;
}

const isWithinRange = (
  date: Date | undefined,
  start?: Date | null,
  end?: Date | null
): boolean => {
  if (!start && !end) return true;
  if (!date) return true;
  const time = date.getTime();
  if (start && time < start.getTime()) return false;
  if (end) {
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    if (time > endOfDay.getTime()) return false;
  }
  return true;
};

const convertImportToHistoryItem = (record: ImportRecord): HistoryItem => ({
  id: record.id,
  type: "import",
  date: record.importDate,
  warehouseId: record.warehouseId,
  phoneType: record.phoneType,
  quantity: record.quantity,
  supplier: record.supplier,
  employeeName: record.employeeName,
  note: record.note
});

const convertExportToHistoryItem = (record: ExportRecord): HistoryItem => ({
  id: record.id,
  type: "export",
  date: record.createdAt || new Date(),
  warehouseId: record.warehouseId,
  customerName: record.customerName,
  customerPhone: record.customerPhone,
  phoneName: record.phoneName,
  salePrice: record.salePrice,
  employeeName: record.employeeName,
  note: record.note
});

const filterHistoryItems = (
  items: HistoryItem[],
  startDate: Date | null,
  endDate: Date | null,
  warehouseId: string | null,
  type: HistoryType
): HistoryItem[] => {
  return items.filter((item) => {
    // Filter by date
    if (!isWithinRange(item.date, startDate, endDate)) {
      return false;
    }

    // Filter by warehouse
    if (warehouseId && item.warehouseId !== warehouseId) {
      return false;
    }

    // Filter by type
    if (type !== "all" && item.type !== type) {
      return false;
    }

    return true;
  });
};

export const useHistoryStore = create<HistoryState>((set, get) => ({
  loading: false,
  error: null,
  historyItems: [],
  startDate: null,
  endDate: null,
  startDateInput: "",
  endDateInput: "",
  selectedWarehouseId: null,
  selectedType: "all",

  resetError: () => set({ error: null }),

  setStartDateInput: (value) => {
    set({ startDateInput: formatDateInput(value) });
  },

  setEndDateInput: (value) => {
    set({ endDateInput: formatDateInput(value) });
  },

  setSelectedWarehouseId: (warehouseId) => {
    set({ selectedWarehouseId: warehouseId });
  },

  setSelectedType: (type) => {
    set({ selectedType: type });
  },

  fetchHistory: async () => {
    set({ loading: true, error: null });

    try {
      const [imports, exports] = await Promise.all([
        getImportRecords(),
        getExportRecords()
      ]);

      const importItems = imports.map(convertImportToHistoryItem);
      const exportItems = exports.map(convertExportToHistoryItem);
      const allItems = [...importItems, ...exportItems].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      const { startDate, endDate, selectedWarehouseId, selectedType } = get();
      const filteredItems = filterHistoryItems(
        allItems,
        startDate,
        endDate,
        selectedWarehouseId,
        selectedType
      );

      set({ historyItems: filteredItems, loading: false });
    } catch (error) {
      console.error("Error fetching history:", error);
      set({
        loading: false,
        error: "Không thể tải lịch sử. Vui lòng thử lại."
      });
    }
  },

  applyFilter: async () => {
    const { startDateInput, endDateInput } = get();
    const parsedStart = startDateInput ? parseDate(startDateInput) : null;
    const parsedEnd = endDateInput ? parseDate(endDateInput) : null;

    if (startDateInput && !parsedStart) {
      set({
        error: "Ngày bắt đầu không hợp lệ. Vui lòng nhập DD / MM / YYYY."
      });
      return;
    }

    if (endDateInput && !parsedEnd) {
      set({
        error: "Ngày kết thúc không hợp lệ. Vui lòng nhập DD / MM / YYYY."
      });
      return;
    }

    if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
      set({ error: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc." });
      return;
    }

    set({ startDate: parsedStart, endDate: parsedEnd, error: null });
    await get().fetchHistory();
  },

  clearFilter: async () => {
    set({
      startDate: null,
      endDate: null,
      startDateInput: "",
      endDateInput: "",
      selectedWarehouseId: null,
      selectedType: "all",
      error: null
    });
    await get().fetchHistory();
  }
}));
