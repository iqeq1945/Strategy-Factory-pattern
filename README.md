# Strategy Factory 패턴 — 결제 PG사별 연동 예제

NestJS에서 **환경변수 하나로 PG사별 구현체를 갈아끼우는** Strategy Factory 패턴 예제입니다.

## 프로젝트 구조

```
src/payment/
├── interfaces/
│   └── payment-strategy.interface.ts   ← 공통 인터페이스
├── strategies/
│   ├── toss-pay.strategy.ts            ← 토스페이먼츠 구현체
│   ├── samsung-pay.strategy.ts         ← 삼성페이 구현체
│   └── noop-payment.strategy.ts        ← 무동작 구현체
├── payment.module.ts                   ← 팩토리 바인딩
├── payment.service.ts                  ← 전략을 사용하는 서비스
└── payment.controller.ts              ← API 엔드포인트
test/
└── payment-strategy.spec.ts            ← 구현체별 독립 테스트
```

## 실행 방법

```bash
npm install

# 토스 모드
PAYMENT_PROVIDER=toss npm run start:dev

# 삼성 모드
PAYMENT_PROVIDER=samsung npm run start:dev
```

## 테스트

```bash
npm test
```

## 블로그 글

[blog-post.md](./blog-post.md)에 패턴 설명이 정리되어 있습니다.
