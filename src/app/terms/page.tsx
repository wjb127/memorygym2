'use client';

import { useState } from 'react';
import LegalPageLayout from '@/components/LegalPageLayout';

export default function TermsPage() {
  const [agreed, setAgreed] = useState(false);
  
  return (
    <LegalPageLayout title="이용약관" description="암기훈련소 서비스 이용약관입니다">
      <div className="space-y-8">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold" id="section-1">제1장 총칙</h2>
          
          <article className="ml-4 space-y-4">
            <div>
              <h3 className="font-semibold" id="article-1">제1조 (목적)</h3>
              <p className="mt-2">
                이 약관은 주식회사 메모리짐(이하 "회사")이 제공하는 암기훈련소 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold" id="article-2">제2조 (정의)</h3>
              <p className="mt-2">
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </p>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>"서비스"란 회사가 제공하는 암기훈련소 온라인 학습 플랫폼 서비스를 말합니다.</li>
                <li>"이용자"란 회사의 서비스에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>"비회원"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                <li>"콘텐츠"란 회사가 제공하는 학습 자료, 문제, 강의 등 서비스에서 이용 가능한 모든 종류의 자료를 말합니다.</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold" id="article-3">제3조 (약관의 게시와 개정)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면이나 연결화면을 통하여 게시합니다.</li>
                <li>회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리한 약관의 개정의 경우에는 30일 이전부터 공지하며, 이메일 등 전자적 수단을 통해 이용자에게 개별 통지합니다.</li>
                <li>이용자는 개정된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 개정된 약관의 효력 발생일 이후에도 서비스를 계속 사용할 경우 약관의 변경사항에 동의한 것으로 간주됩니다.</li>
              </ol>
            </div>
          </article>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold" id="section-2">제2장 서비스 이용</h2>
          
          <article className="ml-4 space-y-4">
            <div>
              <h3 className="font-semibold" id="article-4">제4조 (서비스의 제공)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사는 다음과 같은 서비스를 제공합니다.
                  <ul className="list-disc ml-5 mt-1">
                    <li>암기 학습 콘텐츠 제공 서비스</li>
                    <li>플래시카드 학습 서비스</li>
                    <li>학습 관리 및 진도 추적 서비스</li>
                    <li>맞춤형 학습 추천 서비스</li>
                    <li>기타 회사가 정하는 서비스</li>
                  </ul>
                </li>
                <li>회사는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
                <li>회사는 이용자의 개인정보 및 서비스 이용 기록을 활용하여 맞춤형 서비스를 제공할 수 있습니다.</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold" id="article-5">제5조 (서비스의 중단)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.</li>
                <li>사업종목의 전환, 사업의 포기, 업체 간의 통합 등의 이유로 서비스를 제공할 수 없게 되는 경우에는 회사는 제8조에 정한 방법으로 이용자에게 통지하고 당초 회사에서 제시한 조건에 따라 소비자에게 보상합니다.</li>
              </ol>
            </div>
          </article>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold" id="section-3">제3장 의무 및 책임</h2>
          
          <article className="ml-4 space-y-4">
            <div>
              <h3 className="font-semibold" id="article-6">제6조 (회사의 의무)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하는데 최선을 다하여야 합니다.</li>
                <li>회사는 이용자가 안전하게 서비스를 이용할 수 있도록 이용자의 개인정보(신용정보 포함)보호를 위한 보안 시스템을 갖추어야 합니다.</li>
                <li>회사는 이용자가 원하지 않는 영리목적의 광고성 전자우편을 발송하지 않습니다.</li>
                <li>회사는 이용자로부터 제기된 의견이나 불만이 정당하다고 인정할 경우에는 이를 처리하여야 합니다. 이용자가 제기한 의견이나 불만사항에 대해서는 게시판을 활용하거나 전자우편 등을 통하여 이용자에게 처리과정 및 결과를 전달합니다.</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold" id="article-7">제7조 (이용자의 의무)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>이용자는 다음 행위를 하여서는 안 됩니다.
                  <ul className="list-disc ml-5 mt-1">
                    <li>신청 또는 변경 시 허위 내용의 등록</li>
                    <li>타인의 정보 도용</li>
                    <li>회사가 게시한 정보의 변경</li>
                    <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                    <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                    <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                    <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                    <li>기타 불법적이거나 부당한 행위</li>
                  </ul>
                </li>
                <li>이용자는 관계법령, 이 약관의 규정, 이용안내 및 서비스와 관련하여 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 하며, 기타 회사의 업무에 방해되는 행위를 하여서는 안 됩니다.</li>
              </ol>
            </div>
          </article>
        </section>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold" id="section-4">제4장 기타</h2>
          
          <article className="ml-4 space-y-4">
            <div>
              <h3 className="font-semibold" id="article-8">제8조 (분쟁해결)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
                <li>회사는 이용자로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 이용자에게 그 사유와 처리일정을 통보해 드립니다.</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-semibold" id="article-9">제9조 (준거법 및 관할법원)</h3>
              <ol className="list-decimal ml-5 mt-2 space-y-2">
                <li>회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.</li>
                <li>회사와 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.</li>
              </ol>
            </div>
          </article>
        </section>
        
        <div className="mt-10 pt-6 border-t border-[var(--neutral-300)]">
          <p className="text-center text-sm text-[var(--neutral-700)]">
            본 약관은 2023년 1월 1일부터 시행합니다.
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-[var(--neutral-200)] rounded-md">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="agree-terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="agree-terms" className="text-sm font-medium">
              위 이용약관을 모두 읽었으며 이에 동의합니다.
            </label>
          </div>
          
          {agreed ? (
            <p className="mt-3 text-sm text-[var(--primary)]">이용약관에 동의해주셔서 감사합니다.</p>
          ) : (
            <p className="mt-3 text-sm text-[var(--neutral-700)]">서비스를 이용하시려면 이용약관에 동의해주세요.</p>
          )}
        </div>
      </div>
    </LegalPageLayout>
  );
} 