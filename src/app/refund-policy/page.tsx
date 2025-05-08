import LegalPageLayout from '@/components/LegalPageLayout';

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout title="환불 정책" description="암기훈련소 서비스의 환불 정책입니다">
      <div className="space-y-8">
        <section>
          <p className="mb-4">
            주식회사 메모리짐(이하 '회사')은 이용자의 권익을 보호하고 서비스 이용 관련 분쟁을 원활하게 해결하기 위해 다음과 같이 환불 정책을 운영하고 있습니다. 본 환불 정책은 암기훈련소 서비스의 유료 서비스 이용과 관련된 환불 및 취소에 대한 기준과 절차를 설명합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-1">1. 환불 조건</h2>
          
          <h3 className="font-semibold mt-4 mb-2">가. 서비스 결제 후 7일 이내 청약철회</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>서비스 결제 후 7일 이내에 청약철회를 요청하는 경우, 전액 환불이 가능합니다.</li>
            <li>단, 서비스 이용 기록이 있는 경우(콘텐츠 다운로드, 스트리밍 등), 해당 서비스의 이용 정도에 따라 일부 금액이 공제될 수 있습니다.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">나. 서비스 결제 후 7일 초과 30일 이내 청약철회</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>서비스 결제 후 7일 초과 30일 이내에 청약철회를 요청하는 경우, 이용 일수에 해당하는 금액을 제외한 나머지 금액을 환불합니다.</li>
            <li>환불 금액 = 결제 금액 - (결제 금액 × 이용 일수 / 전체 이용 가능 일수)</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">다. 서비스 결제 후 30일 초과 청약철회</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>서비스 결제 후 30일이 초과한 경우, 원칙적으로 환불이 불가능합니다.</li>
            <li>단, 회사의 귀책사유로 인해 서비스 이용이 불가능한 경우, 이용하지 못한 기간에 대해 일할 계산하여 환불합니다.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">라. 정기 구독 서비스</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>정기 구독 서비스의 경우, 구독 취소 시점 이후의 미사용 기간에 대한 금액을 일할 계산하여 환불합니다.</li>
            <li>구독 취소 후 다음 결제 예정일에 자동으로 갱신되지 않습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-2">2. 환불 제외 사항</h2>
          
          <p className="mb-4">
            다음의 경우에는 환불이 제한될 수 있습니다.
          </p>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>이용자의 귀책사유로 인한 서비스 이용 장애가 발생한 경우</li>
            <li>프로모션이나 이벤트로 무료 또는 할인 제공된 서비스의 경우</li>
            <li>이용자가 본 약관을 위반하여 서비스 이용이 제한된 경우</li>
            <li>서비스 결제 시 환불 불가 조건을 명시하고 이용자가 이에 동의한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-3">3. 환불 절차</h2>
          
          <h3 className="font-semibold mt-4 mb-2">가. 환불 신청 방법</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>서비스 내 '마이페이지' {'>'} '결제 내역' 메뉴에서 환불 신청 버튼을 클릭하여 신청</li>
            <li>고객센터 이메일(support@memorygym.co.kr) 또는 전화(02-123-4567)로 환불 요청</li>
            <li>환불 신청 시 결제 정보와 환불 사유를 함께 제출해주셔야 합니다.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">나. 환불 처리 기간</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>환불 신청이 접수된 날로부터 영업일 기준 3~5일 이내에 처리됩니다.</li>
            <li>신용카드 결제 취소의 경우, 카드사 사정에 따라 취소 처리가 완료되기까지 최대 7일이 소요될 수 있습니다.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">다. 환불 방법</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>결제 시 사용한 결제 수단으로 환불됩니다.</li>
            <li>카드 결제의 경우 카드 취소, 계좌이체의 경우 계좌 환불로 진행됩니다.</li>
            <li>결제 수단으로 환불이 불가능한 경우, 이용자의 계좌로 직접 환불될 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-4">4. 환불 관련 문의</h2>
          
          <p className="mb-4">
            환불 정책에 관한 문의사항이 있으시면 아래의 연락처로 문의해 주시기 바랍니다.
          </p>
          
          <ul className="list-disc ml-5 space-y-1">
            <li>이메일: support@memorygym.co.kr</li>
            <li>전화: 02-123-4567 (평일 10:00 ~ 18:00, 점심시간 12:30 ~ 13:30, 주말/공휴일 휴무)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-5">5. 환불 정책 변경</h2>
          
          <p className="mb-4">
            본 환불 정책은 2023년 1월 1일부터 시행됩니다. 회사는 필요한 경우 환불 정책을 변경할 수 있으며, 변경된 환불 정책은 서비스 내 공지사항을 통해 공지합니다. 변경된 환불 정책은 공지일로부터 7일 후부터 효력이 발생합니다.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
} 