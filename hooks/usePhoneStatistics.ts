import { useMemo } from "react";
import { PhoneDetail } from "../lib/phoneDetailService";

export interface PhoneStatistics {
  totalPhones: number;
  totalValue: number;
}

export function usePhoneStatistics(
  phoneDetails: PhoneDetail[]
): PhoneStatistics {
  return useMemo(() => {
    // Mỗi PhoneDetail đại diện cho 1 điện thoại
    const totalPhones = phoneDetails.length;

    // Tính tổng giá trị từ importPrice của mỗi PhoneDetail
    const totalValue = phoneDetails.reduce(
      (sum, phoneDetail) => sum + (phoneDetail.salePrice || 0),
      0
    );

    return {
      totalPhones,
      totalValue
    };
  }, [phoneDetails]);
}
