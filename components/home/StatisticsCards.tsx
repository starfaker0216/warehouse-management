import StatisticsCard from "./StatisticsCard";
import { formatCurrency } from "../../utils/currencyUtils";
import { PhoneStatistics } from "../../hooks/usePhoneStatistics";

interface StatisticsCardsProps {
  statistics: PhoneStatistics;
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const { totalPhones, totalValue } = statistics;

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
    </div>
  );
}
