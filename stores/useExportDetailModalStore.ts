import { create } from "zustand";
import {
  ExportRecord,
  getExportRecordById,
  updateExportRecord
} from "../lib/exportService";
import { updatePhoneExportedByExportRecordId } from "../lib/phoneExportedService";
import { formatCurrencyInput } from "../utils/currencyUtils";
import toast from "react-hot-toast";

interface EditFormData {
  customerPhone: string;
  customerName: string;
  salePrice: number;
  gift: string;
  note: string;
  installmentPayment: number;
  bankTransfer: number;
  cashPayment: number;
  otherPayment: string;
}

interface ExportDetailModalState {
  exportRecord: ExportRecord | null;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editFormData: EditFormData | null;
  saving: boolean;
  salePriceInputValue: string;
  installmentInputValue: string;
  bankTransferInputValue: string;
  cashPaymentInputValue: string;

  // Actions
  loadExportRecord: (exportRecordId: string) => Promise<void>;
  initializeEditForm: (record: ExportRecord) => void;
  resetState: () => void;
  setEditFormData: (data: Partial<EditFormData>) => void;
  setSalePriceInputValue: (value: string) => void;
  setInstallmentInputValue: (value: string) => void;
  setBankTransferInputValue: (value: string) => void;
  setCashPaymentInputValue: (value: string) => void;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: (exportRecordId: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useExportDetailModalStore = create<ExportDetailModalState>(
  (set, get) => ({
    exportRecord: null,
    loading: false,
    error: null,
    isEditing: false,
    editFormData: null,
    saving: false,
    salePriceInputValue: "",
    installmentInputValue: "",
    bankTransferInputValue: "",
    cashPaymentInputValue: "",

    loadExportRecord: async (exportRecordId: string) => {
      set({ loading: true, error: null });

      try {
        const record = await getExportRecordById(exportRecordId);
        if (!record) {
          set({
            error: "Không tìm thấy phiếu xuất hàng",
            loading: false
          });
          return;
        }

        set({ exportRecord: record });
        get().initializeEditForm(record);
        set({ loading: false });
      } catch (err) {
        console.error("Error loading export record:", err);
        set({
          error: "Không thể tải thông tin phiếu xuất hàng",
          loading: false
        });
      }
    },

    initializeEditForm: (record: ExportRecord) => {
      set({
        editFormData: {
          customerPhone: record.customerPhone,
          customerName: record.customerName,
          salePrice: record.salePrice,
          gift: record.gift,
          note: record.note,
          installmentPayment: record.installmentPayment,
          bankTransfer: record.bankTransfer,
          cashPayment: record.cashPayment,
          otherPayment: record.otherPayment
        },
        salePriceInputValue: formatCurrencyInput(record.salePrice || 0),
        installmentInputValue: formatCurrencyInput(
          record.installmentPayment || 0
        ),
        bankTransferInputValue: formatCurrencyInput(record.bankTransfer || 0),
        cashPaymentInputValue: formatCurrencyInput(record.cashPayment || 0)
      });
    },

    resetState: () => {
      set({
        exportRecord: null,
        error: null,
        isEditing: false,
        editFormData: null,
        salePriceInputValue: "",
        installmentInputValue: "",
        bankTransferInputValue: "",
        cashPaymentInputValue: ""
      });
    },

    setSalePriceInputValue: (value) => set({ salePriceInputValue: value }),

    setInstallmentInputValue: (value) => set({ installmentInputValue: value }),

    setBankTransferInputValue: (value) =>
      set({ bankTransferInputValue: value }),

    setCashPaymentInputValue: (value) => set({ cashPaymentInputValue: value }),

    setEditFormData: (data) => {
      const current = get().editFormData;
      if (current) {
        set({ editFormData: { ...current, ...data } });
      }
    },

    handleEdit: () => {
      const { exportRecord } = get();
      if (exportRecord) {
        set({ isEditing: true });
        get().initializeEditForm(exportRecord);
      }
    },

    handleCancel: () => {
      set({ isEditing: false });
      const { exportRecord } = get();
      if (exportRecord) {
        get().initializeEditForm(exportRecord);
      }
    },

    handleSave: async (exportRecordId: string) => {
      const { editFormData } = get();
      if (!editFormData) return;

      set({ saving: true, error: null });

      try {
        // Update export record
        await updateExportRecord(exportRecordId, {
          customerPhone: editFormData.customerPhone,
          customerName: editFormData.customerName,
          salePrice: editFormData.salePrice,
          gift: editFormData.gift,
          note: editFormData.note,
          installmentPayment: editFormData.installmentPayment,
          bankTransfer: editFormData.bankTransfer,
          cashPayment: editFormData.cashPayment,
          otherPayment: editFormData.otherPayment
        });

        // Update corresponding phoneExported records
        await updatePhoneExportedByExportRecordId(exportRecordId, {
          customerPhone: editFormData.customerPhone,
          customerName: editFormData.customerName,
          salePrice: editFormData.salePrice
        });

        const updatedRecord = await getExportRecordById(exportRecordId);
        if (updatedRecord) {
          set({ exportRecord: updatedRecord });
        }

        set({ isEditing: false });
        toast.success("Đã cập nhật phiếu xuất hàng thành công!");
      } catch (err) {
        console.error("Error updating export record:", err);
        set({ error: "Không thể cập nhật phiếu xuất hàng" });
        toast.error("Không thể cập nhật phiếu xuất hàng");
      } finally {
        set({ saving: false });
      }
    },

    setError: (error) => set({ error })
  })
);
