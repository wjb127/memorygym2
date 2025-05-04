# 포트원 V2 환경변수 설정 가이드

## 1. 환경변수 설정
다음 값을 `.env.local` 파일에 추가하세요:

```bash
# 포트원 V2 환경변수
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxx  # 포트원 관리자 콘솔에서 확인
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-key-xxx  # 채널 설정에서 확인
PORTONE_API_KEY=xxx  # API 키
PORTONE_SECRET_KEY=xxx  # 시크릿 키
```

## 2. KG이니시스 채널 설정 방법

1. **포트원 관리자 콘솔 로그인**:
   - [포트원 관리자 콘솔](https://admin.portone.io)에 로그인합니다.

2. **채널 생성**:
   - 결제 연동 > 채널 관리 메뉴로 이동
   - '+ 채널 추가' 버튼 클릭
   - PG사로 '이니시스' 선택 (KG이니시스)

3. **테스트 모드 설정**:
   - 테스트 환경에서는 '테스트 모드'를 활성화
   - 실제 운영 시에는 비활성화하고 실제 상점 정보 입력

4. **채널 정보 확인**:
   - 채널 생성 후 '채널 키' 복사 (`NEXT_PUBLIC_PORTONE_CHANNEL_KEY`에 설정)
   - 관리자 콘솔 왼쪽 메뉴에서 '내 식별코드, API keys'로 이동하여 Store ID 확인 (`NEXT_PUBLIC_PORTONE_STORE_ID`에 설정)

5. **API 키 생성**:
   - '내 식별코드, API keys' 메뉴에서 'API Key 생성' 버튼 클릭
   - 생성된 API Key와 Secret Key를 `.env.local` 파일에 설정

## 3. 테스트 카드 정보

KG이니시스 테스트 환경에서 결제 테스트 시 사용할 수 있는 카드 정보:

- **카드번호**: 4064-9380-0178-9815 (국민카드 테스트용)
- **유효기간**: 현재 월/년 이후로 설정 (예: 12/25)
- **생년월일/사업자번호**: 940101 (개인) 또는 사업자번호
- **카드 비밀번호**: 앞 2자리 (예: 00)

## 4. 서버 검증 엔드포인트 확인

결제 성공 후 서버에서 검증하는 엔드포인트가 올바르게 설정되어 있는지 확인:

- `/api/payment/verify` - 서버 측 결제 검증 API
- 환경변수 `PORTONE_API_KEY`와 `PORTONE_SECRET_KEY`가 올바르게 설정되어 있어야 함
