import { useMemo } from "react";
import { Phone } from "../lib/phoneService";

export interface PhoneStatistics {
  totalPhones: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export function usePhoneStatistics(phones: Phone[]): PhoneStatistics {
  return useMemo(() => {
    const totalPhones = phones.reduce(
      (sum, phone) => sum + phone.totalQuantity,
      0
    );
    const totalValue = phones.reduce(
      (sum, phone) => sum + phone.price * phone.totalQuantity,
      0
    );
    const lowStockCount = phones.filter(
      (phone) => phone.status === "low_stock"
    ).length;
    const outOfStockCount = phones.filter(
      (phone) => phone.status === "out_of_stock"
    ).length;

    return {
      totalPhones,
      totalValue,
      lowStockCount,
      outOfStockCount
    };
  }, [phones]);
}
