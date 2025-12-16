import { create } from "zustand";
import {
  addIncomeExpenseRecord,
  IncomeExpenseType
} from "../lib/incomeExpenseService";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export interface IncomeExpenseFormData {
  type: IncomeExpenseType;
  category: string;
  amount: number;
  note: string;
}

const initialFormData: IncomeExpenseFormData = {
  type: "income",
  category: "",
  amount: 0,
  note: ""
};

interface IncomeExpenseFormState {
  formData: IncomeExpenseFormData;
  priceInputValue: string;
  loading: boolean;
  error: string | null;

  // Actions
  setFormData: (data: Partial<IncomeExpenseFormData>) => void;
  setPriceInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
}

export const useIncomeExpenseFormStore = create<IncomeExpenseFormState>(
  (set, get) => ({
    formData: initialFormData,
    priceInputValue: "",
    loading: false,
    error: null,

    setFormData: (data) =>
      set((state) => ({
        formData: { ...state.formData, ...data }
      })),

    setPriceInputValue: (value) => set({ priceInputValue: value }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    resetForm: () => {
      set({
        formData: initialFormData,
        priceInputValue: "",
        error: null
      });
    },

    handleSubmit: async () => {
      const state = get();
      set({ error: null, loading: true });

      // Validation
      if (!state.formData.category || !state.formData.category.trim()) {
        toast.error("Vui lòng nhập loại Thu/Chi!");
        set({ loading: false });
        return;
      }

      if (!state.formData.amount || state.formData.amount <= 0) {
        toast.error("Vui lòng nhập số tiền lớn hơn 0!");
        set({ loading: false });
        return;
      }

      try {
        // Get employee info
        const employee = useAuthStore.getState().employee;
        const employeeId = employee?.id || "";
        const employeeName = employee?.name || "";
        const warehouseId = employee?.warehouseId || undefined;

        // Save record
        await addIncomeExpenseRecord({
          type: state.formData.type,
          category: state.formData.category.trim(),
          amount: state.formData.amount,
          note: state.formData.note.trim(),
          employeeId,
          employeeName,
          ...(warehouseId && { warehouseId })
        });

        // Reset form
        get().resetForm();
        toast.success(
          state.formData.type === "income"
            ? "Bản ghi thu đã được tạo thành công!"
            : "Bản ghi chi đã được tạo thành công!"
        );
      } catch (err) {
        console.error("Error adding income/expense record:", err);
        set({
          error: "Không thể thêm bản ghi. Vui lòng thử lại."
        });
      } finally {
        set({ loading: false });
      }
    }
  })
);
