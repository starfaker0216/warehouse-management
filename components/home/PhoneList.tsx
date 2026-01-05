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
import ExportDetailModal from "../history/ExportDetailModal";
import Pagination from "../history/Pagination";
import { getStatusText, getStatusColor } from "../history/phoneStatusUtils";
import { PhoneStatus } from "../history/types";

interface PhoneListProps {
  listPhoneDetails: PhoneDetail[];
  searchTerm?: string;
}

export default function PhoneList({
  listPhoneDetails,
  searchTerm
}: PhoneListProps) {
  const router = useRouter();
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const {
    updatePhoneDetail,
    fetchListPhoneDetails,
    currentPage,
    itemsPerPage,
    totalCount,
    loading,
    setCurrentPage
  } = usePhoneStore();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhoneDetail, setSelectedPhoneDetail] =
    useState<PhoneDetail | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [selectedWarehouseName, setSelectedWarehouseName] = useState<
    string | undefined
  >(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportRecordId, setSelectedExportRecordId] = useState<
    string | null
  >(null);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, setCurrentPage]);

  // Calculate pagination from totalCount (server-side pagination)
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  // listPhoneDetails is already paginated from server, use it directly
  const paginatedListPhoneDetails = listPhoneDetails;

  // Helper: Get phone status from phoneDetail
  const getPhoneStatus = (phoneDetail: PhoneDetail): PhoneStatus => {
    if (phoneDetail.isExported) {
      return "exported";
    }
    return "in_warehouse";
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Fetch data for new page
    fetchListPhoneDetails(searchTerm);
  };

  const handleEditClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
    e.stopPropagation();

    // If phone is exported, open ExportDetailModal
    if (phoneDetail.isExported && phoneDetail.exportRecordId) {
      setSelectedExportRecordId(phoneDetail.exportRecordId);
      const warehouse = warehouses.find(
        (w) => w.id === phoneDetail.warehouseId
      );
      setSelectedWarehouseName(warehouse?.name);
      setIsExportModalOpen(true);
      return;
    }

    // Otherwise, open EditPhoneDetailModal
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

  const handleCloseExportModal = () => {
    setIsExportModalOpen(false);
    setSelectedExportRecordId(null);
    setSelectedWarehouseName(undefined);
  };

  const handleItemClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Don't allow export for already exported items
    if (phoneDetail.isExported) {
      return;
    }

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

  const renderDesktopView = () => {
    if (loading) return null;
    return (
      <div className="hidden md:block">
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
                {paginatedListPhoneDetails.map((phoneDetail) => (
                  <tr
                    key={phoneDetail.id}
                    onClick={(e) => handleItemClick(phoneDetail, e)}
                    className={`${
                      phoneDetail.isExported
                        ? "cursor-not-allowed"
                        : "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {phoneDetail.name || "Chưa có tên"}
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                            getPhoneStatus(phoneDetail)
                          )}`}
                        >
                          {getStatusText(getPhoneStatus(phoneDetail))}
                        </span>
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
                          {!phoneDetail.importPrice ||
                          phoneDetail.importPrice === 0
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
                            className="w-full max-w-32 rounded-lg border border-zinc-300 bg-white px-1.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                          >
                            Chỉnh sửa
                          </button>
                          {phoneDetail.importId && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleViewImportClick(phoneDetail, e)
                              }
                              className="w-full max-w-32 rounded-lg border border-zinc-300 bg-white px-1.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
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
        </div>
      </div>
    );
  };

  const renderMobileView = () => {
    if (loading) return null;
    return (
      <div className="md:hidden space-y-4">
        {paginatedListPhoneDetails.map((phoneDetail) => (
          <div
            key={phoneDetail.id}
            onClick={(e) => handleItemClick(phoneDetail, e)}
            className={`overflow-hidden rounded-lg bg-white shadow-sm transition-shadow dark:bg-zinc-900 ${
              phoneDetail.isExported
                ? "cursor-not-allowed"
                : "cursor-pointer hover:shadow-md"
            }`}
          >
            <div className="p-4">
              {/* Header: Name */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                      {phoneDetail.name}
                    </h3>
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(
                        getPhoneStatus(phoneDetail)
                      )}`}
                    >
                      {getStatusText(getPhoneStatus(phoneDetail))}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="ml-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(phoneDetail, e)}
                      className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                    {phoneDetail.importId && (
                      <button
                        type="button"
                        onClick={(e) => handleViewImportClick(phoneDetail, e)}
                        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        Xem Phiếu Nhập
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Color and Price */}
              <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {phoneDetail.color || "Chưa có dữ liệu"}
                    </div>
                  </div>
                  <div className="ml-3 text-right">
                    {isAdmin &&
                      phoneDetail.importPrice &&
                      phoneDetail.importPrice > 0 && (
                        <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                          Nhập: {formatCurrency(phoneDetail.importPrice)}
                        </div>
                      )}
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                      {!phoneDetail.salePrice || phoneDetail.salePrice === 0
                        ? "Giá: Liên hệ Admin"
                        : `Bán: ${formatCurrency(phoneDetail.salePrice)}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              {phoneDetail.status && (
                <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                  <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Tình trạng máy:
                  </div>
                  <div className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                    {phoneDetail.status}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Pagination - Top */}
      {totalPages > 1 && (
        <div className="mb-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {renderDesktopView()}
      {renderMobileView()}

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

      {/* Export Detail Modal */}
      <ExportDetailModal
        isOpen={isExportModalOpen}
        onClose={handleCloseExportModal}
        exportRecordId={selectedExportRecordId}
        warehouseName={selectedWarehouseName}
        onSaveSuccess={async () => {
          await fetchListPhoneDetails(searchTerm);
        }}
      />

      {/* Pagination - Bottom (only show if current page has > 10 items) */}
      {totalPages > 1 && paginatedListPhoneDetails.length > 10 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}
