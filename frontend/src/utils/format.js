// Formats a number as Kenyan Shillings, e.g. 12000 -> "KSh 12,000"
export const formatMoney = (value) => {
  const num = Number(value) || 0;
  return `KSh ${num.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Formats an ISO date string into something readable, e.g. "16 Aug 2026, 10:42"
export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
