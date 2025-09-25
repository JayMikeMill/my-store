import { PaymentRequest } from "@shared/types/PaymentRequest";
import { payment } from "@config/adapters";

export class PaymentService {
  static async processPayment(data: PaymentRequest) {
    return payment.processPayment(data);
  }

  static async refundPayment(paymentId: string, amount?: number) {
    return payment.refundPayment(paymentId, amount);
  }
}
