# 암기훈련소 웹뷰 앱

이 프로젝트는 Capacitor를 사용하여 웹사이트를 안드로이드 앱으로 감싸는 단순한 웹뷰 앱입니다.

## 주요 특징

- **단순한 웹뷰**: `https://memorygym2.vercel.app` URL을 안드로이드 앱으로 감쌈
- **최적화된 성능**: 웹뷰 설정 최적화로 빠른 로딩
- **네이티브 느낌**: 스플래시 스크린과 앱 아이콘 포함
- **세로 모드 고정**: 모바일 최적화를 위한 세로 모드 고정

## 빌드 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 웹 앱 빌드 및 동기화
```bash
npm run cap:build
```

### 3. 안드로이드 스튜디오에서 열기
```bash
npm run cap:android
```

### 4. 안드로이드 기기에서 직접 실행
```bash
npm run cap:run:android
```

## 설정 파일

### capacitor.config.ts
- 앱 ID: `com.memorygym.flashcards`
- 앱 이름: `암기훈련소`
- 웹 URL: `https://memorygym2.vercel.app`

### MainActivity.java
- 웹뷰 최적화 설정
- 캐시 및 저장소 활성화
- 줌 기능 비활성화

## URL 변경하기

다른 웹사이트를 감싸고 싶다면 `capacitor.config.ts` 파일의 `server.url`을 수정하세요:

```typescript
server: {
  url: 'https://your-website.com',
  cleartext: true,
  androidScheme: 'https'
}
```

## 앱 정보 변경하기

앱 이름이나 패키지명을 변경하려면:

1. `capacitor.config.ts`에서 `appId`와 `appName` 수정
2. `android/app/build.gradle`에서 `applicationId` 수정
3. `android/app/src/main/AndroidManifest.xml`에서 패키지명 수정

## 문제 해결

### 웹뷰가 로드되지 않는 경우
1. 인터넷 연결 확인
2. URL이 HTTPS인지 확인
3. 안드로이드 매니페스트의 인터넷 권한 확인

### 빌드 오류가 발생하는 경우
1. `npm run build` 먼저 실행
2. `npx cap sync` 실행
3. 안드로이드 스튜디오에서 Clean Project 실행 