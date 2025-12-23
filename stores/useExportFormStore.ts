import { create } from "zustand";
import { addExportRecord } from "../lib/exportService";
import { updatePhone as updatePhoneService, Phone } from "../lib/phoneService";
import {
  getCustomerByPhone,
  addCustomer,
  updateCustomer
} from "../lib/customerService";
import { usePhoneStore } from "./usePhoneStore";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export interface ExportFormData {
  customerPhone: string;
  customerName: string;
  customerBirthday: string;
  customerAddress: string;
  customerDebt: number;
  phoneName: string;
  color: string;
  imei: string;
  salePrice: number;
  gift: string;
  note: string;
  phoneId: string;
  installmentPayment: number;
  bankTransfer: number;
  cashPayment: number;
  otherPayment: string;
}

const initialFormData: ExportFormData = {
  customerPhone: "",
  customerName: "",
  customerBirthday: "",
  customerAddress: "",
  customerDebt: 0,
  phoneName: "",
  color: "",
  imei: "",
  salePrice: 0,
  gift: "",
  note: "",
  phoneId: "",
  installmentPayment: 0,
  bankTransfer: 0,
  cashPayment: 0,
  otherPayment: ""
};

interface ExportFormState {
  formData: ExportFormData;
  priceInputValue: string;
  installmentInputValue: string;
  bankTransferInputValue: string;
  cashPaymentInputValue: string;
  loading: boolean;
  error: string | null;
  setFormData: (data: Partial<ExportFormData>) => void;
  setPriceInputValue: (value: string) => void;
  setInstallmentInputValue: (value: string) => void;
  setBankTransferInputValue: (value: string) => void;
  setCashPaymentInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  handleColorChange: (color: string, phone: Phone) => void;
  initializeFromPhone: (phone: Phone, color?: string) => void;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
}

export const useExportFormStore = create<ExportFormState>((set, get) => ({
  formData: initialFormData,
  priceInputValue: "",
  installmentInputValue: "",
  bankTransferInputValue: "",
  cashPaymentInputValue: "",
  loading: false,
  error: null,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),

  setPriceInputValue: (value) => set({ priceInputValue: value }),
  setInstallmentInputValue: (value) => set({ installmentInputValue: value }),
  setBankTransferInputValue: (value) => set({ bankTransferInputValue: value }),
  setCashPaymentInputValue: (value) => set({ cashPaymentInputValue: value }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  handleColorChange: (color: string, phone: Phone) => {
    const colorData = phone.data?.find((item) => item.color === color);
    const price = colorData?.price || 0;

    set((state) => ({
      formData: {
        ...state.formData,
        color,
        salePrice: price
      },
      priceInputValue: price > 0 ? price.toLocaleString("vi-VN") : ""
    }));
  },

  initializeFromPhone: (phone: Phone, color?: string) => {
    const selectedColor =
      color || (phone.data && phone.data.length > 0 ? phone.data[0].color : "");
    const colorData = phone.data?.find((item) => item.color === selectedColor);
    const defaultPrice = colorData?.price || 0;

    set({
      formData: {
        ...initialFormData,
        phoneId: phone.id,
        phoneName: phone.name.trim(),
        color: selectedColor,
        salePrice: defaultPrice
      },
      priceInputValue:
        defaultPrice > 0 ? defaultPrice.toLocaleString("vi-VN") : ""
    });
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      priceInputValue: "",
      installmentInputValue: "",
      bankTransferInputValue: "",
      cashPaymentInputValue: "",
      error: null
    });
  },

  handleSubmit: async () => {
    const state = get();
    const { formData } = state;

    // Validation
    if (!formData.customerPhone.trim()) {
      set({ error: "Vui lòng nhập số điện thoại khách hàng" });
      return;
    }

    if (!formData.customerName.trim()) {
      set({ error: "Vui lòng nhập tên khách hàng" });
      return;
    }

    if (!formData.imei.trim()) {
      set({ error: "Vui lòng nhập IMEI" });
      return;
    }

    if (formData.salePrice <= 0) {
      set({ error: "Vui lòng nhập giá bán hợp lệ" });
      return;
    }

    set({ loading: true, error: null });

    try {
      // Check if customer exists, if not create new customer, otherwise update
      const existingCustomer = await getCustomerByPhone(
        formData.customerPhone.trim()
      );
      if (!existingCustomer) {
        await addCustomer(
          formData.customerPhone.trim(),
          formData.customerName.trim(),
          formData.customerBirthday || undefined,
          formData.customerAddress || undefined,
          formData.customerDebt || undefined
        );
      } else {
        // Update existing customer with new information
        await updateCustomer(
          existingCustomer.id,
          formData.customerName.trim(),
          formData.customerBirthday || undefined,
          formData.customerAddress || undefined,
          formData.customerDebt || undefined
        );
      }

      // Get employee info
      const employee = useAuthStore.getState().employee;
      const employeeId = employee?.id || "";
      const employeeName = employee?.name || "";
      const warehouseId = employee?.warehouseId || undefined;

      // Add export record
      await addExportRecord({
        customerPhone: formData.customerPhone.trim(),
        customerName: formData.customerName.trim(),
        phoneName: formData.phoneName,
        color: formData.color,
        imei: formData.imei.trim(),
        salePrice: formData.salePrice,
        gift: formData.gift.trim(),
        note: formData.note.trim(),
        phoneId: formData.phoneId,
        installmentPayment: formData.installmentPayment || 0,
        bankTransfer: formData.bankTransfer || 0,
        cashPayment: formData.cashPayment || 0,
        otherPayment: formData.otherPayment.trim(),
        employeeId,
        employeeName,
        ...(warehouseId && { warehouseId })
      });

      // Update phone quantity (decrease by 1)
      if (formData.phoneId) {
        const phoneStore = usePhoneStore.getState();
        const phones = phoneStore.phones;
        const phone = phones.find((p) => p.id === formData.phoneId);

        if (phone) {
          // Find the color data and decrease quantity
          const updatedData = phone.data.map((item) => {
            if (item.color === formData.color) {
              return {
                ...item,
                quantity: Math.max(0, (item.quantity || 0) - 1)
              };
            }
            return item;
          });

          // Recalculate total quantity
          const totalQuantity = updatedData.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
          );

          await updatePhoneService(
            formData.phoneId,
            {
              data: updatedData,
              totalQuantity
            },
            employeeId,
            employeeName
          );

          // Refresh phones list
          await phoneStore.fetchPhones();
        }
      }

      toast.success("Tạo phiếu xuất hàng thành công!");
      get().resetForm();
    } catch (err) {
      console.error("Error submitting export form:", err);
      set({
        error: "Không thể tạo phiếu xuất hàng. Vui lòng thử lại.",
        loading: false
      });
      toast.error("Không thể tạo phiếu xuất hàng. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  }
}));
