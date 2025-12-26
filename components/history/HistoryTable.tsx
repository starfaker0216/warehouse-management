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
}

export default function HistoryTable({ items, warehouses }: HistoryTableProps) {
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
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-zinc-900">
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

      {/* Import Detail Modal */}
      <ImportDetailModal
        isOpen={selectedImportId !== null}
        onClose={handleCloseImportModal}
        importRecordId={selectedImportId}
        warehouseName={selectedWarehouseName}
      />

      {/* Export Detail Modal */}
      <ExportDetailModal
        isOpen={selectedExportId !== null}
        onClose={handleCloseExportModal}
        exportRecordId={selectedExportId}
        warehouseName={selectedWarehouseName}
      />
    </>
  );
}
