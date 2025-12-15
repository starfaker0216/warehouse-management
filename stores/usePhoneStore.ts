import { create } from "zustand";
import {
  getPhones,
  Phone,
  addPhone as addPhoneService,
  updatePhone as updatePhoneService,
  deletePhone as deletePhoneService
} from "../lib/phoneService";
import { useAuthStore } from "./useAuthStore";

interface PhoneState {
  phones: Phone[];
  loading: boolean;
  error: string | null;
  fetchPhones: (searchTerm?: string, filterStatus?: string) => Promise<void>;
  addPhone: (
    phoneData: Omit<Phone, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePhone: (
    id: string,
    phoneData: Partial<Omit<Phone, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  deletePhone: (id: string) => Promise<void>;
  setPhones: (phones: Phone[]) => void;
}

export const usePhoneStore = create<PhoneState>((set) => ({
  phones: [],
  loading: false,
  error: null,

  fetchPhones: async (searchTerm?: string, filterStatus?: string) => {
    set({ loading: true, error: null });
    try {
      // Get warehouseId from logged in employee
      const employee = useAuthStore.getState().employee;
      const warehouseId = employee?.warehouseId;

      if (!warehouseId) {
        set({
          error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại.",
          loading: false,
          phones: []
        });
        return;
      }

      const phonesData = await getPhones(warehouseId, searchTerm, filterStatus);
      set({ phones: phonesData, loading: false });
    } catch (err) {
      console.error("Error loading phones:", err);
      set({
        error: "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối Firebase.",
        loading: false
      });
    }
  },

  addPhone: async (phoneData) => {
    try {
      await addPhoneService(phoneData);
      // Fetch lại với cùng search và filter nếu có
      const employee = useAuthStore.getState().employee;
      const warehouseId = employee?.warehouseId;
      if (warehouseId) {
        const phonesData = await getPhones(warehouseId);
        set({ phones: phonesData });
      }
    } catch (err) {
      console.error("Error adding phone:", err);
      throw err;
    }
  },

  updatePhone: async (id, phoneData) => {
    try {
      // Get employee info
      const employee = useAuthStore.getState().employee;
      const employeeId = employee?.id || "";
      const employeeName = employee?.name || "";
      const warehouseId = employee?.warehouseId;

      await updatePhoneService(id, phoneData, employeeId, employeeName);
      // Fetch lại với cùng search và filter nếu có
      if (warehouseId) {
        const phonesData = await getPhones(warehouseId);
        set({ phones: phonesData });
      }
    } catch (err) {
      console.error("Error updating phone:", err);
      throw err;
    }
  },

  deletePhone: async (id) => {
    try {
      await deletePhoneService(id);
      // Fetch lại với cùng search và filter nếu có
      const employee = useAuthStore.getState().employee;
      const warehouseId = employee?.warehouseId;
      if (warehouseId) {
        const phonesData = await getPhones(warehouseId);
        set({ phones: phonesData });
      }
    } catch (err) {
      console.error("Error deleting phone:", err);
      throw err;
    }
  },

  setPhones: (phones) => set({ phones })
}));
