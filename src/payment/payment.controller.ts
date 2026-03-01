import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /** 결제 승인 */
  @Post('approve')
  async approve(
    @Body() body: { orderId: string; amount: number; paymentToken: string },
  ) {
    return this.paymentService.approve(body);
  }

  /** 환불 */
  @Post('refund')
  async refund(@Body() body: { transactionId: string; amount: number }) {
    return this.paymentService.refund(body.transactionId, body.amount);
  }

  /** PG사 웹훅 수신 */
  @Post('webhook')
  async webhook(@Body() payload: Record<string, any>) {
    return this.paymentService.handleWebhook(payload);
  }
}
