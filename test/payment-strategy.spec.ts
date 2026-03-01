import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../src/payment/payment.service';
import { PAYMENT_STRATEGY } from '../src/payment/interfaces/payment-strategy.interface';
import { TossPayStrategy } from '../src/payment/strategies/toss-pay.strategy';
import { SamsungPayStrategy } from '../src/payment/strategies/samsung-pay.strategy';
import { NoopPaymentStrategy } from '../src/payment/strategies/noop-payment.strategy';

/**
 * 구현체별 독립 테스트
 * — if/else 분기와 달리 각 전략을 개별적으로 테스트할 수 있다
 */

describe('TossPayStrategy', () => {
  const strategy = new TossPayStrategy();

  it('결제 승인을 처리한다', async () => {
    const result = await strategy.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token_abc',
    });

    expect(result.orderId).toBe('ORDER-001');
    expect(result.amount).toBe(15000);
    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toContain('toss_');
  });

  it('토스 웹훅 성공 페이로드를 파싱한다', () => {
    const result = strategy.parseWebhook({
      paymentKey: 'toss_abc123',
      orderId: 'ORDER-001',
      totalAmount: 15000,
      status: 'DONE',
      approvedAt: '2026-03-01T12:00:00+09:00',
    });

    expect(result.orderId).toBe('ORDER-001');
    expect(result.amount).toBe(15000);
    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toBe('toss_abc123');
    expect(result.approvedAt).toBeInstanceOf(Date);
  });

  it('토스 웹훅 취소 페이로드를 파싱한다', () => {
    const result = strategy.parseWebhook({
      paymentKey: 'toss_abc123',
      orderId: 'ORDER-002',
      totalAmount: 5000,
      status: 'CANCELED',
    });

    expect(result.status).toBe('CANCELLED');
    expect(result.approvedAt).toBeNull();
  });

  it('환불을 처리한다', async () => {
    const result = await strategy.refund('toss_abc123', 15000);

    expect(result.refundId).toContain('toss_refund_');
    expect(result.refundedAmount).toBe(15000);
  });
});

describe('SamsungPayStrategy', () => {
  const strategy = new SamsungPayStrategy();

  it('결제 승인을 처리한다', async () => {
    const result = await strategy.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token_xyz',
    });

    expect(result.orderId).toBe('ORDER-001');
    expect(result.amount).toBe(15000);
    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toContain('samsung_');
  });

  it('삼성 웹훅 성공 페이로드를 파싱한다', () => {
    const result = strategy.parseWebhook({
      ref_id: 'samsung_xyz789',
      merchant_ref: 'ORDER-001',
      pay_info: { amount: 15000, currency: 'KRW' },
      result_code: '0000',
      result_msg: '성공',
      timestamp: 1709269200000,
    });

    expect(result.orderId).toBe('ORDER-001');
    expect(result.amount).toBe(15000);
    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toBe('samsung_xyz789');
    expect(result.approvedAt).toBeInstanceOf(Date);
  });

  it('삼성 웹훅 실패 페이로드를 파싱한다', () => {
    const result = strategy.parseWebhook({
      merchant_ref: 'ORDER-003',
      pay_info: { amount: 30000, currency: 'KRW' },
      result_code: '9999',
      result_msg: '잔액 부족',
      timestamp: 1709269200000,
    });

    expect(result.status).toBe('FAILED');
    expect(result.approvedAt).toBeNull();
  });

  it('환불을 처리한다', async () => {
    const result = await strategy.refund('samsung_xyz789', 15000);

    expect(result.refundId).toContain('samsung_refund_');
    expect(result.refundedAmount).toBe(15000);
  });
});

describe('NoopPaymentStrategy', () => {
  const strategy = new NoopPaymentStrategy();

  it('승인 시 빈 결과를 반환한다', async () => {
    const result = await strategy.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token',
    });

    expect(result.orderId).toBe('');
    expect(result.amount).toBe(0);
    expect(result.status).toBe('FAILED');
  });

  it('웹훅 파싱 시 빈 결과를 반환한다', () => {
    const result = strategy.parseWebhook({});

    expect(result.orderId).toBe('');
    expect(result.transactionId).toBe('');
  });

  it('환불 시 빈 결과를 반환한다', async () => {
    const result = await strategy.refund('tx_001', 15000);

    expect(result.refundId).toBe('');
    expect(result.refundedAmount).toBe(0);
  });
});

describe('PaymentService — 전략 주입 테스트', () => {
  async function createServiceWith(strategy: any): Promise<PaymentService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PAYMENT_STRATEGY, useValue: strategy },
      ],
    }).compile();

    return module.get(PaymentService);
  }

  it('토스 전략 주입 시 토스 승인을 처리한다', async () => {
    const service = await createServiceWith(new TossPayStrategy());

    const result = await service.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token',
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toContain('toss_');
  });

  it('삼성 전략 주입 시 삼성 승인을 처리한다', async () => {
    const service = await createServiceWith(new SamsungPayStrategy());

    const result = await service.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token',
    });

    expect(result.status).toBe('SUCCESS');
    expect(result.transactionId).toContain('samsung_');
  });

  it('Noop 전략 주입 시 아무 동작도 하지 않는다', async () => {
    const service = await createServiceWith(new NoopPaymentStrategy());

    const result = await service.approve({
      orderId: 'ORDER-001',
      amount: 15000,
      paymentToken: 'token',
    });

    expect(result.orderId).toBe('');
    expect(result.status).toBe('FAILED');
  });
});
