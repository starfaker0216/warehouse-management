import { useMemo } from "react";
import { Phone } from "../lib/phoneService";

export function usePhoneFilters(
  phones: Phone[],
  searchTerm: string,
  filterStatus: string
) {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return phones.filter(
        (phone) => filterStatus === "all" || phone.status === filterStatus
      );
    }

    // Tách searchTerm thành các từ riêng lẻ và loại bỏ khoảng trắng thừa
    const searchWords = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return phones.filter((phone) => {
      // Tạo một chuỗi kết hợp từ tất cả các trường có thể tìm kiếm
      const searchableText = [
        phone.id.toLowerCase(),
        phone.name.toLowerCase(),
        phone.model.toLowerCase()
      ].join(" ");

      // Kiểm tra xem tất cả các từ trong searchTerm có xuất hiện trong searchableText không
      const matchesSearch = searchWords.every((word) =>
        searchableText.includes(word)
      );

      const matchesStatus =
        filterStatus === "all" || phone.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [phones, searchTerm, filterStatus]);
}
