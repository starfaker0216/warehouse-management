"use client";

import { create } from "zustand";
import {
  getImportRecordsPaginated,
  getImportRecordsCount,
  getImportRecordsWithLimit,
  type ImportRecord
} from "../lib/importService";
import {
  getExportRecordsPaginated,
  getExportRecordsCount,
  getExportRecordsWithLimit,
  type ExportRecord
} from "../lib/exportService";
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
  totalCount: number;
  startDate: Date | null;
  endDate: Date | null;
  startDateInput: string;
  endDateInput: string;
  selectedWarehouseId: string | null;
  selectedType: HistoryType;
  currentPage: number;
  itemsPerPage: number;
  setStartDateInput: (value: string) => void;
  setEndDateInput: (value: string) => void;
  setSelectedWarehouseId: (warehouseId: string | null) => void;
  setSelectedType: (type: HistoryType) => void;
  setCurrentPage: (page: number) => void;
  fetchHistory: () => Promise<void>;
  applyFilter: () => Promise<void>;
  clearFilter: () => Promise<void>;
  resetError: () => void;
  getTotalPages: () => number;
}

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

export const useHistoryStore = create<HistoryState>((set, get) => ({
  loading: false,
  error: null,
  historyItems: [],
  totalCount: 0,
  startDate: null,
  endDate: null,
  startDateInput: "",
  endDateInput: "",
  selectedWarehouseId: null,
  selectedType: "all",
  currentPage: 1,
  itemsPerPage: 20,

  resetError: () => set({ error: null }),

  setStartDateInput: (value) => {
    set({ startDateInput: formatDateInput(value) });
  },

  setEndDateInput: (value) => {
    set({ endDateInput: formatDateInput(value) });
  },

  setSelectedWarehouseId: (warehouseId) => {
    set({ selectedWarehouseId: warehouseId, currentPage: 1 });
  },

  setSelectedType: (type) => {
    set({ selectedType: type, currentPage: 1 });
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  fetchHistory: async () => {
    set({ loading: true, error: null });

    try {
      const {
        startDate,
        endDate,
        selectedWarehouseId,
        selectedType,
        currentPage,
        itemsPerPage
      } = get();

      const filters = {
        warehouseId: selectedWarehouseId,
        startDate: startDate,
        endDate: endDate
      };

      // Query based on type
      if (selectedType === "import") {
        const { records, totalCount } = await getImportRecordsPaginated(
          filters,
          currentPage,
          itemsPerPage
        );
        const importItems = records.map(convertImportToHistoryItem);
        set({
          historyItems: importItems,
          totalCount,
          loading: false
        });
      } else if (selectedType === "export") {
        const { records, totalCount } = await getExportRecordsPaginated(
          filters,
          currentPage,
          itemsPerPage
        );
        const exportItems = records.map(convertExportToHistoryItem);
        set({
          historyItems: exportItems,
          totalCount,
          loading: false
        });
      } else {
        // Query both and merge with pagination
        // For "all" type, we query both collections with a larger limit
        // to ensure we have enough data after merging and sorting
        // Then we paginate the merged results on client side

        // Calculate how many records we need from each collection
        // We query more to account for the fact that we need to merge and sort
        // A safe multiplier is 2-3x to ensure we have enough data
        const queryLimit = itemsPerPage * 3;

        // Calculate the range we need based on current page
        // For page 1: we need first itemsPerPage items
        // For page 2: we need itemsPerPage * 2 items, etc.
        const neededItems = currentPage * itemsPerPage;
        const actualQueryLimit = Math.max(queryLimit, neededItems);

        // Query both collections in parallel
        const [importRecords, exportRecords, importCount, exportCount] =
          await Promise.all([
            getImportRecordsWithLimit(filters, actualQueryLimit),
            getExportRecordsWithLimit(filters, actualQueryLimit),
            getImportRecordsCount(filters),
            getExportRecordsCount(filters)
          ]);

        const importItems = importRecords.map(convertImportToHistoryItem);
        const exportItems = exportRecords.map(convertExportToHistoryItem);
        const allItems = [...importItems, ...exportItems].sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        // Calculate total count (sum of both collections)
        const totalCount = importCount + exportCount;

        // Paginate merged results
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = allItems.slice(startIndex, endIndex);

        set({
          historyItems: paginatedItems,
          totalCount,
          loading: false
        });
      }
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

    set({
      startDate: parsedStart,
      endDate: parsedEnd,
      error: null,
      currentPage: 1
    });
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
      error: null,
      currentPage: 1
    });
    await get().fetchHistory();
  },

  getTotalPages: () => {
    const { totalCount, itemsPerPage } = get();
    return Math.ceil(totalCount / itemsPerPage);
  }
}));
