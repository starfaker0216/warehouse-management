"use client";

import { useState } from "react";
import { Phone } from "../../lib/phoneService";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "../../utils/currencyUtils";
import { useAuth } from "../../contexts/AuthContext";
import { usePhoneStore } from "../../stores/usePhoneStore";
import EditPhoneModal from "./EditPhoneModal";

interface PhoneTableProps {
  phones: Phone[];
  searchTerm?: string;
  filterStatus?: string;
}

export default function PhoneTable({
  phones,
  searchTerm,
  filterStatus
}: PhoneTableProps) {
  const { employee } = useAuth();
  const isAdmin = employee?.role === "admin";
  const { updatePhone, fetchPhones } = usePhoneStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);

  const handleEditClick = (phone: Phone) => {
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
      model: string;
      data: Array<{ color: string; quantity: number; price: number }>;
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

  if (phones.length === 0) {
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
                Chi tiết màu sắc
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tổng số lượng
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Trạng thái
              </th>
              {isAdmin && (
                <th className="w-fit py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"></th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {phones.map((phone) => (
              <tr
                key={phone.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {phone.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {phone.model}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  {phone.data && phone.data.length > 0 ? (
                    <div className="space-y-1">
                      {phone.data.map((item, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-medium">{item.color}:</span>{" "}
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">
                      Chưa có dữ liệu
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  {phone.data && phone.data.length > 0 ? (
                    <div className="space-y-1">
                      {phone.data.map((item, index) => (
                        <div key={index} className="text-xs">
                          <span className="font-medium">{item.color}:</span>{" "}
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {formatCurrency(item.price || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-500">
                      Chưa có giá
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-900 dark:text-zinc-50">
                  <span
                    className={`font-semibold ${
                      phone.totalQuantity === 0
                        ? "text-red-600 dark:text-red-400"
                        : phone.totalQuantity < 10
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {phone.totalQuantity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <StatusBadge status={phone.status} />
                </td>
                {isAdmin && (
                  <td className="whitespace-nowrap py-4 text-sm">
                    <button
                      type="button"
                      onClick={() => handleEditClick(phone)}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
