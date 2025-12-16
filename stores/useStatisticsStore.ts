"use client";

import { create } from "zustand";
import { getPhones, type Phone } from "../lib/phoneService";
import { getImportRecords, type ImportRecord } from "../lib/importService";
import { getExportRecords, type ExportRecord } from "../lib/exportService";
import { getIncomeExpenseRecords, type IncomeExpenseRecord } from "../lib/incomeExpenseService";
import { getWarehouses } from "../lib/warehouseService";
import { useAuthStore } from "./useAuthStore";
import { formatDateInput, parseDate } from "../utils/dateUtils";

interface StatisticsTotals {
  totalRemainingQuantity: number;
  totalInventoryValue: number;
  totalImportValue: number;
  totalExportValue: number;
  totalIncome: number;
  totalExpense: number;
}

interface StatisticsState extends StatisticsTotals {
  loading: boolean;
  error: string | null;
  startDate: Date | null;
  endDate: Date | null;
  startDateInput: string;
  endDateInput: string;
  selectedWarehouseId: string | null;
  fetchStatistics: (options?: { startDate?: Date | null; endDate?: Date | null; warehouseId?: string | null }) => Promise<void>;
  setStartDateInput: (value: string) => void;
  setEndDateInput: (value: string) => void;
  setSelectedWarehouseId: (warehouseId: string | null) => void;
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

const calculateIncomeExpense = (
  records: IncomeExpenseRecord[],
  start?: Date | null,
  end?: Date | null
): { totalIncome: number; totalExpense: number } => {
  const filtered = records.filter((record) =>
    isWithinRange(record.createdAt, start, end)
  );

  const totalIncome = filtered
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  const totalExpense = filtered
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + (record.amount || 0), 0);

  return { totalIncome, totalExpense };
};

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  loading: false,
  error: null,
  startDate: null,
  endDate: null,
  startDateInput: "",
  endDateInput: "",
  selectedWarehouseId: null,
  totalRemainingQuantity: 0,
  totalInventoryValue: 0,
  totalImportValue: 0,
  totalExportValue: 0,
  totalIncome: 0,
  totalExpense: 0,

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

  fetchStatistics: async (options) => {
    const startDate = options?.startDate ?? get().startDate;
    const endDate = options?.endDate ?? get().endDate;
    const selectedWarehouseId = options?.warehouseId ?? get().selectedWarehouseId;

    set({ loading: true, error: null });
    try {
      const employee = useAuthStore.getState().employee;
      // Use selected warehouse or fallback to employee's warehouse
      const warehouseId = selectedWarehouseId || employee?.warehouseId || null;

      // For admin, if no warehouse selected, fetch all data
      // For non-admin, require warehouseId
      if (!employee?.role || (employee.role !== "admin" && !warehouseId)) {
        set({
          loading: false,
          error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại."
        });
        return;
      }

      // If warehouseId is provided, fetch phones for that warehouse
      // Otherwise (admin viewing all), we need to fetch all phones
      // Note: getPhones requires warehouseId, so we'll fetch all and filter
      const [imports, exports, incomeExpenses] = await Promise.all([
        getImportRecords(),
        getExportRecords(),
        getIncomeExpenseRecords()
      ]);

      // Fetch phones - if warehouseId is null (all), fetch from all warehouses
      let phones: Phone[] = [];
      if (warehouseId) {
        phones = await getPhones(warehouseId);
      } else if (employee.role === "admin") {
        // Admin viewing all - fetch from all warehouses
        const warehouses = await getWarehouses();
        const allPhonesPromises = warehouses.map((w) => getPhones(w.id));
        const allPhonesArrays = await Promise.all(allPhonesPromises);
        phones = allPhonesArrays.flat();
      } else {
        // Non-admin fallback to their warehouse
        const defaultWarehouseId = employee.warehouseId;
        if (defaultWarehouseId) {
          phones = await getPhones(defaultWarehouseId);
        }
      }

      const warehousePhones = warehouseId
        ? phones.filter((phone) => phone.warehouseId === warehouseId)
        : phones;
      const warehouseImports = warehouseId
        ? imports.filter((record) => record.warehouseId === warehouseId)
        : imports;
      const warehouseExports = warehouseId
        ? exports.filter((record) => record.warehouseId === warehouseId)
        : exports;
      const warehouseIncomeExpenses = warehouseId
        ? incomeExpenses.filter((record) => record.warehouseId === warehouseId)
        : incomeExpenses;

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
      const { totalIncome, totalExpense } = calculateIncomeExpense(
        warehouseIncomeExpenses,
        startDate,
        endDate
      );

      set({
        totalRemainingQuantity,
        totalInventoryValue,
        totalImportValue,
        totalExportValue,
        totalIncome,
        totalExpense,
        loading: false,
        ...(options
          ? {
              startDate,
              endDate,
              ...(options.warehouseId !== undefined && { selectedWarehouseId: options.warehouseId })
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
    const { startDateInput, endDateInput, selectedWarehouseId } = get();
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
    await get().fetchStatistics({ startDate: parsedStart, endDate: parsedEnd, warehouseId: selectedWarehouseId });
  },

  clearDateFilter: async () => {
    const { selectedWarehouseId } = get();
    set({
      startDate: null,
      endDate: null,
      startDateInput: "",
      endDateInput: "",
      error: null
    });
    await get().fetchStatistics({ startDate: null, endDate: null, warehouseId: selectedWarehouseId });
  }
}));

