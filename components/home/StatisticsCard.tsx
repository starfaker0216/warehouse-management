interface StatisticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor?: string;
  valueSize?: string;
}

export default function StatisticsCard({
  title,
  value,
  icon,
  iconBgColor,
  valueColor = "text-zinc-900 dark:text-zinc-50",
  valueSize = "text-2xl"
}: StatisticsCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {title}
          </p>
          <p className={`mt-2 ${valueSize} font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className={`rounded-full p-3 ${iconBgColor}`}>{icon}</div>
      </div>
    </div>
  );
}
