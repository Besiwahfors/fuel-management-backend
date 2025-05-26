export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
  COUPON = 'coupon',
}

export interface SalesReport {
  startDate: Date;
  endDate: Date;
  totalSales: number;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
}
