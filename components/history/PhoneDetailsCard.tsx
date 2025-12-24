import { PhoneDetailWithStatus } from "./types";
import { formatCurrency } from "../../utils/currencyUtils";
import { getStatusText, getStatusColor } from "./phoneStatusUtils";

interface PhoneDetailsCardProps {
  phoneDetails: PhoneDetailWithStatus[];
}

export default function PhoneDetailsCard({
  phoneDetails
}: PhoneDetailsCardProps) {
  return (
    <div className="space-y-3 md:hidden">
      {phoneDetails.map((detail, index) => (
        <div
          key={detail.id}
          className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="p-4">
            {/* Header: STT and Status */}
            <div className="mb-3 flex items-start justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                STT: {index + 1}
              </div>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  detail.phoneStatus
                )}`}
              >
                {getStatusText(detail.phoneStatus)}
              </span>
            </div>

            {/* Color and IMEI */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Màu sắc:
                </span>
                <span className="text-sm text-zinc-900 dark:text-zinc-50">
                  {detail.color || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  IMEI:
                </span>
                <span className="text-sm text-zinc-900 dark:text-zinc-50">
                  {detail.imei || "N/A"}
                </span>
              </div>
            </div>

            {/* Prices */}
            <div className="mb-3 rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Giá nhập:
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(detail.importPrice || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Giá bán:
                  </span>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(detail.salePrice || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status */}
            {detail.status && (
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Tình trạng máy:
                </div>
                <div className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-700 dark:text-zinc-300">
                  {detail.status}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
