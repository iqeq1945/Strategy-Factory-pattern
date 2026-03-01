import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentStrategy,
  PaymentApproveRequest,
  PaymentApproveResult,
  RefundResult,
} from '../interfaces/payment-strategy.interface';

/**
 * 토스페이먼츠 PG 연동 전략
 *
 * 승인 API: POST /v1/payments/confirm
 * 웹훅 페이로드:
 * {
 *   "paymentKey": "toss_abc123",
 *   "orderId": "ORDER-001",
 *   "totalAmount": 15000,
 *   "status": "DONE",
 *   "approvedAt": "2026-03-01T12:00:00+09:00",
 *   "method": "카드"
 * }
 */
@Injectable()
export class TossPayStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(TossPayStrategy.name);

  async approve(request: PaymentApproveRequest): Promise<PaymentApproveResult> {
    this.logger.log(`[TossPay] 승인 요청 — ${request.orderId}, ${request.amount}원`);

    // 실제로는 토스 승인 API 호출
    // POST https://api.tosspayments.com/v1/payments/confirm
    // body: { paymentKey, orderId, amount }
    return {
      orderId: request.orderId,
      amount: request.amount,
      status: 'SUCCESS',
      transactionId: `toss_${Date.now()}`,
      approvedAt: new Date(),
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    this.logger.log(`[TossPay] 환불 요청 — ${transactionId}, ${amount}원`);

    // 실제로는 토스 취소 API 호출
    // POST https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
    return {
      refundId: `toss_refund_${Date.now()}`,
      refundedAmount: amount,
    };
  }

  parseWebhook(payload: Record<string, any>): PaymentApproveResult {
    const statusMap: Record<string, PaymentApproveResult['status']> = {
      DONE: 'SUCCESS',
      ABORTED: 'FAILED',
      CANCELED: 'CANCELLED',
      EXPIRED: 'FAILED',
    };

    return {
      orderId: payload.orderId,
      amount: payload.totalAmount,
      status: statusMap[payload.status] ?? 'FAILED',
      transactionId: payload.paymentKey,
      approvedAt: payload.approvedAt ? new Date(payload.approvedAt) : null,
    };
  }
}
