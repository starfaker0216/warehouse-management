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
  // Format should be DDMMYYYY (8 digits)
  if (cleaned.length < 8) {
    // If incomplete, try to parse what we have
    // For partial input, we'll be lenient
    return null;
  }

  const day = parseInt(cleaned.substring(0, 2), 10);
  const month = parseInt(cleaned.substring(2, 4), 10) - 1; // Month is 0-indexed
  const year = parseInt(cleaned.substring(4, 8), 10);

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

  // Limit to 8 digits (DDMMYYYY)
  const limited = digits.substring(0, 8);

  if (limited.length === 0) return "";

  // Format: DD / MM / YYYY
  let formatted = "";

  if (limited.length >= 1) {
    formatted += limited.substring(0, 2);
  }
  if (limited.length >= 3) {
    formatted += " / " + limited.substring(2, 4);
  }
  if (limited.length >= 5) {
    formatted += " / " + limited.substring(4, 8);
  }

  return formatted;
};
