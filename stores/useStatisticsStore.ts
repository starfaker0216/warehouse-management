"use client";

import { create } from "zustand";
import {
  getPhoneDetailsByWarehouseId,
  type PhoneDetail
} from "../lib/phoneDetailService";
import {
  getPhoneExportedsByWarehouseId,
  type PhoneExported
} from "../lib/phoneExportedService";
import { getImportRecords, type ImportRecord } from "../lib/importService";
import { getExportRecords, type ExportRecord } from "../lib/exportService";
import {
  getIncomeExpenseRecords,
  type IncomeExpenseRecord
} from "../lib/incomeExpenseService";
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
  fetchStatistics: (options?: {
    startDate?: Date | null;
    endDate?: Date | null;
    warehouseId?: string | null;
  }) => Promise<void>;
  setStartDateInput: (value: string) => void;
  setEndDateInput: (value: string) => void;
  setSelectedWarehouseId: (warehouseId: string | null) => void;
  applyDateFilter: () => Promise<void>;
  clearDateFilter: () => Promise<void>;
  resetError: () => void;
}

const isWithinRange = (
  date: Date | undefined,
  start?: Date | null,
  end?: Date | null
) => {
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
  phoneDetails: PhoneDetail[],
  start?: Date | null,
  end?: Date | null
): Pick<StatisticsTotals, "totalRemainingQuantity" | "totalInventoryValue"> => {
  const filteredPhoneDetails = phoneDetails.filter((phoneDetail) => {
    if (!start && !end) return true;
    const refDate = phoneDetail.updatedAt || phoneDetail.createdAt;
    return isWithinRange(refDate, start, end);
  });

  // Mỗi PhoneDetail đại diện cho 1 điện thoại
  const totalRemainingQuantity = filteredPhoneDetails.length;

  // Tính tổng giá trị từ importPrice của mỗi PhoneDetail
  const totalInventoryValue = filteredPhoneDetails.reduce(
    (sum, phoneDetail) => sum + (phoneDetail.importPrice || 0),
    0
  );

  return { totalRemainingQuantity, totalInventoryValue };
};

const calculateImportValue = async (
  phoneDetails: PhoneDetail[],
  phoneExporteds: PhoneExported[],
  start?: Date | null,
  end?: Date | null
): Promise<number> => {
  const matchingPhoneDetails = phoneDetails.filter((phoneDetail) => {
    const isInDateRange = isWithinRange(phoneDetail.createdAt, start, end);
    return isInDateRange;
  });

  const matchingPhoneExporteds = phoneExporteds.filter((phoneExported) => {
    const isInDateRange = isWithinRange(
      phoneExported.originalCreatedAt,
      start,
      end
    );
    return isInDateRange;
  });

  // Tính tổng importPrice từ cả phoneDetails và phoneExporteds
  const phoneDetailsSum = matchingPhoneDetails.reduce(
    (sum, phoneDetail) => sum + (phoneDetail.importPrice || 0),
    0
  );

  const phoneExportedsSum = matchingPhoneExporteds.reduce(
    (sum, phoneExported) => sum + (phoneExported.importPrice || 0),
    0
  );

  return phoneDetailsSum + phoneExportedsSum;
};

