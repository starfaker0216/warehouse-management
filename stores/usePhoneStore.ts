import { create } from "zustand";
import {
  Phone,
  addPhone as addPhoneService,
  updatePhone as updatePhoneService,
  deletePhone as deletePhoneService
} from "../lib/phoneService";
import {
  getListPhoneDetails,
  PhoneDetail,
  updatePhoneDetail as updatePhoneDetailService
} from "../lib/phoneDetailService";
import { useAuthStore } from "./useAuthStore";

interface PhoneState {
  listPhoneDetails: PhoneDetail[];
  loading: boolean;
  error: string | null;
  currentSearchTerm: string | undefined;
  fetchListPhoneDetails: (searchTerm?: string) => Promise<void>;
  addPhone: (
    phoneData: Omit<Phone, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updatePhone: (
    id: string,
    phoneData: Partial<Omit<Phone, "id" | "createdAt" | "updatedAt">>
  ) => Promise<void>;
  deletePhone: (id: string) => Promise<void>;
  updatePhoneDetail: (
    id: string,
    phoneDetailData: Partial<
      Omit<PhoneDetail, "id" | "createdAt" | "updatedAt">
    >
  ) => Promise<void>;
  setListPhoneDetails: (listPhoneDetails: PhoneDetail[]) => void;
}

export const usePhoneStore = create<PhoneState>((set) => ({
  listPhoneDetails: [],
  loading: false,
  error: null,
  currentSearchTerm: undefined,

  fetchListPhoneDetails: async (searchTerm?: string) => {
    set({ currentSearchTerm: searchTerm });
    set({ loading: true, error: null });
    try {
      // Ensure auth is initialized first
      const authState = useAuthStore.getState();
      if (authState.loading) {
        // If auth is still loading, initialize it
        authState.initialize();
      }

      // Wait a bit for auth to initialize if needed
      let employee = authState.employee;
      let retries = 0;
      const maxRetries = 10;

      while (!employee && retries < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const currentAuthState = useAuthStore.getState();
        employee = currentAuthState.employee;
        retries++;
      }

      const warehouseId = employee?.warehouseId;

      if (!warehouseId) {
        set({
          error: "Không tìm thấy thông tin kho. Vui lòng đăng nhập lại.",
          loading: false,
          listPhoneDetails: []
        });
        return;
      }

      const listPhoneDetailsData = await getListPhoneDetails(
        warehouseId,
        searchTerm
      );
      set({ listPhoneDetails: listPhoneDetailsData, loading: false });
    } catch (err) {
      console.error("Error loading list phone details:", err);
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
        const listPhoneDetailsData = await getListPhoneDetails(warehouseId);
        set({ listPhoneDetails: listPhoneDetailsData });
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
        const listPhoneDetailsData = await getListPhoneDetails(warehouseId);
        set({ listPhoneDetails: listPhoneDetailsData });
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
        const listPhoneDetailsData = await getListPhoneDetails(warehouseId);
        set({ listPhoneDetails: listPhoneDetailsData });
      }
    } catch (err) {
      console.error("Error deleting phone:", err);
      throw err;
    }
  },

  updatePhoneDetail: async (id, phoneDetailData) => {
    try {
      // Get employee info
      const employee = useAuthStore.getState().employee;
      const employeeId = employee?.id || "";
      const employeeName = employee?.name || "";
      const warehouseId = employee?.warehouseId;

      // Update phoneDetail with employee info
      await updatePhoneDetailService(id, {
        ...phoneDetailData,
        updatedBy: {
          employeeId,
          employeeName
        }
      });

      // Fetch lại với cùng search term
      if (warehouseId) {
        const currentState = usePhoneStore.getState();
        const listPhoneDetailsData = await getListPhoneDetails(
          warehouseId,
          currentState.currentSearchTerm
        );
        set({ listPhoneDetails: listPhoneDetailsData });
      }
    } catch (err) {
      console.error("Error updating phone detail:", err);
      throw err;
    }
  },

  setListPhoneDetails: (listPhoneDetails) => set({ listPhoneDetails })
}));
