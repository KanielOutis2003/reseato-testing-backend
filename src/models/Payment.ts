export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
}
