import { Payment } from '../models/Payment';
declare class PaymentService {
    createPayment(userId: string, reservationId: string, amount: number, paymentMethod: string): Promise<Payment>;
    getPaymentByReservationId(reservationId: string): Promise<Payment | null>;
}
declare const _default: PaymentService;
export default _default;
//# sourceMappingURL=paymentService.d.ts.map