const calculateExportValue = (
  exports: ExportRecord[],
  start?: Date | null,
  end?: Date | null
) => {
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

// Helper: Validate employee and warehouse access
const validateEmployeeAndWarehouse = (
  employee: { role?: string; warehouseId?: string } | null,
  warehouseId: string | null
): { isValid: boolean; error?: string } => {
  if (!employee?.role) {
    return {
      isValid: false,
      error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại."
    };
  }

  if (employee.role !== "admin" && !warehouseId) {
    return {
      isValid: false,
      error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại."
    };
  }

  return { isValid: true };
};

// Helper: Determine warehouseId to use
const determineWarehouseId = (
  selectedWarehouseId: string | null,
  employeeWarehouseId: string | undefined
): string | null => {
  return selectedWarehouseId || employeeWarehouseId || null;
};

// Helper: Fetch phone details for a specific warehouse or all warehouses
const fetchPhoneDetailsForWarehouse = async (
  warehouseId: string | null,
  employeeRole: string | undefined
): Promise<PhoneDetail[]> => {
  if (warehouseId) {
    return await getPhoneDetailsByWarehouseId(warehouseId);
  }

  if (employeeRole === "admin") {
    // Admin viewing all - fetch from all warehouses
    const warehouses = await getWarehouses();
    const allPhoneDetailsPromises = warehouses.map((w) =>
      getPhoneDetailsByWarehouseId(w.id)
    );
    const allPhoneDetailsArrays = await Promise.all(allPhoneDetailsPromises);
    return allPhoneDetailsArrays.flat();
  }

  return [];
};

// Helper: Fetch phone exporteds for a specific warehouse or all warehouses
const fetchPhoneExportedsForWarehouse = async (
  warehouseId: string | null,
  employeeRole: string | undefined
): Promise<PhoneExported[]> => {
  if (warehouseId) {
    return await getPhoneExportedsByWarehouseId(warehouseId);
  }

  if (employeeRole === "admin") {
    // Admin viewing all - fetch from all warehouses
    const warehouses = await getWarehouses();
    const allPhoneExportedsPromises = warehouses.map((w) =>
      getPhoneExportedsByWarehouseId(w.id)
    );
    const allPhoneExportedsArrays = await Promise.all(
      allPhoneExportedsPromises
    );
    return allPhoneExportedsArrays.flat();
  }

  return [];
};

// Helper: Filter data by warehouse
const filterDataByWarehouse = <T extends { warehouseId?: string }>(
  data: T[],
  warehouseId: string | null
): T[] => {
  if (!warehouseId) return data;
  return data.filter((item) => item.warehouseId === warehouseId);
};

// Helper: Calculate all statistics values
const calculateAllStatistics = async (
  phoneDetails: PhoneDetail[],
  phoneExporteds: PhoneExported[],
  imports: ImportRecord[],
  exports: ExportRecord[],
  incomeExpenses: IncomeExpenseRecord[],
  startDate: Date | null,
  endDate: Date | null
): Promise<StatisticsTotals> => {
  const { totalRemainingQuantity, totalInventoryValue } = calculatePhoneTotals(
    phoneDetails,
    startDate,
    endDate
  );

  const [totalImportValue, totalExportValue, { totalIncome, totalExpense }] =
    await Promise.all([
      calculateImportValue(phoneDetails, phoneExporteds, startDate, endDate),
      Promise.resolve(calculateExportValue(exports, startDate, endDate)),
      Promise.resolve(
        calculateIncomeExpense(incomeExpenses, startDate, endDate)
      )
    ]);

  return {
    totalRemainingQuantity,
    totalInventoryValue,
    totalImportValue,
    totalExportValue,
    totalIncome,
    totalExpense
  };
};

// Helper: Build state update object
const buildStateUpdate = (
  statistics: StatisticsTotals,
  startDate: Date | null,
  endDate: Date | null,
  options?: {
    warehouseId?: string | null;
  }
) => {
  return {
    ...statistics,
    loading: false,
    ...(options
      ? {
          startDate,
          endDate,
          ...(options.warehouseId !== undefined && {
            selectedWarehouseId: options.warehouseId
          })
        }
      : {})
  };
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
    const selectedWarehouseId =
      options?.warehouseId ?? get().selectedWarehouseId;

    set({ loading: true, error: null });

    try {
      const employee = useAuthStore.getState().employee;
      const warehouseId = determineWarehouseId(
        selectedWarehouseId,
        employee?.warehouseId
      );

      // Validate access
      const validation = validateEmployeeAndWarehouse(employee, warehouseId);
      if (!validation.isValid) {
        set({ loading: false, error: validation.error || undefined });
        return;
      }

      // Fetch all required data in parallel
      const [imports, exports, incomeExpenses, phoneDetails, phoneExporteds] =
        await Promise.all([
          getImportRecords(),
          getExportRecords(),
          getIncomeExpenseRecords(),
          fetchPhoneDetailsForWarehouse(warehouseId, employee?.role),
          fetchPhoneExportedsForWarehouse(warehouseId, employee?.role)
        ]);

      // Filter data by warehouse
      const warehousePhoneDetails = filterDataByWarehouse(
        phoneDetails,
        warehouseId
      );
      const warehousePhoneExporteds = filterDataByWarehouse(
        phoneExporteds,
        warehouseId
      );
      const warehouseImports = filterDataByWarehouse(imports, warehouseId);
      const warehouseExports = filterDataByWarehouse(exports, warehouseId);
      const warehouseIncomeExpenses = filterDataByWarehouse(
        incomeExpenses,
        warehouseId
      );

      // Calculate all statistics
      const statistics = await calculateAllStatistics(
        warehousePhoneDetails,
        warehousePhoneExporteds,
        warehouseImports,
        warehouseExports,
        warehouseIncomeExpenses,
        startDate,
        endDate
      );

      // Update state
      set(
        buildStateUpdate(statistics, startDate, endDate, {
          warehouseId: options?.warehouseId
        })
      );
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
    await get().fetchStatistics({
      startDate: parsedStart,
      endDate: parsedEnd,
      warehouseId: selectedWarehouseId
    });
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
    await get().fetchStatistics({
      startDate: null,
      endDate: null,
      warehouseId: selectedWarehouseId
    });
  }
}));
