import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentStrategy,
  PaymentApproveRequest,
  PaymentApproveResult,
  RefundResult,
} from '../interfaces/payment-strategy.interface';

/**
 * Noop 전략 — 결제 기능이 없는 서비스용
 *
 * 결제 처리가 필요 없는 서비스(어드민, 내부 도구 등)에서는
 * 이 구현체가 주입되어 아무 동작도 하지 않는다.
 */
@Injectable()
export class NoopPaymentStrategy implements IPaymentStrategy {
  private readonly logger = new Logger(NoopPaymentStrategy.name);

  async approve(_request?: PaymentApproveRequest): Promise<PaymentApproveResult> {
    this.logger.debug('[Noop] 결제 승인 스킵');
    return {
      orderId: '',
      amount: 0,
      status: 'FAILED',
      transactionId: '',
      approvedAt: null,
    };
  }

  async refund(_transactionId?: string, _amount?: number): Promise<RefundResult> {
    this.logger.debug('[Noop] 환불 처리 스킵');
    return { refundId: '', refundedAmount: 0 };
  }

  parseWebhook(_payload?: Record<string, any>): PaymentApproveResult {
    return {
      orderId: '',
      amount: 0,
      status: 'FAILED',
      transactionId: '',
      approvedAt: null,
    };
  }
}
