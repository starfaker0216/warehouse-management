"use client";

import { useEffect } from "react";
import { ExportRecord } from "../../lib/exportService";
import Loading from "../common/Loading";
import { useExportDetailModalStore } from "../../stores/useExportDetailModalStore";
import ExportRecordForm from "./ExportRecordForm";

interface ExportDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportRecordId: string | null;
  warehouseName?: string;
}

export default function ExportDetailModal({
  isOpen,
  onClose,
  exportRecordId,
  warehouseName
}: ExportDetailModalProps) {
  const {
    exportRecord,
    loading,
    error,
    isEditing,
    editFormData,
    salePriceInputValue,
    installmentInputValue,
    bankTransferInputValue,
    cashPaymentInputValue,
    saving,
    loadExportRecord,
    resetState,
    setEditFormData,
    setSalePriceInputValue,
    setInstallmentInputValue,
    setBankTransferInputValue,
    setCashPaymentInputValue,
    handleEdit,
    handleCancel,
    handleSave
  } = useExportDetailModalStore();

  useEffect(() => {
    if (isOpen && exportRecordId) {
      loadExportRecord(exportRecordId);
    } else {
      resetState();
    }
  }, [isOpen, exportRecordId, loadExportRecord, resetState]);

  const handleSaveClick = () => {
    if (exportRecordId) {
      handleSave(exportRecordId);
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
          exportRecord={exportRecord}
          editFormData={editFormData}
          salePriceInputValue={salePriceInputValue}
          installmentInputValue={installmentInputValue}
          bankTransferInputValue={bankTransferInputValue}
          cashPaymentInputValue={cashPaymentInputValue}
          warehouseName={warehouseName}
          isEditing={isEditing}
          onCustomerPhoneChange={(value) =>
            setEditFormData({ customerPhone: value })
          }
          onCustomerNameChange={(value) =>
            setEditFormData({ customerName: value })
          }
          onSalePriceChange={(price) => setEditFormData({ salePrice: price })}
          onSalePriceInputValueChange={setSalePriceInputValue}
          onGiftChange={(value) => setEditFormData({ gift: value })}
          onNoteChange={(value) => setEditFormData({ note: value })}
          onInstallmentPaymentChange={(price) =>
            setEditFormData({ installmentPayment: price })
          }
          onInstallmentInputValueChange={setInstallmentInputValue}
          onBankTransferChange={(price) =>
            setEditFormData({ bankTransfer: price })
          }
          onBankTransferInputValueChange={setBankTransferInputValue}
          onCashPaymentChange={(price) =>
            setEditFormData({ cashPayment: price })
          }
          onCashPaymentInputValueChange={setCashPaymentInputValue}
          onOtherPaymentChange={(value) =>
            setEditFormData({ otherPayment: value })
          }
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
        Chi Tiết Phiếu Xuất Hàng
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
  exportRecord: ExportRecord | null;
  editFormData: {
    customerPhone: string;
    customerName: string;
    salePrice: number;
    gift: string;
    note: string;
    installmentPayment: number;
    bankTransfer: number;
    cashPayment: number;
    otherPayment: string;
  } | null;
  salePriceInputValue: string;
  installmentInputValue: string;
  bankTransferInputValue: string;
  cashPaymentInputValue: string;
  warehouseName?: string;
  isEditing: boolean;
  onCustomerPhoneChange: (value: string) => void;
  onCustomerNameChange: (value: string) => void;
  onSalePriceChange: (price: number) => void;
  onSalePriceInputValueChange: (value: string) => void;
  onGiftChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onInstallmentPaymentChange: (price: number) => void;
  onInstallmentInputValueChange: (value: string) => void;
  onBankTransferChange: (price: number) => void;
  onBankTransferInputValueChange: (value: string) => void;
  onCashPaymentChange: (price: number) => void;
  onCashPaymentInputValueChange: (value: string) => void;
  onOtherPaymentChange: (value: string) => void;
}

function ModalContent({
  loading,
  error,
  exportRecord,
  editFormData,
  salePriceInputValue,
  installmentInputValue,
  bankTransferInputValue,
  cashPaymentInputValue,
  warehouseName,
  isEditing,
  onCustomerPhoneChange,
  onCustomerNameChange,
  onSalePriceChange,
  onSalePriceInputValueChange,
  onGiftChange,
  onNoteChange,
  onInstallmentPaymentChange,
  onInstallmentInputValueChange,
  onBankTransferChange,
  onBankTransferInputValueChange,
  onCashPaymentChange,
  onCashPaymentInputValueChange,
  onOtherPaymentChange
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

  if (!exportRecord || !editFormData) {
    return null;
  }

  return (
    <div className="p-6">
      <ExportRecordForm
        exportRecord={exportRecord}
        editFormData={editFormData}
        salePriceInputValue={salePriceInputValue}
        installmentInputValue={installmentInputValue}
        bankTransferInputValue={bankTransferInputValue}
        cashPaymentInputValue={cashPaymentInputValue}
        warehouseName={warehouseName}
        isEditing={isEditing}
        onCustomerPhoneChange={onCustomerPhoneChange}
        onCustomerNameChange={onCustomerNameChange}
        onSalePriceChange={onSalePriceChange}
        onSalePriceInputValueChange={onSalePriceInputValueChange}
        onGiftChange={onGiftChange}
        onNoteChange={onNoteChange}
        onInstallmentPaymentChange={onInstallmentPaymentChange}
        onInstallmentInputValueChange={onInstallmentInputValueChange}
        onBankTransferChange={onBankTransferChange}
        onBankTransferInputValueChange={onBankTransferInputValueChange}
        onCashPaymentChange={onCashPaymentChange}
        onCashPaymentInputValueChange={onCashPaymentInputValueChange}
        onOtherPaymentChange={onOtherPaymentChange}
      />
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
