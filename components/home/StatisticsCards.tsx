import StatisticsCard from "./StatisticsCard";
import { formatCurrency } from "../../utils/currencyUtils";
import { PhoneStatistics } from "../../hooks/usePhoneStatistics";

interface StatisticsCardsProps {
  statistics: PhoneStatistics;
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const { totalPhones, totalValue, lowStockCount, outOfStockCount } =
    statistics;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatisticsCard
        title="Tổng số máy"
        value={totalPhones}
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        }
        iconBgColor="bg-blue-100 dark:bg-blue-900/30"
      />

      <StatisticsCard
        title="Tổng giá trị"
        value={formatCurrency(totalValue)}
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
        title="Sắp hết hàng"
        value={lowStockCount}
        icon={
          <svg
            className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        }
        iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
        valueColor="text-yellow-600 dark:text-yellow-400"
      />

      <StatisticsCard
        title="Hết hàng"
        value={outOfStockCount}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        }
        iconBgColor="bg-red-100 dark:bg-red-900/30"
        valueColor="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
