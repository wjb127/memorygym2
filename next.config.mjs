/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 프로덕션 빌드 중에 ESLint 검사 건너뛰기 (경고가 있어도 빌드 진행)
    ignoreDuringBuilds: true,
  },
  // Vercel 우측 툴바 비활성화
  env: {
    NEXT_PUBLIC_SHOW_VERCEL_TOOLBAR: "false",
  },
};

export default nextConfig; 