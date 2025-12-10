import { create } from "zustand";
import {
  getColors,
  addColor,
  colorExists,
  getSuppliers,
  addSupplier,
  supplierExists
} from "../lib/configService";

interface ConfigState {
  colors: string[];
  suppliers: string[];
  loading: boolean;
  fetchColors: () => Promise<void>;
  fetchSuppliers: () => Promise<void>;
  fetchAll: () => Promise<void>;
  addColor: (colorName: string) => Promise<void>;
  addSupplier: (supplierName: string) => Promise<void>;
  processColorAndSupplier: (
    colorName: string,
    supplierName: string
  ) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  colors: [],
  suppliers: [],
  loading: false,

  fetchColors: async () => {
    try {
      const colorsData = await getColors();
      set({ colors: colorsData });
    } catch (err) {
      console.error("Error loading colors:", err);
    }
  },

  fetchSuppliers: async () => {
    try {
      const suppliersData = await getSuppliers();
      set({ suppliers: suppliersData });
    } catch (err) {
      console.error("Error loading suppliers:", err);
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [colorsData, suppliersData] = await Promise.all([
        getColors(),
        getSuppliers()
      ]);
      set({ colors: colorsData, suppliers: suppliersData, loading: false });
    } catch (err) {
      console.error("Error loading config:", err);
      set({ loading: false });
    }
  },

  addColor: async (colorName: string) => {
    try {
      const colorAlreadyExists = await colorExists(colorName);
      if (!colorAlreadyExists) {
        await addColor(colorName);
        const updatedColors = await getColors();
        set({ colors: updatedColors });
      }
    } catch (err) {
      console.error("Error adding color:", err);
      throw err;
    }
  },

  addSupplier: async (supplierName: string) => {
    try {
      const supplierAlreadyExists = await supplierExists(supplierName);
      if (!supplierAlreadyExists) {
        await addSupplier(supplierName);
        const updatedSuppliers = await getSuppliers();
        set({ suppliers: updatedSuppliers });
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
      throw err;
    }
  },

  processColorAndSupplier: async (colorName: string, supplierName: string) => {
    const promises: Promise<void>[] = [];

    if (colorName) {
      promises.push(get().addColor(colorName));
    }

    if (supplierName) {
      promises.push(get().addSupplier(supplierName));
    }

    await Promise.all(promises);
  }
}));

