"use client";

import { useRouter } from "next/navigation";
import { PhoneDetail } from "../../lib/phoneDetailService";
import { formatCurrency } from "../../utils/currencyUtils";

interface ListPhoneProps {
  listPhoneDetails: PhoneDetail[];
}

export default function ListPhone({ listPhoneDetails }: ListPhoneProps) {
  const router = useRouter();

  const handleCardClick = (phoneDetail: PhoneDetail, e: React.MouseEvent) => {
    // Don't navigate if clicking on the edit button
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Navigate to export page with phone info
    const params = new URLSearchParams({
      phoneId: phoneDetail.phoneId
    });
    if (phoneDetail.color) {
      params.append("color", phoneDetail.color);
    }
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
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {!phoneDetail.salePrice || phoneDetail.salePrice === 0
                      ? "Liên hệ Admin"
                      : formatCurrency(phoneDetail.salePrice)}
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
}
