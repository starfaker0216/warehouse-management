import { ImportRecord } from "../../lib/importService";
import { Warehouse } from "../../lib/warehouseService";
import { formatDate } from "../../utils/dateUtils";
import DateInputField from "../import/DateInputField";
import SupplierSelectorField from "../import/SupplierSelectorField";
import WarehouseSelectorField from "../import/WarehouseSelectorField";

interface ImportRecordFormProps {
  importRecord: ImportRecord;
  editFormData: {
    importDate: Date;
    supplier: string;
    note: string;
    warehouseId?: string;
  };
  dateInputValue: string;
  isDateFocused: boolean;
  suppliers: string[];
  newSupplier: string;
  showAddSupplier: boolean;
  warehouses: Warehouse[];
  warehouseName?: string;
  isEditing: boolean;
  onDateChange: (date: Date) => void;
  onDateInputValueChange: (value: string) => void;
  onDateFocus: (focused: boolean) => void;
  onSupplierChange: (supplier: string) => void;
  onNewSupplierChange: (value: string) => void;
  onShowAddSupplier: (show: boolean) => void;
  onWarehouseChange: (warehouseId: string) => void;
  onNoteChange: (note: string) => void;
}

export default function ImportRecordForm({
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
  onDateChange,
  onDateInputValueChange,
  onDateFocus,
  onSupplierChange,
  onNewSupplierChange,
  onShowAddSupplier,
  onWarehouseChange,
  onNoteChange
}: ImportRecordFormProps) {
  if (isEditing) {
    return (
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DateInputField
            importDate={editFormData.importDate}
            dateInputValue={dateInputValue}
            isDateFocused={isDateFocused}
            onDateChange={onDateChange}
            onDateInputValueChange={onDateInputValueChange}
            onDateFocus={onDateFocus}
          />

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Loại máy
            </label>
            <input
              type="text"
              value={importRecord.phoneType || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Số lượng
            </label>
            <input
              type="text"
              value={importRecord.quantity || 0}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <SupplierSelectorField
            suppliers={suppliers}
            selectedSupplier={editFormData.supplier}
            newSupplier={newSupplier}
            showAddSupplier={showAddSupplier}
            onSupplierChange={onSupplierChange}
            onNewSupplierChange={onNewSupplierChange}
            onShowAddSupplier={onShowAddSupplier}
          />

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nhân viên
            </label>
            <input
              type="text"
              value={importRecord.employeeName || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <WarehouseSelectorField
            warehouses={warehouses}
            selectedWarehouseId={editFormData.warehouseId || ""}
            onWarehouseChange={onWarehouseChange}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ghi chú
          </label>
          <textarea
            value={editFormData.note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={3}
            placeholder="Nhập ghi chú (tùy chọn)"
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
          />
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ngày nhập
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {formatDate(importRecord.importDate)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Loại máy
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {importRecord.phoneType || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Số lượng
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {importRecord.quantity || 0}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nhà cung cấp
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {importRecord.supplier || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nhân viên
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {importRecord.employeeName || "N/A"}
          </p>
        </div>
        {warehouseName && (
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Kho
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {warehouseName}
            </p>
          </div>
        )}
      </div>

      {importRecord.note && (
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ghi chú
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {importRecord.note}
          </p>
        </div>
      )}
    </>
  );
}
