"use client";

import { useState } from "react";
import { HistoryItem } from "../../stores/useHistoryStore";
import { formatDate } from "../../utils/dateUtils";
import { formatCurrency } from "../../utils/currencyUtils";
import ImportDetailModal from "./ImportDetailModal";
import ExportDetailModal from "./ExportDetailModal";

interface HistoryTableProps {
  items: HistoryItem[];
  warehouses: Array<{ id: string; name: string }>;
  onSaveSuccess?: () => void;
}

export default function HistoryTable({
  items,
  warehouses,
  onSaveSuccess
}: HistoryTableProps) {
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [selectedExportId, setSelectedExportId] = useState<string | null>(null);
  const [selectedWarehouseName, setSelectedWarehouseName] = useState<
    string | undefined
  >(undefined);

  const getWarehouseName = (warehouseId?: string): string => {
    if (!warehouseId) return "N/A";
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse?.name || warehouseId;
  };

  const handleRowClick = (item: HistoryItem) => {
    const warehouseName = item.warehouseId
      ? warehouses.find((w) => w.id === item.warehouseId)?.name
      : undefined;

    if (item.type === "import") {
      setSelectedImportId(item.id);
      setSelectedWarehouseName(warehouseName);
    } else if (item.type === "export") {
      setSelectedExportId(item.id);
      setSelectedWarehouseName(warehouseName);
    }
  };

  const handleCloseImportModal = () => {
    setSelectedImportId(null);
    setSelectedWarehouseName(undefined);
  };

  const handleCloseExportModal = () => {
    setSelectedExportId(null);
    setSelectedWarehouseName(undefined);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">
          Không có dữ liệu lịch sử
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-zinc-900 md:block">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Ngày
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Kho
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Thông tin
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Nhân viên
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {items.map((item) => (
              <tr
                key={item.id}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.type === "import"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {item.type === "import" ? "Nhập" : "Xuất"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                  {formatDate(item.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                  {getWarehouseName(item.warehouseId)}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                  {item.type === "import" ? (
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Loại máy:</span>{" "}
                        {item.phoneType || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Số lượng:</span>{" "}
                        {item.quantity || 0}
                      </div>
                      {item.supplier && (
                        <div>
                          <span className="font-medium">Nhà cung cấp:</span>{" "}
                          {item.supplier}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Khách hàng:</span>{" "}
                        {item.customerName || "N/A"}
                      </div>
                      {item.customerPhone && (
                        <div>
                          <span className="font-medium">SĐT:</span>{" "}
                          {item.customerPhone}
                        </div>
                      )}
                      {item.phoneName && (
                        <div>
                          <span className="font-medium">Máy:</span>{" "}
                          {item.phoneName}
                        </div>
                      )}
                      {item.salePrice !== undefined && (
                        <div>
                          <span className="font-medium">Giá bán:</span>{" "}
                          {formatCurrency(item.salePrice)}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50">
                  {item.employeeName || "N/A"}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.note || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleRowClick(item)}
            className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
          >
            <div className="p-4">
              {/* Header: Type and Date */}
              <div className="mb-3 flex items-start justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.type === "import"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {item.type === "import" ? "Nhập" : "Xuất"}
                  </span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {formatDate(item.date)}
                  </span>
                </div>
              </div>

              {/* Warehouse and Employee */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Kho:
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">
                    {getWarehouseName(item.warehouseId)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Nhân viên:
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">
                    {item.employeeName || "N/A"}
                  </span>
                </div>
              </div>

              {/* Information */}
              <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                {item.type === "import" ? (
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Loại máy:
                      </span>{" "}
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {item.phoneType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Số lượng:
                      </span>{" "}
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {item.quantity || 0}
                      </span>
                    </div>
                    {item.supplier && (
                      <div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Nhà cung cấp:
                        </span>{" "}
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.supplier}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Khách hàng:
                      </span>{" "}
                      <span className="text-sm text-zinc-900 dark:text-zinc-50">
                        {item.customerName || "N/A"}
                      </span>
                    </div>
                    {item.customerPhone && (
                      <div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          SĐT:
                        </span>{" "}
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.customerPhone}
                        </span>
                      </div>
                    )}
                    {item.phoneName && (
                      <div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Máy:
                        </span>{" "}
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {item.phoneName}
                        </span>
                      </div>
                    )}
                    {item.salePrice !== undefined && (
                      <div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                          Giá bán:
                        </span>{" "}
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatCurrency(item.salePrice)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Note */}
              {item.note && (
                <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Ghi chú:
                  </div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {item.note}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Import Detail Modal */}
      <ImportDetailModal
        isOpen={selectedImportId !== null}
        onClose={handleCloseImportModal}
        importRecordId={selectedImportId}
        warehouseName={selectedWarehouseName}
        onSaveSuccess={onSaveSuccess}
      />

      {/* Export Detail Modal */}
      <ExportDetailModal
        isOpen={selectedExportId !== null}
        onClose={handleCloseExportModal}
        exportRecordId={selectedExportId}
        warehouseName={selectedWarehouseName}
        onSaveSuccess={onSaveSuccess}
      />
    </>
  );
}
