import LegalPageLayout from '@/components/LegalPageLayout';
import Link from 'next/link';

export default function ServicePage() {
  return (
    <LegalPageLayout title="서비스 안내" description="암기훈련소 서비스에 대한 안내입니다">
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-1">서비스 소개</h2>
          <p className="mb-4">
            암기훈련소는 과학적인 학습 방법인 '라이트너 시스템(Leitner System)'을 기반으로 한 플래시카드 학습 플랫폼입니다. 
            사용자는 암기가 필요한 내용을 플래시카드로 만들어 효율적으로 학습할 수 있으며, 시스템이 자동으로 복습 일정을 관리해줍니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🧠 과학적인 학습 방법</h3>
              <p>라이트너 시스템 기반의 간격 반복 학습으로 장기 기억 형성에 효과적입니다.</p>
            </div>
            <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📱 언제 어디서나</h3>
              <p>웹 브라우저를 통해 PC, 태블릿, 모바일 등 다양한 기기에서 이용 가능합니다.</p>
            </div>
            <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📊 학습 데이터 분석</h3>
              <p>학습 통계와 진도 추적을 통해 자신의 학습 상태를 한눈에 파악할 수 있습니다.</p>
            </div>
            <div className="bg-[var(--neutral-200)] p-4 rounded-lg">
              <h3 className="font-semibold mb-2">👥 공유 및 협업</h3>
              <p>학습 자료를 다른 사용자와 공유하고 함께 학습할 수 있습니다.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-2">이용 방법</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-[var(--primary)] pl-4">
              <h3 className="font-semibold mb-2">1. 회원가입</h3>
              <p>이메일 또는 소셜 계정으로 간편하게 가입하세요.</p>
            </div>
            
            <div className="border-l-4 border-[var(--primary)] pl-4">
              <h3 className="font-semibold mb-2">2. 플래시카드 생성</h3>
              <p>암기하고 싶은 내용을 질문과 답변 형태로 카드에 입력하세요. 텍스트뿐만 아니라 이미지도 추가할 수 있습니다.</p>
            </div>
            
            <div className="border-l-4 border-[var(--primary)] pl-4">
              <h3 className="font-semibold mb-2">3. 학습 시작</h3>
              <p>생성한 카드로 학습을 시작하세요. 카드의 질문을 보고 답을 생각한 후, 카드를 클릭하여 정답을 확인합니다.</p>
            </div>
            
            <div className="border-l-4 border-[var(--primary)] pl-4">
              <h3 className="font-semibold mb-2">4. 난이도 평가</h3>
              <p>답을 확인한 후, 자신이 얼마나 잘 알고 있는지 평가하세요. 이 평가에 따라 다음 복습 일정이 결정됩니다.</p>
            </div>
            
            <div className="border-l-4 border-[var(--primary)] pl-4">
              <h3 className="font-semibold mb-2">5. 복습</h3>
              <p>시스템이 제안하는 최적의 시간에 복습을 진행하세요. 잘 알고 있는 카드는 점점 더 긴 간격으로, 어려운 카드는 더 자주 복습하게 됩니다.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-3">서비스 플랜</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div className="border border-[var(--neutral-300)] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">무료 플랜</h3>
                <span className="text-lg font-bold">₩0</span>
              </div>
              <ul className="list-disc ml-5 space-y-2 mb-6">
                <li>최대 100개의 플래시카드 생성</li>
                <li>기본 학습 통계</li>
                <li>텍스트 카드 지원</li>
                <li>광고 포함</li>
              </ul>
              <div className="mt-auto">
                <Link href="/signup" className="block text-center py-2 px-4 bg-[var(--neutral-200)] hover:bg-[var(--neutral-300)] rounded-md transition-colors">
                  무료로 시작하기
                </Link>
              </div>
            </div>
            
            <div className="border-2 border-[var(--primary)] rounded-lg p-6 relative">
              <div className="absolute top-0 right-0 bg-[var(--primary)] text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                인기
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">프리미엄 플랜</h3>
                <div className="text-right">
                  <span className="text-lg font-bold">₩9,900</span>
                  <span className="text-sm text-[var(--neutral-700)]">/월</span>
                </div>
              </div>
              <ul className="list-disc ml-5 space-y-2 mb-6">
                <li>무제한 플래시카드 생성</li>
                <li>고급 학습 분석 및 통계</li>
                <li>이미지, 오디오 카드 지원</li>
                <li>광고 없음</li>
                <li>우선 고객 지원</li>
                <li>다양한 학습 템플릿 제공</li>
                <li>CSV/Excel 가져오기/내보내기</li>
              </ul>
              <div className="mt-auto">
                <Link href="/premium" className="block text-center py-2 px-4 bg-[var(--primary)] text-white hover:bg-opacity-90 rounded-md transition-colors">
                  프리미엄 시작하기
                </Link>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-[var(--neutral-700)] text-center">
            모든 결제는 월 단위로 진행되며, 언제든지 취소할 수 있습니다. 자세한 내용은 <Link href="/refund-policy" className="text-[var(--primary)] hover:underline">환불 정책</Link>을 참고하세요.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-4">자주 묻는 질문 (FAQ)</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Q: 암기훈련소는 어떤 학습 방법을 사용하나요?</h3>
              <p className="pl-4">
                A: 암기훈련소는 '라이트너 시스템(Leitner System)'이라는 과학적인 학습 방법을 기반으로 합니다. 
                이 방법은 간격 반복(Spaced Repetition)을 활용하여 기억 효율을 극대화합니다. 
                잘 알고 있는 내용은 점점 더 긴 간격으로 복습하고, 어려운 내용은 더 자주 복습함으로써 학습 효율을 높입니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Q: 무료 플랜과 프리미엄 플랜의 차이점은 무엇인가요?</h3>
              <p className="pl-4">
                A: 무료 플랜은 최대 100개의 플래시카드를 생성할 수 있으며 기본적인 학습 기능을 제공합니다. 
                프리미엄 플랜은 무제한 카드 생성, 고급 학습 분석, 이미지/오디오 카드 지원, 광고 제거, 다양한 학습 템플릿 등 더 많은 기능을 제공합니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Q: 암기훈련소는 어떤 기기에서 사용할 수 있나요?</h3>
              <p className="pl-4">
                A: 암기훈련소는 웹 기반 서비스로, 인터넷이 연결된 모든 기기(PC, 노트북, 태블릿, 스마트폰 등)에서 웹 브라우저를 통해 이용할 수 있습니다. 
                반응형 디자인으로 모든 화면 크기에 최적화되어 있습니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Q: 구독을 취소하면 어떻게 되나요?</h3>
              <p className="pl-4">
                A: 구독 취소 시, 현재 결제 기간이 끝날 때까지는 프리미엄 기능을 계속 사용할 수 있습니다. 
                결제 기간이 종료된 후에는 무료 플랜으로 전환되며, 이 경우 100개 이상의 카드를 추가로 생성할 수 없지만 기존에 생성한 모든 카드는 계속 볼 수 있습니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Q: 다른 사용자와 학습 자료를 공유할 수 있나요?</h3>
              <p className="pl-4">
                A: 네, 프리미엄 플랜에서는 학습 자료를 다른 사용자와 공유하고 협업할 수 있는 기능을 제공합니다. 
                공유 링크를 통해 특정 카드 세트를 다른 사용자에게 공유하거나, 공개 라이브러리에 등록하여 모든 사용자가 이용할 수 있게 할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-5">고객 지원</h2>
          
          <p className="mb-4">
            서비스 이용 중 문의사항이 있으시면 아래의 방법으로 연락해 주세요.
          </p>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>이메일: wjb127@naver.com</li>
            <li>전화: 010-5056-8463 (평일 10:00 ~ 18:00, 점심시간 12:30 ~ 13:30, 주말/공휴일 휴무)</li>
            <li>서비스 내 '피드백' 버튼을 통한 문의</li>
          </ul>
          
          <p className="mt-4">
            프리미엄 사용자는 우선 응대 서비스를 제공받으며, 24시간 이내에 답변을 드리기 위해 노력하고 있습니다.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
} 