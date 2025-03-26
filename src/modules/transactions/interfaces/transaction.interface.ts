export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
}

export interface SalesReport {
  startDate: Date;
  endDate: Date;
  totalSales: number;
  paymentMethodBreakdown: Record<PaymentMethod, number>;
}
