import { PhoneStatus } from "./types";

export const getStatusText = (status: PhoneStatus): string => {
  switch (status) {
    case "in_warehouse":
      return "Còn trong kho";
    case "exported":
      return "Đã bán";
    case "recycled":
      return "Đã xoá";
    default:
      return "N/A";
  }
};

export const getStatusColor = (status: PhoneStatus): string => {
  switch (status) {
    case "in_warehouse":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "exported":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "recycled":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400";
  }
};
