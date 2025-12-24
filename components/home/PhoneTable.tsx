"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PhoneDetail } from "../../lib/phoneDetailService";
import { formatCurrency } from "../../utils/currencyUtils";
import { useAuth } from "../../contexts/AuthContext";
import { usePhoneStore } from "../../stores/usePhoneStore";
import { useWarehouseStore } from "../../stores/useWarehouseStore";
import EditPhoneDetailModal from "./EditPhoneDetailModal";
import ImportDetailModal from "../history/ImportDetailModal";

interface PhoneTableProps {
  listPhoneDetails: PhoneDetail[];
  searchTerm?: string;
}

export default function PhoneTable({
  listPhoneDetails,
  searchTerm
}: PhoneTableProps) {
  const router = useRouter();
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const { updatePhoneDetail, fetchListPhoneDetails } = usePhoneStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhoneDetail, setSelectedPhoneDetail] =
    useState<PhoneDetail | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [selectedWarehouseName, setSelectedWarehouseName] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handleEditClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoneDetail(phoneDetail);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedPhoneDetail(null);
  };

  const handleSave = async (
    id: string,
    phoneDetailData: {
      color: string;
      salePrice: number;
      status: string;
      imei: string;
      importPrice: number;
    }
  ) => {
    await updatePhoneDetail(id, phoneDetailData);
    // Refresh list with current search state
    await fetchListPhoneDetails(searchTerm);
  };

  const handleDeleted = async () => {
    await fetchListPhoneDetails(searchTerm);
  };

  const handleViewImportClick = (
    phoneDetail: PhoneDetail,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (phoneDetail.importId) {
      setSelectedImportId(phoneDetail.importId);
      const warehouse = warehouses.find(
        (w) => w.id === phoneDetail.warehouseId
      );
      setSelectedWarehouseName(warehouse?.name);
      setIsImportModalOpen(true);
    }
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setSelectedImportId(null);
    setSelectedWarehouseName(undefined);
  };

  const handleRowClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
    // Don't navigate if clicking on the edit button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Navigate to export page with phoneDetailId
    const params = new URLSearchParams({
      phoneDetailId: phoneDetail.id
    });
    router.push(`/export?${params.toString()}`);
  };

  if (listPhoneDetails.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
        <div className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Không tìm thấy sản phẩm nào
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Màu sắc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tình trạng máy
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs text-right font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Giá nhập
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs text-right font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Giá bán
              </th>
              {isAdmin && (
                <th className="w-fit py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {listPhoneDetails.map((phoneDetail) => (
              <tr
                key={phoneDetail.id}
                onClick={(e) => handleRowClick(phoneDetail, e)}
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {phoneDetail.name || "Chưa có tên"}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {phoneDetail.color || "Chưa có dữ liệu"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  {phoneDetail.status ? (
                    <div className="whitespace-pre-wrap break-words">
                      {phoneDetail.status}
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">
                      Chưa có thông tin
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-sm text-right text-zinc-900 dark:text-zinc-50">
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {!phoneDetail.importPrice || phoneDetail.importPrice === 0
                        ? "N/A"
                        : formatCurrency(phoneDetail.importPrice)}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-right text-zinc-900 dark:text-zinc-50">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    {!phoneDetail.salePrice || phoneDetail.salePrice === 0
                      ? "Liên hệ Admin"
                      : formatCurrency(phoneDetail.salePrice)}
                  </span>
                </td>
                {isAdmin && (
                  <td className="whitespace-nowrap py-4 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(phoneDetail, e)}
                        className="rounded-lg border border-zinc-300 bg-white px-1.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      {phoneDetail.importId && (
                        <button
                          type="button"
                          onClick={(e) => handleViewImportClick(phoneDetail, e)}
                          className="rounded-lg border border-zinc-300 bg-white px-1.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                        >
                          Xem Phiếu Nhập
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditPhoneDetailModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        phoneDetail={selectedPhoneDetail}
        onSave={handleSave}
        onDeleted={handleDeleted}
      />

      {/* Import Detail Modal */}
      <ImportDetailModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportModal}
        importRecordId={selectedImportId}
        warehouseName={selectedWarehouseName}
      />
    </div>
  );
}
