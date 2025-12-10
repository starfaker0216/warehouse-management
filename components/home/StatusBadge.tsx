import { Phone } from "../../lib/phoneService";

interface StatusBadgeProps {
  status: Phone["status"];
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    in_stock:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    low_stock:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    out_of_stock: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  };
  const labels = {
    in_stock: "Còn hàng",
    low_stock: "Sắp hết",
    out_of_stock: "Hết hàng"
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
