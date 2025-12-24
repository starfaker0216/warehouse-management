"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneDetail } from "../../lib/phoneDetailService";
import { formatCurrency } from "../../utils/currencyUtils";
import { useAuth } from "../../contexts/AuthContext";
import { usePhoneStore } from "../../stores/usePhoneStore";
import EditPhoneDetailModal from "./EditPhoneDetailModal";

interface ListPhoneProps {
  listPhoneDetails: PhoneDetail[];
}

export default function ListPhone({ listPhoneDetails }: ListPhoneProps) {
  const router = useRouter();
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const { updatePhoneDetail, fetchListPhoneDetails, currentSearchTerm } =
    usePhoneStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhoneDetail, setSelectedPhoneDetail] =
    useState<PhoneDetail | null>(null);

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
    await fetchListPhoneDetails(currentSearchTerm);
  };

  const handleDeleted = async () => {
    await fetchListPhoneDetails(currentSearchTerm);
  };

  const handleCardClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
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
      <div className="rounded-lg bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {listPhoneDetails.map((phoneDetail) => (
        <div
          key={phoneDetail.id}
          onClick={(e) => handleCardClick(phoneDetail, e)}
          className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
        >
          <div className="p-4">
            {/* Header: Name */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {phoneDetail.name}
                </h3>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={(e) => handleEditClick(phoneDetail, e)}
                  className="ml-2 rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Chỉnh sửa
                </button>
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

      {/* Edit Modal */}
      <EditPhoneDetailModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        phoneDetail={selectedPhoneDetail}
        onSave={handleSave}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
