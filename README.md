# Strategy Factory 패턴 — 결제 PG 연동 예제

실무에서 레거시 서비스에 테넌트별 기능을 추가할 때 적용했던 Strategy Factory 패턴을, 결제 PG 연동 예시로 변형해서 정리한 프로젝트입니다.

웹훅 페이로드와 PG사 이름은 패턴 설명을 위한 예시이며, 실제 API 스펙과는 다를 수 있습니다.

## 프로젝트 구조

```
src/payment/
├── interfaces/
│   └── payment-strategy.interface.ts   ← 공통 인터페이스 (approve, parseWebhook, refund)
├── strategies/
│   ├── toss-pay.strategy.ts            ← 토스페이먼츠 구현체
│   ├── samsung-pay.strategy.ts         ← 삼성페이 구현체
│   └── noop-payment.strategy.ts        ← 결제 없는 서비스용 (무동작)
├── payment.module.ts                   ← 환경변수 기반 팩토리 바인딩
├── payment.service.ts                  ← 전략을 주입받아 사용하는 서비스
└── payment.controller.ts              ← 테스트용 API 엔드포인트
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
