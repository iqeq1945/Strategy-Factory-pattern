import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentStrategy,
  PaymentApproveRequest,
  PaymentApproveResult,
  RefundResult,
} from '../interfaces/payment-strategy.interface';

/**
 * 삼성페이 PG 연동 전략
 *
 * 웹훅 페이로드:
 * {
 *   "ref_id": "samsung_xyz789",
 *   "merchant_ref": "ORDER-001",
 *   "pay_info": { "amount": 15000, "currency": "KRW" },
 *   "result_code": "0000",        ← "0000" = 성공
 *   "result_msg": "성공",
 *   "timestamp": 1709269200000
 * }
 */
@Injectable()
export class SamsungPayStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(SamsungPayStrategy.name);

  async approve(request: PaymentApproveRequest): Promise<PaymentApproveResult> {
    this.logger.log(`[SamsungPay] 승인 요청 — ${request.orderId}, ${request.amount}원`);

    // 실제로는 삼성페이 승인 API 호출
    return {
      orderId: request.orderId,
      amount: request.amount,
      status: 'SUCCESS',
      transactionId: `samsung_${Date.now()}`,
      approvedAt: new Date(),
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    this.logger.log(`[SamsungPay] 환불 요청 — ${transactionId}, ${amount}원`);

    // 실제로는 삼성페이 환불 API 호출
    return {
      refundId: `samsung_refund_${Date.now()}`,
      refundedAmount: amount,
    };
  }

  parseWebhook(payload: Record<string, any>): PaymentApproveResult {
    const isSuccess = payload.result_code === '0000';
    const isCancelled = payload.result_code === '2001';

    let status: PaymentApproveResult['status'];
    if (isSuccess) status = 'SUCCESS';
    else if (isCancelled) status = 'CANCELLED';
    else status = 'FAILED';

    return {
      orderId: payload.merchant_ref,
      amount: payload.pay_info?.amount ?? 0,
      status,
      transactionId: payload.ref_id,
      approvedAt: isSuccess ? new Date(payload.timestamp) : null,
    };
  }
}
