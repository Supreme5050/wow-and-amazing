export const ORDER_STATUS_FLOW = ["paid", "processing", "shipped", "delivered"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Payment",
  paid: "Payment Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function orderStatusDescription(status: string) {
  switch (status) {
    case "paid": return "Payment has been confirmed and the order is ready for fulfilment.";
    case "processing": return "The owner is preparing the products for dispatch.";
    case "shipped": return "The order has left the store and is on its way.";
    case "delivered": return "The order has been marked as delivered.";
    case "cancelled": return "This order was cancelled. Contact support if you need more information.";
    case "refunded": return "The payment for this order has been marked as refunded.";
    default: return "The order is awaiting its next update.";
  }
}
