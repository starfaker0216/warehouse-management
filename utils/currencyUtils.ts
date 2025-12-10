/**
 * Utility functions for currency formatting and price suggestions
 */

/**
 * Format a number as Vietnamese currency
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(amount);
};

/**
 * Format a number for input display (with thousand separators)
 */
export const formatCurrencyInput = (amount: number): string => {
  if (amount === 0 || isNaN(amount)) return "";
  // Format với dấu phẩy ngăn cách hàng nghìn
  return amount.toLocaleString("vi-VN");
};

/**
 * Parse a currency input string to a number
 */
export const parseCurrencyInput = (value: string): number => {
  // Loại bỏ tất cả ký tự không phải số
  const cleaned = value.replace(/[^\d]/g, "");
  return cleaned ? parseFloat(cleaned) : 0;
};

/**
 * Format a price value for suggestion display (e.g., 1.5M, 2.3B)
 */
export const formatPriceSuggest = (value: number): string => {
  if (value >= 1000000000) {
    const billions = value / 1000000000;
    // Làm tròn đến 2 chữ số thập phân, loại bỏ số 0 thừa, dùng dấu phẩy
    const rounded = Math.round(billions * 100) / 100;
    if (rounded % 1 === 0) {
      return `${rounded}B`;
    } else {
      return `${rounded
        .toFixed(2)
        .replace(/\.?0+$/, "")
        .replace(".", ",")}B`;
    }
  } else if (value >= 1000000) {
    const millions = value / 1000000;
    const rounded = Math.round(millions * 100) / 100;
    if (rounded % 1 === 0) {
      return `${rounded}M`;
    } else {
      return `${rounded
        .toFixed(2)
        .replace(/\.?0+$/, "")
        .replace(".", ",")}M`;
    }
  } else if (value >= 1000) {
    const thousands = value / 1000;
    const rounded = Math.round(thousands * 100) / 100;
    if (rounded % 1 === 0) {
      return `${rounded}K`;
    } else {
      return `${rounded
        .toFixed(2)
        .replace(/\.?0+$/, "")
        .replace(".", ",")}K`;
    }
  }
  return value.toString();
};

/**
 * Get price suggestions based on input value
 */
export const getPriceSuggests = (inputValue: string): number[] => {
  const num = parseFloat(inputValue);
  if (isNaN(num) || num <= 0) return [];

  // Xác định số chữ số của số nhập vào (không tính phần thập phân)
  const numStr = Math.floor(num).toString();
  const numDigits = numStr.length;

  // Xác định hệ số nhân ban đầu dựa trên số chữ số
  let baseMultiplier: number;
  if (numDigits === 1) {
    // 1 chữ số: nhân với 1000, 10000, 100000, 1000000, 10000000
    baseMultiplier = 1000;
  } else if (numDigits === 2) {
    // 2 chữ số: nhân với 1000, 10000, 100000, 1000000, 10000000
    baseMultiplier = 1000;
  } else if (numDigits === 3) {
    // 3 chữ số: nhân với 100, 1000, 10000, 100000, 1000000
    baseMultiplier = 100;
  } else if (numDigits === 4) {
    // 4 chữ số: nhân với 100, 1000, 10000, 100000, 1000000
    baseMultiplier = 100;
  } else {
    // 5+ chữ số: nhân với 10, 100, 1000, 10000, 100000
    baseMultiplier = 10;
  }

  // Tạo 5 giá trị suggest
  const multipliers = [
    baseMultiplier,
    baseMultiplier * 10,
    baseMultiplier * 100,
    baseMultiplier * 1000,
    baseMultiplier * 10000
  ];
  return multipliers.map((mult) => num * mult);
};

