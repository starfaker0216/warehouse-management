import { useMemo } from "react";
import { Phone } from "../lib/phoneService";

export function usePhoneFilters(
  phones: Phone[],
  searchTerm: string,
  filterStatus: string
) {
  return useMemo(() => {
    return phones.filter((phone) => {
      const matchesSearch =
        phone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || phone.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [phones, searchTerm, filterStatus]);
}
