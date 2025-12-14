import { create } from "zustand";
import { getWarehouses, type Warehouse } from "../lib/warehouseService";

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  fetchWarehouses: () => Promise<void>;
}

export const useWarehouseStore = create<WarehouseState>((set) => ({
  warehouses: [],
  loading: false,

  fetchWarehouses: async () => {
    set({ loading: true });
    try {
      const warehousesData = await getWarehouses();
      set({ warehouses: warehousesData, loading: false });
    } catch (err) {
      console.error("Error loading warehouses:", err);
      set({ loading: false });
    }
  }
}));
