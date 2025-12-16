import StatisticsCard from "../home/StatisticsCard";
import { formatCurrency } from "../../utils/currencyUtils";

interface StatisticsCardsProps {
  totalRemainingQuantity: number;
  totalInventoryValue: number;
  totalImportValue: number;
  totalExportValue: number;
  totalIncome: number;
  totalExpense: number;
}

export default function StatisticsCards({
  totalRemainingQuantity,
  totalInventoryValue,
  totalImportValue,
  totalExportValue,
  totalIncome,
  totalExpense
}: StatisticsCardsProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatisticsCard
        title="Tổng hàng tồn"
        value={totalRemainingQuantity}
        icon={
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7l9-4 9 4-9 4-9-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10l9 4 9-4V7"
            />
          </svg>
        }
        iconBgColor="bg-blue-100 dark:bg-blue-900/30"
      />

      <StatisticsCard
        title="Tổng tiền nhập"
        value={formatCurrency(totalImportValue)}
        icon={
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconBgColor="bg-green-100 dark:bg-green-900/30"
        valueSize="text-xl"
      />

      <StatisticsCard
        title="Tổng tiền xuất"
        value={formatCurrency(totalExportValue)}
        icon={
          <svg
            className="h-6 w-6 text-amber-600 dark:text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        }
        iconBgColor="bg-amber-100 dark:bg-amber-900/30"
        valueSize="text-xl"
      />

      <StatisticsCard
        title="Giá trị hàng tồn"
        value={formatCurrency(totalInventoryValue)}
        icon={
          <svg
            className="h-6 w-6 text-purple-600 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        iconBgColor="bg-purple-100 dark:bg-purple-900/30"
        valueSize="text-xl"
      />

      <StatisticsCard
        title="Tổng thu"
        value={formatCurrency(totalIncome)}
        icon={
          <svg
            className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        iconBgColor="bg-emerald-100 dark:bg-emerald-900/30"
        valueSize="text-xl"
      />

      <StatisticsCard
        title="Tổng chi"
        value={formatCurrency(totalExpense)}
        icon={
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        }
        iconBgColor="bg-red-100 dark:bg-red-900/30"
        valueSize="text-xl"
      />
    </div>
  );
}


