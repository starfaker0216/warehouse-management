import { create } from "zustand";
import {
  Phone,
  addPhone as addPhoneService,
  updatePhone as updatePhoneService,
  deletePhone as deletePhoneService,
  getPhones
} from "../lib/phoneService";
import {
  getListPhoneDetails,
  PhoneDetail,
  updatePhoneDetail as updatePhoneDetailService
} from "../lib/phoneDetailService";
import { useAuthStore } from "./useAuthStore";

interface PhoneState {
  listPhoneDetails: PhoneDetail[];
  phones: Phone[];
  loading: boolean;
  error: string | null;
  currentSearchTerm: string | undefined;
  currentPage: number;
  itemsPerPage: number;
  totalCount: number;
  setCurrentPage: (page: number) => void;
  reloadListPhoneDetails: () => Promise<void>;
  fetchListPhoneDetails: (searchTerm?: string) => Promise<void>;
  fetchPhones: (searchTerm?: string) => Promise<void>;
  setPhones: (phones: Phone[]) => void;
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
  phones: [],
  loading: false,
  error: null,
  currentSearchTerm: undefined,
  currentPage: 1,
  itemsPerPage: 20,
  totalCount: 0,
  setCurrentPage: (page: number) => set({ currentPage: page }),

  fetchPhones: async (searchTerm?: string) => {
    set({ loading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      if (authState.loading) {
        authState.initialize();
      }

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
          phones: []
        });
        return;
      }

      const phonesData = await getPhones(searchTerm);
      set({ phones: phonesData, loading: false });
    } catch (err) {
      console.error("Error loading phones:", err);
      set({
        error:
          "Không thể tải danh sách máy. Vui lòng kiểm tra kết nối Firebase.",
        loading: false,
        phones: []
      });
    }
  },

  setPhones: (phones) => set({ phones }),

  reloadListPhoneDetails: async () => {
    const currentState = usePhoneStore.getState();
    set({ currentPage: 1 });
    await currentState.fetchListPhoneDetails(currentState.currentSearchTerm);
  },

  fetchListPhoneDetails: async (searchTerm?: string) => {
    const currentState = usePhoneStore.getState();
    const isSearchTermChanged = currentState.currentSearchTerm !== searchTerm;
    set({
      currentSearchTerm: searchTerm,
      currentPage: isSearchTermChanged ? 1 : currentState.currentPage
    });
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

      const currentState = usePhoneStore.getState();
      const result = await getListPhoneDetails(
        warehouseId,
        searchTerm,
        currentState.currentPage,
        currentState.itemsPerPage
      );
      set({
        listPhoneDetails: result.phoneDetails,
        totalCount: result.totalCount,
        loading: false
      });
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
      const currentState = usePhoneStore.getState();
      await currentState.reloadListPhoneDetails();
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

      await updatePhoneService(id, phoneData, employeeId, employeeName);
      const currentState = usePhoneStore.getState();
      await currentState.reloadListPhoneDetails();
    } catch (err) {
      console.error("Error updating phone:", err);
      throw err;
    }
  },

  deletePhone: async (id) => {
    try {
      await deletePhoneService(id);
      const currentState = usePhoneStore.getState();
      await currentState.reloadListPhoneDetails();
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

      // Update phoneDetail with employee info
      await updatePhoneDetailService(id, {
        ...phoneDetailData,
        updatedBy: {
          employeeId,
          employeeName
        }
      });
      const currentState = usePhoneStore.getState();
      await currentState.reloadListPhoneDetails();
    } catch (err) {
      console.error("Error updating phone detail:", err);
      throw err;
    }
  },

  setListPhoneDetails: (listPhoneDetails) => set({ listPhoneDetails })
}));
