// src/features/finance/utils/formatTimestamp.ts
/**
 * Format timestamp for Beirut timezone display
 * Adjusts the received timestamp by subtracting 2 hours for the Beirut timezone
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  // Adjust the received timestamp by subtracting 2 hours for the Beirut timezone
  date.setHours(date.getHours() - 2);

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Beirut",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true, // Set to true for 12-hour format
  };

  return date.toLocaleString("en-US", options);
}

