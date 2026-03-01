import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IPaymentStrategy,
  PaymentApproveRequest,
  PAYMENT_STRATEGY,
} from './interfaces/payment-strategy.interface';

/**
 * 결제 처리 서비스
 *
 * 이 서비스는 어떤 PG사 전략이 주입되었는지 모른다.
 * 인터페이스만 알고 있으므로, PG사가 추가되어도 이 코드는 변경되지 않는다.
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(PAYMENT_STRATEGY)
    private readonly strategy: IPaymentStrategy,
  ) {}

  /** 결제 승인 */
  async approve(request: PaymentApproveRequest) {
    this.logger.log(`결제 승인 요청 — 주문: ${request.orderId}, ${request.amount}원`);
    return this.strategy.approve(request);
  }

  /** 환불 */
  async refund(transactionId: string, amount: number) {
    this.logger.log(`환불 요청 — 거래: ${transactionId}, ${amount}원`);
    return this.strategy.refund(transactionId, amount);
  }

  /** PG사 웹훅 수신 */
  async handleWebhook(payload: Record<string, any>) {
    const result = this.strategy.parseWebhook(payload);
    this.logger.log(`웹훅 수신 — 주문: ${result.orderId}, 상태: ${result.status}`);
    // 주문 상태 업데이트 등 후처리...
    return result;
  }
}
