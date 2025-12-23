import { useMemo } from "react";
import { Phone } from "../lib/phoneService";

export function usePhoneFilters(phones: Phone[], searchTerm: string) {
  return useMemo(() => {
    // Tách searchTerm thành các từ riêng lẻ và loại bỏ khoảng trắng thừa
    const searchWords = searchTerm
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    return phones.filter((phone) => {
      // Tạo một chuỗi kết hợp từ tất cả các trường có thể tìm kiếm
      const searchableText = [phone.name.toLowerCase()].join(" ");

      // Kiểm tra xem tất cả các từ trong searchTerm có xuất hiện trong searchableText không
      const matchesSearch = searchWords.every((word) =>
        searchableText.includes(word)
      );

      return matchesSearch;
    });
  }, [phones, searchTerm]);
}
