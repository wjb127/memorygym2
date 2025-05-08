import LegalPageLayout from '@/components/LegalPageLayout';

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="개인정보 처리방침" description="암기훈련소 서비스의 개인정보 처리방침입니다">
      <div className="space-y-8">
        <section>
          <p className="mb-4">
            주식회사 메모리짐(이하 '회사')은 이용자의 개인정보를 중요시하며, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」, 「개인정보 보호법」 등 관련 법령을 준수하기 위하여 노력하고 있습니다. 회사는 개인정보 처리방침을 통하여 회사가 이용자로부터 수집하는 개인정보의 항목, 개인정보의 수집 및 이용목적, 개인정보의 보유 및 이용기간, 개인정보의 제3자 제공 및 취급위탁에 관한 사항을 알려드립니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-1">1. 수집하는 개인정보 항목 및 수집방법</h2>
          
          <h3 className="font-semibold mt-4 mb-2">가. 수집하는 개인정보 항목</h3>
          <ul className="list-disc ml-5 space-y-2">
            <li>
              <span className="font-medium">회원가입 시</span>
              <ul className="list-disc ml-5 mt-1">
                <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
                <li>선택항목: 프로필 이미지, 학습 관심 분야</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">소셜 계정을 통한 회원가입 시</span>
              <ul className="list-disc ml-5 mt-1">
                <li>필수항목: 소셜 계정 정보(이메일, 이름), 서비스 이용 기록</li>
                <li>선택항목: 프로필 이미지</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">서비스 이용 과정에서 생성되는 정보</span>
              <ul className="list-disc ml-5 mt-1">
                <li>IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 학습 데이터, 결제 기록</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">유료 서비스 이용 시</span>
              <ul className="list-disc ml-5 mt-1">
                <li>결제 정보(카드사명, 카드번호 등 결제 수단 정보), 결제 내역</li>
              </ul>
            </li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">나. 개인정보 수집방법</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>홈페이지 회원가입, 소셜 계정 연동, 서비스 이용 과정에서 이용자의 자발적 제공</li>
            <li>생성정보 수집 툴을 통한 자동 수집</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-2">2. 개인정보의 수집 및 이용목적</h2>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>
              <span className="font-medium">서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</span>
              <ul className="list-disc ml-5 mt-1">
                <li>콘텐츠 제공, 특정 맞춤 서비스 제공, 물품배송 또는 청구서 등 발송, 본인인증, 구매 및 요금 결제, 요금추심</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">회원 관리</span>
              <ul className="list-disc ml-5 mt-1">
                <li>회원제 서비스 제공, 개인식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 가입 및 가입횟수 제한, 분쟁 조정을 위한 기록보존, 불만처리 등 민원처리, 고지사항 전달</li>
              </ul>
            </li>
            <li>
              <span className="font-medium">신규 서비스 개발 및 마케팅·광고에의 활용</span>
              <ul className="list-disc ml-5 mt-1">
                <li>신규 서비스 개발 및 맞춤 서비스 제공, 통계학적 특성에 따른 서비스 제공 및 광고 게재, 서비스의 유효성 확인, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 접속빈도 파악, 회원의 서비스이용에 대한 통계</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-3">3. 개인정보의 보유 및 이용기간</h2>
          
          <p className="mb-4">
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">가. 회사 내부 방침에 의한 정보보유 사유</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>부정이용기록 : 1년</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">나. 관련법령에 의한 정보보유 사유</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>계약 또는 청약철회 등에 관한 기록 : 5년 (전자상거래등에서의 소비자보호에 관한 법률)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년 (전자상거래등에서의 소비자보호에 관한 법률)</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년 (전자상거래등에서의 소비자보호에 관한 법률)</li>
            <li>로그인 기록 : 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-4">4. 개인정보의 파기절차 및 방법</h2>
          
          <p className="mb-4">
            회사는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체없이 파기합니다. 파기절차 및 방법은 다음과 같습니다.
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">가. 파기절차</h3>
          <p className="ml-5">
            이용자가 회원가입 등을 위해 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용기간 참조) 일정 기간 저장된 후 파기됩니다. 별도 DB로 옮겨진 개인정보는 법률에 의한 경우가 아니고서는 보유되는 이외의 다른 목적으로 이용되지 않습니다.
          </p>

          <h3 className="font-semibold mt-4 mb-2">나. 파기방법</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
            <li>종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-5">5. 개인정보 제3자 제공</h2>
          
          <p className="mb-4">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
          </p>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>이용자들이 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-6">6. 이용자 및 법정대리인의 권리와 그 행사방법</h2>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다.</li>
            <li>이용자의 개인정보 조회, 수정을 위해서는 '개인정보변경'(또는 '회원정보수정' 등)을, 가입해지(동의철회)를 위해서는 '회원탈퇴'를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.</li>
            <li>혹은 개인정보관리책임자에게 서면, 전화 또는 이메일로 연락하시면 지체없이 조치하겠습니다.</li>
            <li>이용자가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 당해 개인정보를 이용 또는 제공하지 않습니다. 또한 잘못된 개인정보를 제3자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 지체없이 통지하여 정정이 이루어지도록 하겠습니다.</li>
            <li>회사는 이용자의 요청에 의해 해지 또는 삭제된 개인정보는 "5. 개인정보의 보유 및 이용기간"에 명시된 바에 따라 처리하고 그 외의 용도로 열람 또는 이용할 수 없도록 처리하고 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-7">7. 개인정보 자동 수집 장치의 설치/운영 및 거부에 관한 사항</h2>
          
          <p className="mb-4">
            회사는 이용자의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등을 운용합니다. 쿠키란 회사의 웹사이트를 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 컴퓨터 하드디스크에 저장됩니다. 회사는 다음과 같은 목적을 위해 쿠키를 사용합니다.
          </p>
          
          <h3 className="font-semibold mt-4 mb-2">가. 쿠키의 사용 목적</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공</li>
            <li>이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.</li>
          </ul>

          <h3 className="font-semibold mt-4 mb-2">나. 쿠키 설정 거부 방법</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li>쿠키 설정을 거부하는 방법으로는 이용자가 사용하는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.</li>
            <li>설정방법 예(인터넷 익스플로러의 경우) : 웹 브라우저 상단의 도구 {'>'}  인터넷 옵션 {'>'}  개인정보</li>
            <li>단, 이용자가 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-8">8. 개인정보의 안전성 확보 조치</h2>
          
          <p className="mb-4">
            회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
          </p>
          
          <ul className="list-disc ml-5 space-y-2">
            <li>
              <span className="font-medium">개인정보 암호화</span>
              <p className="mt-1 ml-1">이용자의 개인정보는 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일 잠금 기능을 사용하는 등의 별도 보안기능을 사용하고 있습니다.</p>
            </li>
            <li>
              <span className="font-medium">해킹 등에 대비한 기술적 대책</span>
              <p className="mt-1 ml-1">회사는 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</p>
            </li>
            <li>
              <span className="font-medium">개인정보에 대한 접근 제한</span>
              <p className="mt-1 ml-1">개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</p>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-9">9. 개인정보 보호책임자</h2>
          
          <p className="mb-4">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          
          <div className="ml-5">
            <p><span className="font-medium">개인정보 보호책임자</span></p>
            <p className="ml-4">성명: 홍길동</p>
            <p className="ml-4">직책: 개인정보보호 책임자</p>
            <p className="ml-4">연락처: privacy@memorygym.co.kr, 02-123-4567</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4" id="section-10">10. 개인정보 처리방침 변경</h2>
          
          <p className="mb-4">
            이 개인정보 처리방침은 2023년 1월 1일부터 적용됩니다. 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
} 