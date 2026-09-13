// Human-friendly order numbers, e.g. BXN-20260912-4821
// (the internal cuid `Order.id` is the real primary key; this is just customer-facing)
export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BXN-${y}${m}${d}-${rand}`;
}
