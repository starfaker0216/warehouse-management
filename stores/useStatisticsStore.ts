"use client";

import { create } from "zustand";
import { getPhones, type Phone } from "../lib/phoneService";
import { getImportRecords, type ImportRecord } from "../lib/importService";
import { getExportRecords, type ExportRecord } from "../lib/exportService";
import { useAuthStore } from "./useAuthStore";
import { formatDateInput, parseDate } from "../utils/dateUtils";

interface StatisticsTotals {
  totalRemainingQuantity: number;
  totalInventoryValue: number;
  totalImportValue: number;
  totalExportValue: number;
}

interface StatisticsState extends StatisticsTotals {
  loading: boolean;
  error: string | null;
  startDate: Date | null;
  endDate: Date | null;
  startDateInput: string;
  endDateInput: string;
  fetchStatistics: (options?: { startDate?: Date | null; endDate?: Date | null }) => Promise<void>;
  setStartDateInput: (value: string) => void;
  setEndDateInput: (value: string) => void;
  applyDateFilter: () => Promise<void>;
  clearDateFilter: () => Promise<void>;
  resetError: () => void;
}

const isWithinRange = (date: Date | undefined, start?: Date | null, end?: Date | null) => {
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

const calculatePhoneTotals = (
  phones: Phone[],
  start?: Date | null,
  end?: Date | null
): Pick<StatisticsTotals, "totalRemainingQuantity" | "totalInventoryValue"> => {
  const filteredPhones = phones.filter((phone) => {
    if (!start && !end) return true;
    const refDate = phone.updatedAt || phone.createdAt;
    return isWithinRange(refDate, start, end);
  });

  const totalRemainingQuantity = filteredPhones.reduce(
    (sum, phone) => sum + (phone.totalQuantity || 0),
    0
  );

  const totalInventoryValue = filteredPhones.reduce((sum, phone) => {
    const phoneValue = phone.data.reduce((acc, item) => {
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      return acc + quantity * price;
    }, 0);
    return sum + phoneValue;
  }, 0);

  return { totalRemainingQuantity, totalInventoryValue };
};

const calculateImportValue = (imports: ImportRecord[], start?: Date | null, end?: Date | null) => {
  const filtered = imports.filter((record) =>
    isWithinRange(record.importDate, start, end)
  );

  return filtered.reduce((sum, record) => {
    const quantity = record.quantity || 0;
    const price = record.importPrice || 0;
    return sum + quantity * price;
  }, 0);
};

const calculateExportValue = (exports: ExportRecord[], start?: Date | null, end?: Date | null) => {
  const filtered = exports.filter((record) =>
    isWithinRange(record.createdAt, start, end)
  );

  return filtered.reduce((sum, record) => sum + (record.salePrice || 0), 0);
};

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  loading: false,
  error: null,
  startDate: null,
  endDate: null,
  startDateInput: "",
  endDateInput: "",
  totalRemainingQuantity: 0,
  totalInventoryValue: 0,
  totalImportValue: 0,
  totalExportValue: 0,

  resetError: () => set({ error: null }),

  setStartDateInput: (value) => {
    set({ startDateInput: formatDateInput(value) });
  },

  setEndDateInput: (value) => {
    set({ endDateInput: formatDateInput(value) });
  },

  fetchStatistics: async (options) => {
    const startDate = options?.startDate ?? get().startDate;
    const endDate = options?.endDate ?? get().endDate;

    set({ loading: true, error: null });
    try {
      const employee = useAuthStore.getState().employee;
      const warehouseId = employee?.warehouseId;

      if (!warehouseId) {
        set({
          loading: false,
          error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại."
        });
        return;
      }

      const [phones, imports, exports] = await Promise.all([
        getPhones(warehouseId),
        getImportRecords(),
        getExportRecords()
      ]);

      const warehousePhones = phones.filter(
        (phone) => !warehouseId || phone.warehouseId === warehouseId
      );
      const warehouseImports = imports.filter(
        (record) => !warehouseId || record.warehouseId === warehouseId
      );
      const warehouseExports = exports.filter(
        (record) => !warehouseId || record.warehouseId === warehouseId
      );

      const { totalRemainingQuantity, totalInventoryValue } = calculatePhoneTotals(
        warehousePhones,
        startDate,
        endDate
      );
      const totalImportValue = calculateImportValue(
        warehouseImports,
        startDate,
        endDate
      );
      const totalExportValue = calculateExportValue(
        warehouseExports,
        startDate,
        endDate
      );

      set({
        totalRemainingQuantity,
        totalInventoryValue,
        totalImportValue,
        totalExportValue,
        loading: false,
        ...(options
          ? {
              startDate,
              endDate
            }
          : {})
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      set({
        loading: false,
        error: "Không thể tải thống kê. Vui lòng thử lại."
      });
    }
  },

  applyDateFilter: async () => {
    const { startDateInput, endDateInput } = get();
    const parsedStart = startDateInput ? parseDate(startDateInput) : null;
    const parsedEnd = endDateInput ? parseDate(endDateInput) : null;

    if (startDateInput && !parsedStart) {
      set({ error: "Ngày bắt đầu không hợp lệ. Vui lòng nhập DD / MM / YYYY." });
      return;
    }

    if (endDateInput && !parsedEnd) {
      set({ error: "Ngày kết thúc không hợp lệ. Vui lòng nhập DD / MM / YYYY." });
      return;
    }

    if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
      set({ error: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc." });
      return;
    }

    set({ startDate: parsedStart, endDate: parsedEnd, error: null });
    await get().fetchStatistics({ startDate: parsedStart, endDate: parsedEnd });
  },

  clearDateFilter: async () => {
    set({
      startDate: null,
      endDate: null,
      startDateInput: "",
      endDateInput: "",
      error: null
    });
    await get().fetchStatistics({ startDate: null, endDate: null });
  }
}));

