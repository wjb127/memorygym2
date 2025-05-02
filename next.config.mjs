/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 프로덕션 빌드 중에 ESLint 검사 건너뛰기 (경고가 있어도 빌드 진행)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; 