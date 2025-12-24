/**
 * Utility functions for date formatting
 */

/**
 * Format a Date object to DD / MM / YYYY format
 */
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} / ${month} / ${year}`;
};

/**
 * Parse a date string in DD / MM / YYYY format to a Date object
 * Returns null if the date is invalid
 */
export const parseDate = (value: string): Date | null => {
  // Remove all spaces and slashes, keep only digits
  const cleaned = value.replace(/[^\d]/g, "");

  // If empty, return null
  if (!cleaned) return null;

  // Extract day, month, year from the cleaned string
  // Format should be DDMMYYYY (8 digits minimum, but can be up to 10 for full year)
  if (cleaned.length < 8) {
    // If incomplete, try to parse what we have
    // For partial input, we'll be lenient
    return null;
  }

  const day = parseInt(cleaned.substring(0, 2), 10);
  const month = parseInt(cleaned.substring(2, 4), 10) - 1; // Month is 0-indexed
  // Take up to 4 digits for year (positions 4-8, or 4-10 if available)
  const yearStr = cleaned.substring(4, Math.min(8, cleaned.length));
  const year = parseInt(yearStr, 10);

  // If year is less than 4 digits, it's incomplete
  if (yearStr.length < 4) {
    return null;
  }

  // Validate date
  const date = new Date(year, month, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month ||
    date.getFullYear() !== year
  ) {
    return null; // Invalid date
  }

  return date;
};

/**
 * Format date input as user types (DD / MM / YYYY)
 * Automatically adds slashes and spaces
 */
export const formatDateInput = (value: string): string => {
  // Remove all non-digit characters
  const digits = value.replace(/[^\d]/g, "");

  // Limit to 10 digits (DDMMYYYY - 2+2+4 for year)
  const limited = digits.substring(0, 10);

  if (limited.length === 0) return "";

  // Format: DD / MM / YYYY
  let formatted = "";

  if (limited.length >= 1) {
    formatted += limited.substring(0, Math.min(2, limited.length));
  }
  if (limited.length >= 3) {
    formatted += " / " + limited.substring(2, Math.min(4, limited.length));
  }
  if (limited.length >= 5) {
    // Take remaining digits for year (up to 4 digits)
    const yearDigits = limited.substring(4, Math.min(8, limited.length));
    formatted += " / " + yearDigits;
  }

  return formatted;
};
