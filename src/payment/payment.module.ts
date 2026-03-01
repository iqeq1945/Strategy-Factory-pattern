import { Module } from '@nestjs/common';
import { PAYMENT_STRATEGY } from './interfaces/payment-strategy.interface';
import { TossPayStrategy } from './strategies/toss-pay.strategy';
import { SamsungPayStrategy } from './strategies/samsung-pay.strategy';
import { NoopPaymentStrategy } from './strategies/noop-payment.strategy';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
  controllers: [PaymentController],
  providers: [
    TossPayStrategy,
    SamsungPayStrategy,
    NoopPaymentStrategy,
    PaymentService,

    // ──────────────────────────────────────────────
    // 핵심: 환경변수에 따라 다른 PG 구현체를 주입
    // ──────────────────────────────────────────────
    {
      provide: PAYMENT_STRATEGY,
      useFactory(
        toss: TossPayStrategy,
        samsung: SamsungPayStrategy,
        noop: NoopPaymentStrategy,
      ) {
        switch (process.env.PAYMENT_PROVIDER) {
          case 'toss':
            return toss;
          case 'samsung':
            return samsung;
          default:
            return noop;
        }
      },
      inject: [TossPayStrategy, SamsungPayStrategy, NoopPaymentStrategy],
    },
  ],
  exports: [PAYMENT_STRATEGY],
})
export class PaymentModule {}
