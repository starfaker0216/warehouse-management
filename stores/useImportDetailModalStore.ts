import { create } from "zustand";
import {
  ImportRecord,
  getImportRecordById,
  updateImportRecord
} from "../lib/importService";
import { formatDate } from "../utils/dateUtils";
import { getSuppliers } from "../lib/configService";
import toast from "react-hot-toast";
import { PhoneDetailWithStatus } from "../components/history/types";
import { loadPhoneDetailsWithStatus } from "../components/history/phoneDetailLoader";
import { updatePhoneDetailWarehouseIdByImportId } from "../lib/phoneDetailService";
import { updatePhoneRecycleWarehouseIdByImportId } from "../lib/phoneRecycleService";
import { usePhoneStore } from "./usePhoneStore";

interface EditFormData {
  importDate: Date;
  supplier: string;
  note: string;
  warehouseId?: string;
}

interface ImportDetailModalState {
  importRecord: ImportRecord | null;
  phoneDetails: PhoneDetailWithStatus[];
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  editFormData: EditFormData | null;
  dateInputValue: string;
  isDateFocused: boolean;
  suppliers: string[];
  newSupplier: string;
  showAddSupplier: boolean;
  saving: boolean;

  // Actions
  loadImportRecord: (importRecordId: string) => Promise<void>;
  initializeEditForm: (record: ImportRecord) => void;
  resetState: () => void;
  setEditFormData: (data: Partial<EditFormData>) => void;
  setDateInputValue: (value: string) => void;
  setIsDateFocused: (focused: boolean) => void;
  setNewSupplier: (supplier: string) => void;
  setShowAddSupplier: (show: boolean) => void;
  handleEdit: () => void;
  handleCancel: () => void;
  handleSave: (importRecordId: string) => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useImportDetailModalStore = create<ImportDetailModalState>(
  (set, get) => ({
    importRecord: null,
    phoneDetails: [],
    loading: false,
    error: null,
    isEditing: false,
    editFormData: null,
    dateInputValue: "",
    isDateFocused: false,
    suppliers: [],
    newSupplier: "",
    showAddSupplier: false,
    saving: false,

    loadImportRecord: async (importRecordId: string) => {
      set({ loading: true, error: null });

      try {
        const record = await getImportRecordById(importRecordId);
        if (!record) {
          set({
            error: "Không tìm thấy phiếu nhập hàng",
            loading: false
          });
          return;
        }

        set({ importRecord: record });
        get().initializeEditForm(record);

        if (record.phoneDetailIds && record.phoneDetailIds.length > 0) {
          const details = await loadPhoneDetailsWithStatus(
            record.phoneDetailIds,
            record.id
          );
          set({ phoneDetails: details });
        } else {
          set({ phoneDetails: [] });
        }

        const suppliersData = await getSuppliers();
        set({ suppliers: suppliersData, loading: false });
      } catch (err) {
        console.error("Error loading import record:", err);
        set({
          error: "Không thể tải thông tin phiếu nhập hàng",
          loading: false
        });
      }
    },

    initializeEditForm: (record: ImportRecord) => {
      set({
        editFormData: {
          importDate: record.importDate,
          supplier: record.supplier,
          note: record.note,
          warehouseId: record.warehouseId
        },
        dateInputValue: formatDate(record.importDate)
      });
    },

    resetState: () => {
      set({
        importRecord: null,
        phoneDetails: [],
        error: null,
        isEditing: false,
        editFormData: null,
        dateInputValue: "",
        newSupplier: "",
        showAddSupplier: false
      });
    },

    setEditFormData: (data) => {
      const current = get().editFormData;
      if (current) {
        set({ editFormData: { ...current, ...data } });
      }
    },

    setDateInputValue: (value) => set({ dateInputValue: value }),

    setIsDateFocused: (focused) => set({ isDateFocused: focused }),

    setNewSupplier: (supplier) => set({ newSupplier: supplier }),

    setShowAddSupplier: (show) => set({ showAddSupplier: show }),

    handleEdit: () => {
      const { importRecord } = get();
      if (importRecord) {
        set({ isEditing: true });
        get().initializeEditForm(importRecord);
      }
    },

    handleCancel: () => {
      set({ isEditing: false, newSupplier: "", showAddSupplier: false });
      const { importRecord } = get();
      if (importRecord) {
        get().initializeEditForm(importRecord);
      }
    },

    handleSave: async (importRecordId: string) => {
      const { editFormData, importRecord } = get();
      if (!editFormData || !importRecord) return false;

      set({ saving: true, error: null });

      try {
        // Check if warehouseId has changed
        const warehouseIdChanged =
          editFormData.warehouseId !== importRecord.warehouseId;

        // Update import record
        await updateImportRecord(importRecordId, {
          importDate: editFormData.importDate,
          supplier: editFormData.supplier,
          note: editFormData.note,
          warehouseId: editFormData.warehouseId
        });

        // If warehouseId changed, update all related phone records
        if (
          warehouseIdChanged &&
          editFormData.warehouseId &&
          importRecord.warehouseId
        ) {
          // Update phoneDetails, phoneExporteds, and phoneRecycles in parallel
          await Promise.all([
            updatePhoneDetailWarehouseIdByImportId(
              importRecordId,
              editFormData.warehouseId
            ),
            updatePhoneRecycleWarehouseIdByImportId(
              importRecordId,
              editFormData.warehouseId
            )
          ]);
        }

        // Reload phone list data on home page if warehouseId changed
        if (warehouseIdChanged) {
          const phoneStore = usePhoneStore.getState();
          const currentState = phoneStore;
          // Reload with current search term and warehouse filter
          await currentState.fetchListPhoneDetails(
            currentState.currentSearchTerm,
            currentState.currentWarehouseId
          );
        }

        set({ isEditing: false });
        toast.success("Đã cập nhật phiếu nhập hàng thành công!");
        return true;
      } catch (err) {
        console.error("Error updating import record:", err);
        set({ error: "Không thể cập nhật phiếu nhập hàng" });
        toast.error("Không thể cập nhật phiếu nhập hàng");
        return false;
      } finally {
        set({ saving: false });
      }
    },

    setError: (error) => set({ error })
  })
);
