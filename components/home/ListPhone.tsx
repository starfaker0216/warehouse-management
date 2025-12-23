"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "../../lib/phoneService";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../utils/currencyUtils";
import { useAuth } from "../../contexts/AuthContext";
import { usePhoneStore } from "../../stores/usePhoneStore";
import EditPhoneModal from "./EditPhoneModal";

interface ListPhoneProps {
  phones: Phone[];
  searchTerm?: string;
  filterStatus?: string;
}

export default function ListPhone({
  phones,
  searchTerm,
  filterStatus
}: ListPhoneProps) {
  const router = useRouter();
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const { updatePhone, fetchPhones } = usePhoneStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  const handleEditClick = (phone: Phone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhone(phone);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedPhone(null);
  };

  const handleSave = async (
    id: string,
    phoneData: {
      name: string;
      data: Array<{ color: string; quantity: number; price: number }>;
      condition?: string;
    }
  ) => {
    // Calculate totalQuantity from data array
    const totalQuantity = phoneData.data.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    await updatePhone(id, {
      ...phoneData,
      totalQuantity
    });
    // Refresh phones list with current search/filter state
    await fetchPhones(searchTerm, filterStatus);
  };

  const handleCardClick = (phone: Phone, e: React.MouseEvent) => {
    // Don't navigate if clicking on the edit button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Get first available color
    const firstColor =
      phone.data && phone.data.length > 0 ? phone.data[0].color : "";

    // Navigate to export page with phone info
    const params = new URLSearchParams({
      phoneId: phone.id
    });
    if (firstColor) {
      params.append("color", firstColor);
    }
    router.push(`/export?${params.toString()}`);
  };

  if (phones.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center text-sm text-zinc-500 shadow-sm dark:bg-zinc-900 dark:text-zinc-400">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {phones.map((phone) => (
        <div
          key={phone.id}
          onClick={(e) => handleCardClick(phone, e)}
          className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-900"
        >
          <div className="p-4">
            {/* Header: Name, Model, Status */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {phone.name}
                </h3>
              </div>
              <div className="ml-3 flex flex-col items-end gap-2">
                <StatusBadge status={phone.status} />
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(phone, e)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-blue-500 hover:bg-zinc-50 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-500 dark:hover:bg-zinc-700 dark:hover:text-blue-400"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>

            {/* Color Details */}
            {phone.data && phone.data.length > 0 ? (
              <div className="mb-3 space-y-2">
                {phone.data.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.color}
                      </div>
                      <div className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                        Số lượng: {item.quantity}
                      </div>
                    </div>
                    <div className="ml-3 text-right">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {!item.price || item.price === 0
                          ? "Liên hệ Admin"
                          : formatCurrency(item.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-3 rounded-lg border border-dashed border-zinc-300 p-3 text-center text-xs text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
                Chưa có dữ liệu
              </div>
            )}

            {/* Condition */}
            {phone.condition && (
              <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Tình trạng máy:
                </div>
                <div className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                  {phone.condition}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      <EditPhoneModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        phone={selectedPhone}
        onSave={handleSave}
      />
    </div>
  );
}
