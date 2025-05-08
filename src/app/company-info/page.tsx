import LegalPageLayout from '@/components/LegalPageLayout';

export default function CompanyInfoPage() {
  return (
    <LegalPageLayout title="회사 정보" description="암기훈련소 서비스 제공 회사 정보입니다">
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-tl-md">회사명</th>
                <td className="py-3 px-4 rounded-tr-md">앱돌이공장</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">대표자명</th>
                <td className="py-3 px-4">위승빈</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">사업자등록번호</th>
                <td className="py-3 px-4">850-06-03291</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">통신판매업신고번호</th>
                <td className="py-3 px-4">제2025-서울마포-0692호</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">설립일</th>
                <td className="py-3 px-4">2025년 2월 24일</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-bl-md">사업의 종류</th>
                <td className="py-3 px-4 rounded-br-md">정보통신업, 교육서비스업</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">연락처 정보</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-tl-md">주소</th>
                <td className="py-3 px-4 rounded-tr-md">서울특별시 월드컵북로44길 72</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">대표 전화</th>
                <td className="py-3 px-4">010-5056-8463</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">이메일</th>
                <td className="py-3 px-4">wjb127@naver.com</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-bl-md">고객센터 운영시간</th>
                <td className="py-3 px-4 rounded-br-md">평일 10:00 ~ 18:00 (점심시간 12:30 ~ 13:30, 주말/공휴일 휴무)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">서비스 정보</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-tl-md">서비스명</th>
                <td className="py-3 px-4 rounded-tr-md">암기훈련소</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3">서비스 웹사이트</th>
                <td className="py-3 px-4">https://memorygym.co.kr</td>
              </tr>
              <tr className="border-b border-[var(--neutral-300)]">
                <th className="py-3 px-4 text-left bg-[var(--neutral-200)] w-1/3 rounded-bl-md">호스팅 서비스 제공자</th>
                <td className="py-3 px-4 rounded-br-md">Supabase</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </LegalPageLayout>
  );
} 