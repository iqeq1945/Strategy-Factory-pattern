import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  console.log(`서버 시작 — PAYMENT_PROVIDER=${process.env.PAYMENT_PROVIDER ?? '(미설정 → Noop)'}`);
}
bootstrap();
