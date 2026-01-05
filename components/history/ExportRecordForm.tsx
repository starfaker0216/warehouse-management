import { ExportRecord } from "../../lib/exportService";
import { formatDate } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/currencyUtils";
import PriceInput from "../common/PriceInput";
import WarehouseSelectorField from "../import/WarehouseSelectorField";
import { Warehouse } from "../../lib/warehouseService";

interface ExportRecordFormProps {
  exportRecord: ExportRecord;
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
  };
  salePriceInputValue: string;
  installmentInputValue: string;
  bankTransferInputValue: string;
  cashPaymentInputValue: string;
  warehouseName?: string;
  warehouses?: Warehouse[];
  selectedWarehouseId?: string;
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
  onWarehouseChange?: (warehouseId: string) => void;
}

export default function ExportRecordForm({
  exportRecord,
  editFormData,
  salePriceInputValue,
  installmentInputValue,
  bankTransferInputValue,
  cashPaymentInputValue,
  warehouseName,
  warehouses,
  selectedWarehouseId,
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
  onOtherPaymentChange,
  onWarehouseChange
}: ExportRecordFormProps) {
  if (isEditing) {
    return (
      <form className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Số điện thoại khách hàng
            </label>
            <input
              type="text"
              value={editFormData.customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tên khách hàng
            </label>
            <input
              type="text"
              value={editFormData.customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tên máy
            </label>
            <input
              type="text"
              value={exportRecord.phoneName || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Màu sắc
            </label>
            <input
              type="text"
              value={exportRecord.color || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              IMEI
            </label>
            <input
              type="text"
              value={exportRecord.imei || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Giá bán
            </label>
            <PriceInput
              value={editFormData.salePrice}
              inputValue={salePriceInputValue}
              onValueChange={onSalePriceChange}
              onInputValueChange={onSalePriceInputValueChange}
              placeholder="0"
              id="salePrice"
              className="mt-1 px-4 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tặng kèm
            </label>
            <input
              type="text"
              value={editFormData.gift}
              onChange={(e) => onGiftChange(e.target.value)}
              placeholder="Nhập tặng kèm (tùy chọn)"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nhân viên
            </label>
            <input
              type="text"
              value={exportRecord.employeeName || "N/A"}
              disabled
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-not-allowed"
            />
          </div>

          {warehouses && warehouses.length > 0 && onWarehouseChange ? (
            <WarehouseSelectorField
              warehouses={warehouses}
              selectedWarehouseId={selectedWarehouseId || ""}
              onWarehouseChange={onWarehouseChange}
            />
          ) : null}
        </div>

        <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Phương thức thanh toán
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Trả góp
              </label>
              <PriceInput
                value={editFormData.installmentPayment}
                inputValue={installmentInputValue}
                onValueChange={onInstallmentPaymentChange}
                onInputValueChange={onInstallmentInputValueChange}
                placeholder="0"
                id="installmentPayment"
                className="px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Chuyển khoản
              </label>
              <PriceInput
                value={editFormData.bankTransfer}
                inputValue={bankTransferInputValue}
                onValueChange={onBankTransferChange}
                onInputValueChange={onBankTransferInputValueChange}
                placeholder="0"
                id="bankTransfer"
                className="px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Tiền mặt
              </label>
              <PriceInput
                value={editFormData.cashPayment}
                inputValue={cashPaymentInputValue}
                onValueChange={onCashPaymentChange}
                onInputValueChange={onCashPaymentInputValueChange}
                placeholder="0"
                id="cashPayment"
                className="px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Khác
              </label>
              <input
                type="text"
                value={editFormData.otherPayment}
                onChange={(e) => onOtherPaymentChange(e.target.value)}
                placeholder="Nhập phương thức khác (tùy chọn)"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-400"
              />
            </div>
          </div>
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

  const totalPayment =
    exportRecord.installmentPayment +
    exportRecord.bankTransfer +
    exportRecord.cashPayment;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ngày xuất
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.createdAt
              ? formatDate(exportRecord.createdAt)
              : "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Số điện thoại khách hàng
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.customerPhone || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tên khách hàng
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.customerName || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tên máy
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.phoneName || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Màu sắc
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.color || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            IMEI
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.imei || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Giá bán
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {formatCurrency(exportRecord.salePrice || 0)}
          </p>
        </div>
        {exportRecord.gift && (
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tặng kèm
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {exportRecord.gift}
            </p>
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Nhân viên
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.employeeName || "N/A"}
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

      <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Phương thức thanh toán
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Trả góp
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {formatCurrency(exportRecord.installmentPayment || 0)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Chuyển khoản
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {formatCurrency(exportRecord.bankTransfer || 0)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tiền mặt
            </label>
            <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
              {formatCurrency(exportRecord.cashPayment || 0)}
            </p>
          </div>
          {exportRecord.otherPayment && (
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Khác
              </label>
              <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {exportRecord.otherPayment}
              </p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tổng thanh toán
            </label>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {formatCurrency(totalPayment)}
            </p>
          </div>
        </div>
      </div>

      {exportRecord.note && (
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Ghi chú
          </label>
          <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {exportRecord.note}
          </p>
        </div>
      )}
    </>
  );
}
