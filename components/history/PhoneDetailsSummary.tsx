import { PhoneDetailWithStatus } from "./types";
import { formatCurrency } from "../../utils/currencyUtils";

interface PhoneDetailsSummaryProps {
  phoneDetails: PhoneDetailWithStatus[];
}

export default function PhoneDetailsSummary({
  phoneDetails
}: PhoneDetailsSummaryProps) {
  const totalImportPrice = phoneDetails.reduce(
    (sum, detail) => sum + (detail.importPrice || 0),
    0
  );

  const totalSalePrice = phoneDetails.reduce(
    (sum, detail) => sum + (detail.salePrice || 0),
    0
  );

  return (
    <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tổng số lượng:
          </span>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {phoneDetails.length}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tổng giá nhập:
          </span>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(totalImportPrice)}
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tổng giá bán:
          </span>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(totalSalePrice)}
          </p>
        </div>
      </div>
    </div>
  );
}
