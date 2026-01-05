"use client";

import { useEffect } from "react";
import { ImportRecord } from "../../lib/importService";
import Loading from "../common/Loading";
import { useImportDetailModalStore } from "../../stores/useImportDetailModalStore";
import { useWarehouseStore } from "../../stores/useWarehouseStore";
import { PhoneDetailWithStatus } from "./types";
import PhoneDetailsTable from "./PhoneDetailsTable";
import PhoneDetailsCard from "./PhoneDetailsCard";
import PhoneDetailsSummary from "./PhoneDetailsSummary";
import ImportRecordForm from "./ImportRecordForm";

interface ImportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  importRecordId: string | null;
  warehouseName?: string;
}

export default function ImportDetailModal({
  isOpen,
  onClose,
  importRecordId,
  warehouseName
}: ImportDetailModalProps) {
  const {
    importRecord,
    phoneDetails,
    loading,
    error,
    isEditing,
    editFormData,
    dateInputValue,
    isDateFocused,
    suppliers,
    newSupplier,
    showAddSupplier,
    saving,
    loadImportRecord,
    resetState,
    setEditFormData,
    setDateInputValue,
    setIsDateFocused,
    setNewSupplier,
    setShowAddSupplier,
    handleEdit,
    handleCancel,
    handleSave
  } = useImportDetailModalStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();

  useEffect(() => {
    if (isOpen && importRecordId) {
      loadImportRecord(importRecordId);
    } else {
      resetState();
    }
  }, [isOpen, importRecordId, loadImportRecord, resetState]);

  // Load warehouses when modal opens
  useEffect(() => {
    if (isOpen && warehouses.length === 0) {
      fetchWarehouses();
    }
  }, [isOpen, warehouses.length, fetchWarehouses]);

  const handleNoteChange = (note: string) => {
    setEditFormData({ note });
  };

  const handleDateChange = (date: Date) => {
    setEditFormData({ importDate: date });
  };

  const handleSupplierChange = (supplier: string) => {
    setEditFormData({ supplier });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    setEditFormData({ warehouseId });
  };

  const handleSaveClick = async () => {
    if (importRecordId) {
      const success = await handleSave(importRecordId);
      // Close modal after successful save
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900">
        <ModalHeader onClose={onClose} />
        <ModalContent
          loading={loading}
          error={error}
          importRecord={importRecord}
          editFormData={editFormData}
          dateInputValue={dateInputValue}
          isDateFocused={isDateFocused}
          suppliers={suppliers}
          newSupplier={newSupplier}
          showAddSupplier={showAddSupplier}
          warehouses={warehouses}
          warehouseName={warehouseName}
          isEditing={isEditing}
          phoneDetails={phoneDetails}
          onDateChange={handleDateChange}
          onDateInputValueChange={setDateInputValue}
          onDateFocus={setIsDateFocused}
          onSupplierChange={handleSupplierChange}
          onNewSupplierChange={setNewSupplier}
          onShowAddSupplier={setShowAddSupplier}
          onWarehouseChange={handleWarehouseChange}
          onNoteChange={handleNoteChange}
        />
        <ModalFooter
          isEditing={isEditing}
          saving={saving}
          onEdit={handleEdit}
          onCancel={handleCancel}
          onSave={handleSaveClick}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        Chi Tiết Phiếu Nhập Hàng
      </h2>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

interface ModalContentProps {
  loading: boolean;
  error: string | null;
  importRecord: ImportRecord | null;
  editFormData: {
    importDate: Date;
    supplier: string;
    note: string;
    warehouseId?: string;
  } | null;
  dateInputValue: string;
  isDateFocused: boolean;
  suppliers: string[];
  newSupplier: string;
  showAddSupplier: boolean;
  warehouses: Array<{ id: string; name: string }>;
  warehouseName?: string;
  isEditing: boolean;
  phoneDetails: PhoneDetailWithStatus[];
  onDateChange: (date: Date) => void;
  onDateInputValueChange: (value: string) => void;
  onDateFocus: (focused: boolean) => void;
  onSupplierChange: (supplier: string) => void;
  onNewSupplierChange: (value: string) => void;
  onShowAddSupplier: (show: boolean) => void;
  onWarehouseChange: (warehouseId: string) => void;
  onNoteChange: (note: string) => void;
}

function ModalContent({
  loading,
  error,
  importRecord,
  editFormData,
  dateInputValue,
  isDateFocused,
  suppliers,
  newSupplier,
  showAddSupplier,
  warehouses,
  warehouseName,
  isEditing,
  phoneDetails,
  onDateChange,
  onDateInputValueChange,
  onDateFocus,
  onSupplierChange,
  onNewSupplierChange,
  onShowAddSupplier,
  onWarehouseChange,
  onNoteChange
}: ModalContentProps) {
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!importRecord || !editFormData) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <ImportRecordForm
          importRecord={importRecord}
          editFormData={editFormData}
          dateInputValue={dateInputValue}
          isDateFocused={isDateFocused}
          suppliers={suppliers}
          newSupplier={newSupplier}
          showAddSupplier={showAddSupplier}
          warehouses={warehouses}
          warehouseName={warehouseName}
          isEditing={isEditing}
          onDateChange={onDateChange}
          onDateInputValueChange={onDateInputValueChange}
          onDateFocus={onDateFocus}
          onSupplierChange={onSupplierChange}
          onNewSupplierChange={onNewSupplierChange}
          onShowAddSupplier={onShowAddSupplier}
          onWarehouseChange={onWarehouseChange}
          onNoteChange={onNoteChange}
        />

        {phoneDetails.length > 0 && (
          <>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Danh Sách Thiết Bị
              </h3>
              <PhoneDetailsTable phoneDetails={phoneDetails} />
              <PhoneDetailsCard phoneDetails={phoneDetails} />
            </div>
            <PhoneDetailsSummary phoneDetails={phoneDetails} />
          </>
        )}
      </div>
    </div>
  );
}

interface ModalFooterProps {
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onClose: () => void;
}

function ModalFooter({
  isEditing,
  saving,
  onEdit,
  onCancel,
  onSave,
  onClose
}: ModalFooterProps) {
  return (
    <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            >
              Đóng
            </button>
          </>
        )}
      </div>
    </div>
  );
}
