export const number = new Intl.NumberFormat("en-US");
export const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});
export const month = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
  timeZone: "America/New_York",
});

export function formatDate(value?: string) {
  if (!value) return "Not provided";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : date.format(parsed);
}

export function titleCase(value?: string) {
  return value
    ? value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Not provided";
}
