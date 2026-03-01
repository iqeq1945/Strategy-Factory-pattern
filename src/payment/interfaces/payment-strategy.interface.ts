/**
 * 결제사(PG)별 API 구조가 다르기 때문에
 * 공통 인터페이스로 추상화한다.
 */

// 결제 승인 요청 파라미터
export interface PaymentApproveRequest {
  orderId: string;
  amount: number;
  paymentToken: string; // 클라이언트에서 받은 결제 토큰
}

// 결제 승인 결과 — 내부 도메인 모델
export interface PaymentApproveResult {
  orderId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  transactionId: string;
  approvedAt: Date | null;
}

// 환불 결과
export interface RefundResult {
  refundId: string;
  refundedAmount: number;
}

// 전략 인터페이스
export interface IPaymentStrategy {
  /** 결제 승인 요청 — PG사별 API 호출 */
  approve(request: PaymentApproveRequest): Promise<PaymentApproveResult>;

  /** 결제 취소/환불 — PG사별 API 호출 */
  refund(transactionId: string, amount: number): Promise<RefundResult>;

  /** PG사 웹훅 페이로드 → 내부 도메인 모델로 파싱 */
  parseWebhook(payload: Record<string, any>): PaymentApproveResult;
}

export const PAYMENT_STRATEGY = Symbol('PAYMENT_STRATEGY');
