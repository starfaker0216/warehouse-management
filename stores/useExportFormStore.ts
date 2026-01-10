import { create } from "zustand";
import { addExportRecord } from "../lib/exportService";
import {
  getCustomerByPhone,
  addCustomer,
  updateCustomer
} from "../lib/customerService";
import { usePhoneStore } from "./usePhoneStore";
import { useAuthStore } from "./useAuthStore";
import {
  PhoneDetail,
  getPhoneDetail,
  deletePhoneDetail
} from "../lib/phoneDetailService";
import { addPhoneExported } from "../lib/phoneExportedService";
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
  phoneDetailId: string;
  phoneId: string;
  installmentPayment: number;
  bankTransfer: number;
  cashPayment: number;
  otherPayment: string;
  warehouseId?: string;
}

const getInitialFormData = (): ExportFormData => {
  return {
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
    phoneDetailId: "",
    phoneId: "",
    installmentPayment: 0,
    bankTransfer: 0,
    cashPayment: 0,
    otherPayment: "",
    warehouseId: ""
  };
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
  initializeFromPhoneDetail: (phoneDetail: PhoneDetail) => void;
  resetForm: () => void;
  handleSubmit: () => Promise<void>;
}

export const useExportFormStore = create<ExportFormState>((set, get) => ({
  formData: getInitialFormData(),
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

  initializeFromPhoneDetail: (phoneDetail: PhoneDetail) => {
    set({
      formData: {
        ...getInitialFormData(),
        phoneDetailId: phoneDetail.id,
        phoneId: phoneDetail.phoneId,
        phoneName: phoneDetail.name || "",
        color: phoneDetail.color || "",
        imei: phoneDetail.imei || "",
        salePrice: phoneDetail.salePrice || 0,
        warehouseId: phoneDetail.warehouseId || ""
      },
      priceInputValue:
        phoneDetail.salePrice && phoneDetail.salePrice > 0
          ? phoneDetail.salePrice.toLocaleString("vi-VN")
          : ""
    });
  },

  resetForm: () => {
    set({
      formData: getInitialFormData(),
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

      // Use warehouseId from formData (for admin) or employee's warehouseId (for non-admin)
      const warehouseId =
        formData.warehouseId || employee?.warehouseId || undefined;

      if (!warehouseId) {
        set({
          error: "Vui lòng chọn kho",
          loading: false
        });
        toast.error("Vui lòng chọn kho");
        return;
      }

      // Add export record
      const exportRecordId = await addExportRecord({
        customerPhone: formData.customerPhone.trim(),
        customerName: formData.customerName.trim(),
        phoneName: formData.phoneName,
        color: formData.color,
        imei: formData.imei.trim(),
        salePrice: formData.salePrice,
        gift: formData.gift.trim(),
        note: formData.note.trim(),
        phoneId: formData.phoneId,
        phoneDetailId: formData.phoneDetailId,
        installmentPayment: formData.installmentPayment || 0,
        bankTransfer: formData.bankTransfer || 0,
        cashPayment: formData.cashPayment || 0,
        otherPayment: formData.otherPayment.trim(),
        employeeId,
        employeeName,
        warehouseId
      });

      // Save phone detail to phoneExporteds before deletion
      if (formData.phoneDetailId) {
        // Fetch full phone detail data
        const phoneDetail = await getPhoneDetail(formData.phoneDetailId);
        if (phoneDetail) {
          // Save to phoneExporteds collection (importId and importDate will be copied from phoneDetail)
          // Use warehouseId from formData (user selected) instead of phoneDetail's warehouseId
          // Use salePrice from formData (user entered) instead of phoneDetail's salePrice
          await addPhoneExported(
            phoneDetail,
            exportRecordId,
            formData.customerPhone.trim(),
            formData.customerName.trim(),
            warehouseId,
            formData.salePrice
          );

          // Delete phone detail after saving to phoneExporteds
          await deletePhoneDetail(formData.phoneDetailId);

          // Refresh phone details list
          const phoneStore = usePhoneStore.getState();
          await phoneStore.fetchListPhoneDetails();
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
