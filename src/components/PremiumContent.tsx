'use client';

import { useState } from 'react';
import PaymentButton from './PaymentButton';
import type { Session } from 'next-auth';

interface PremiumContentProps {
  user: Session['user'] | null;
}

export default function PremiumContent({ user }: PremiumContentProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'monthly',
      name: '월간 프리미엄',
      price: 1000,
      features: [
        '모든 상자의 무제한 카드 추가',
        '고급 학습 통계 제공',
        '모든 기기 동기화',
        '<strong>서비스 이용 기간: 결제일로부터 1개월</strong>',
        '<strong>테스트 결제용 특별가</strong>',
      ],
      popular: false,
    },
    {
      id: 'yearly',
      name: '연간 프리미엄',
      price: 1000,
      features: [
        '모든 상자의 무제한 카드 추가',
        '고급 학습 통계 제공',
        '모든 기기 동기화',
        '우선 지원',
        '2개월 무료',
        '<strong>서비스 이용 기간: 결제일로부터 1년</strong>',
        '<strong>테스트 결제용 특별가</strong>',
      ],
      popular: true,
    },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold mb-6 text-center">요금제 선택</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 transition-all ${
              selectedPlan === plan.id
                ? 'border-[var(--primary)] bg-[var(--neutral-200)]'
                : 'border-[var(--neutral-300)] hover:border-[var(--primary-hover)]'
            } ${plan.popular ? 'relative' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 right-4 bg-[var(--primary)] text-white text-xs py-1 px-3 rounded-full">
                인기 선택
              </div>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2 mb-4">
              {plan.price.toLocaleString()}원
              <span className="text-sm font-normal text-[var(--neutral-700)]">
                {plan.id === 'monthly' ? '/월' : '/년'}
              </span>
            </p>

            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[var(--primary)] mr-2">✓</span>
                  <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg transition-colors ${
                selectedPlan === plan.id
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--neutral-200)] text-[var(--neutral-900)] hover:bg-[var(--neutral-300)]'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {selectedPlan === plan.id ? '선택됨' : '선택하기'}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="bg-[var(--neutral-200)] p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">결제 진행</h3>
          <p className="mb-6">
            선택한 상품:{' '}
            <strong>
              {plans.find((p) => p.id === selectedPlan)?.name} (
              {plans.find((p) => p.id === selectedPlan)?.price.toLocaleString()}원)
            </strong>
          </p>
          
          <PaymentButton
            productName={plans.find((p) => p.id === selectedPlan)?.name || ''}
            amount={plans.find((p) => p.id === selectedPlan)?.price || 0}
            customerName={user?.name || '구매자'}
            customerEmail={user?.email || 'customer@example.com'}
            customerMobile="01012345678"
          />
          
          <p className="text-sm text-[var(--neutral-700)] mt-4 text-center">
            결제 진행 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-[var(--neutral-300)] pt-6">
        <h3 className="text-lg font-semibold mb-4">자주 묻는 질문</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">프리미엄 구독은 언제든지 취소할 수 있나요?</h4>
            <p className="text-[var(--neutral-700)]">
              네, 언제든지 구독을 취소할 수 있으며, 남은 기간 동안은 프리미엄 기능을 계속 이용하실 수 있습니다.
            </p>
          </div>
          <div>
            <h4 className="font-medium">결제 방법은 어떤 것이 있나요?</h4>
            <p className="text-[var(--neutral-700)]">
              신용카드, 체크카드, 간편결제 등 다양한 결제 방법을 지원합니다.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 