import { create } from "zustand";
import { addImportRecord } from "../lib/importService";
import { updatePhone as updatePhoneService } from "../lib/phoneService";
import { usePhoneStore } from "./usePhoneStore";
import { useConfigStore } from "./useConfigStore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export interface ImportFormData {
  phoneId: string;
  importDate: Date;
  phoneType: string;
  quantity: number;
  imei: string;
  color: string;
  importPrice: number;
  supplier: string;
  imeiType: string;
  note: string;
}

const initialFormData: ImportFormData = {
  phoneId: "",
  importDate: new Date(),
  phoneType: "",
  quantity: 0,
  imei: "",
  color: "",
  importPrice: 0,
  supplier: "",
  imeiType: "",
  note: ""
};

interface ImportFormState {
  formData: ImportFormData;
  newColor: string;
  newSupplier: string;
  showAddColor: boolean;
  showAddSupplier: boolean;
  loading: boolean;
  error: string | null;
  showPhoneSelector: boolean;
  priceInputValue: string;
  isPriceFocused: boolean;
  dateInputValue: string;
  isDateFocused: boolean;

  // Actions
  setFormData: (data: Partial<ImportFormData>) => void;
  setNewColor: (color: string) => void;
  setNewSupplier: (supplier: string) => void;
  setShowAddColor: (show: boolean) => void;
  setShowAddSupplier: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShowPhoneSelector: (show: boolean) => void;
  setPriceInputValue: (value: string) => void;
  setIsPriceFocused: (focused: boolean) => void;
  setDateInputValue: (value: string) => void;
  setIsDateFocused: (focused: boolean) => void;
  handlePhoneSelect: (phoneId: string, phoneType: string) => void;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
}

export const useImportFormStore = create<ImportFormState>((set, get) => ({
  formData: initialFormData,
  newColor: "",
  newSupplier: "",
  showAddColor: false,
  showAddSupplier: false,
  loading: false,
  error: null,
  showPhoneSelector: false,
  priceInputValue: "",
  isPriceFocused: false,
  dateInputValue: "",
  isDateFocused: false,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),

  setNewColor: (color) => set({ newColor: color }),
  setNewSupplier: (supplier) => set({ newSupplier: supplier }),
  setShowAddColor: (show) => set({ showAddColor: show }),
  setShowAddSupplier: (show) => set({ showAddSupplier: show }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setShowPhoneSelector: (show) => set({ showPhoneSelector: show }),
  setPriceInputValue: (value) => set({ priceInputValue: value }),
  setIsPriceFocused: (focused) => set({ isPriceFocused: focused }),
  setDateInputValue: (value) => set({ dateInputValue: value }),
  setIsDateFocused: (focused) => set({ isDateFocused: focused }),

  handlePhoneSelect: (phoneId, phoneType) => {
    set((state) => ({
      formData: {
        ...state.formData,
        phoneId,
        phoneType
      }
    }));
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      priceInputValue: "",
      dateInputValue: "",
      showAddColor: false,
      showAddSupplier: false,
      newColor: "",
      newSupplier: ""
    });
  },

  handleSubmit: async () => {
    const state = get();
    set({ error: null, loading: true });

    if (!state.formData.color || !state.formData.color.trim()) {
      toast.error("Vui lòng chọn màu sắc!");
      set({ loading: false });
      return;
    }

    if (!state.formData.supplier || !state.formData.supplier.trim()) {
      toast.error("Vui lòng chọn nhà cung cấp!");
      set({ loading: false });
      return;
    }

    try {
      const colorName =
        state.showAddColor && state.newColor.trim()
          ? state.newColor.trim()
          : state.formData.color?.trim() || "";

      const supplierName =
        state.showAddSupplier && state.newSupplier.trim()
          ? state.newSupplier.trim()
          : state.formData.supplier?.trim() || "";

      const updatedFormData = {
        ...state.formData,
        color: colorName,
        supplier: supplierName
      };

      // Process color and supplier
      await useConfigStore
        .getState()
        .processColorAndSupplier(colorName, supplierName);

      // Reset add new states
      if (state.showAddColor && state.newColor.trim()) {
        set({ newColor: "", showAddColor: false });
      }
      if (state.showAddSupplier && state.newSupplier.trim()) {
        set({ newSupplier: "", showAddSupplier: false });
      }

      // Get employee info
      const employee = useAuthStore.getState().employee;
      const employeeId = employee?.id || "";
      const employeeName = employee?.name || "";
      const warehouseId = employee?.warehouseId || undefined;

      // Save import record
      await addImportRecord({
        ...updatedFormData,
        employeeId,
        employeeName,
        ...(warehouseId && { warehouseId })
      });

      // Update phone inventory
      const phones = usePhoneStore.getState().phones;
      if (
        updatedFormData.phoneId &&
        updatedFormData.color &&
        updatedFormData.quantity > 0
      ) {
        const selectedPhone = phones.find(
          (p) => p.id === updatedFormData.phoneId
        );
        if (selectedPhone) {
          const updatedData = [...selectedPhone.data];
          const colorIndex = updatedData.findIndex(
            (item) => item.color === updatedFormData.color
          );

          if (colorIndex >= 0) {
            updatedData[colorIndex] = {
              ...updatedData[colorIndex],
              quantity:
                updatedData[colorIndex].quantity + updatedFormData.quantity
            };
          } else {
            updatedData.push({
              color: updatedFormData.color,
              quantity: updatedFormData.quantity,
              price: 0
            });
          }

          const newTotalQuantity =
            selectedPhone.totalQuantity + updatedFormData.quantity;

          await updatePhoneService(
            updatedFormData.phoneId,
            {
              data: updatedData,
              totalQuantity: newTotalQuantity
            },
            employeeId,
            employeeName
          );

          // Refresh phones
          await usePhoneStore.getState().fetchPhones();
        }
      }

      // Reset form
      get().resetForm();
      toast.success("Phiếu nhập hàng đã được tạo thành công!");
    } catch (err) {
      console.error("Error adding import record:", err);
      set({ error: "Không thể thêm phiếu nhập hàng. Vui lòng thử lại." });
    } finally {
      set({ loading: false });
    }
  }
}));
