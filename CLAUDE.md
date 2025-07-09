# CLAUDE.md

DevMatch - AI 기반 팀 빌딩 플랫폼 (Next.js 15 + TypeScript + Vercel AI SDK)

## 프로젝트 개요
AI의 도움을 받아 최적의 개발 팀을 구성하는 플랫폼입니다. 사용자가 프로젝트를 생성하면 AI가 팀원 매칭, 역할 분담, 면접 등을 지원합니다.

## ⚠️ **개발 수칙 & 오류 방지 가이드**

### **🔧 기술 스택별 주의사항**

#### **Next.js 15 (App Router)**
- ✅ **DO**: `"use client"`를 상태/이벤트 핸들러 사용 컴포넌트에만 추가
- ✅ **DO**: API 라우트는 `route.ts` 파일명 사용 (page.tsx 아님)
- ✅ **DO**: 동적 라우팅은 `[param]` 폴더 구조 사용
- ❌ **DON'T**: Server Component에서 `useState`, `useEffect` 사용 금지
- ❌ **DON'T**: `pages/` 디렉토리 혼용 금지 (App Router 전용)

#### **TypeScript**
- ✅ **DO**: 모든 props, 함수 파라미터 타입 정의 필수
- ✅ **DO**: `types/` 폴더의 공통 타입 사용 (중복 정의 금지)
- ✅ **DO**: API 응답은 반드시 `ApiResponse<T>` 타입 사용
- ❌ **DON'T**: `any` 타입 사용 금지 (불가피한 경우 `unknown` 사용)
- ❌ **DON'T**: 타입 단언(as) 남용 금지

#### **Prisma**
- ✅ **DO**: 스키마 변경 후 반드시 `pnpm prisma generate` 실행
- ✅ **DO**: 프로덕션 배포 전 `prisma migrate deploy` 실행
- ✅ **DO**: 관계형 데이터는 `include` 또는 `select` 명시
- ❌ **DON'T**: `prisma db push` 프로덕션 사용 금지
- ❌ **DON'T**: 트랜잭션 없이 관련 데이터 동시 수정 금지

#### **NextAuth.js**
- ✅ **DO**: 모든 보호된 라우트에 미들웨어 적용
- ✅ **DO**: `SessionProvider`로 전체 앱 wrapping 필수
- ✅ **DO**: 사용자 세션 확인 후 API 호출
- ❌ **DON'T**: 클라이언트에서 직접 토큰 관리 금지
- ❌ **DON'T**: 세션 없이 사용자 데이터 접근 금지

#### **Framer Motion**
- ✅ **DO**: 페이지 전환 시 일관된 애니메이션 패턴 사용
- ✅ **DO**: `variants` 객체로 애니메이션 관리
- ✅ **DO**: 성능을 위해 `layoutId` 적절히 활용
- ❌ **DON'T**: 과도한 애니메이션으로 성능 저하 금지
- ❌ **DON'T**: 애니메이션 중첩으로 인한 레이아웃 시프트 방지

#### **Tailwind CSS**
- ✅ **DO**: 일관된 spacing scale 사용 (4, 8, 16, 24...)
- ✅ **DO**: zinc 컬러 팔레트 통일 사용
- ✅ **DO**: 반응형 디자인 모바일 우선 (`md:`, `lg:`)
- ❌ **DON'T**: 인라인 스타일 또는 직접 CSS 사용 금지
- ❌ **DON'T**: 임의 값 남용 금지 (`w-[123px]`)

### **🛡️ 필수 검증 체크리스트**

#### **파일 생성/수정 전**
- [ ] 기존 컴포넌트 재사용 가능한지 확인
- [ ] 타입 정의 `types/` 폴더에 존재하는지 확인
- [ ] 유사한 기능 구현체 있는지 검색
- [ ] 디자인 시스템 일관성 확인

#### **API 구현 시**
- [ ] 인증 미들웨어 적용 여부 확인
- [ ] 요청 body 유효성 검증 (Zod 스키마)
- [ ] 에러 핸들링 및 표준 응답 형식 준수
- [ ] 데이터베이스 트랜잭션 필요 여부 확인

#### **컴포넌트 개발 시**
- [ ] Server/Client Component 구분 명확히
- [ ] props 타입 정의 완료
- [ ] 에러 바운더리 필요 여부 확인
- [ ] 접근성 (aria-\*) 속성 추가

#### **배포 전 최종 확인**
- [ ] TypeScript 컴파일 에러 없음
- [ ] 린트 에러 없음
- [ ] 빌드 성공 확인
- [ ] 환경 변수 설정 완료
- [ ] 
## 개발 명령어
- `pnpm dev` - 개발 서버 실행
- `pnpm build` - 빌드 
- `pnpm lint` - ESLint 검사
- `pnpm typecheck` - TypeScript 타입 검사

## 디자인 시스템

### 🎨 현재 디자인 방향성
- **다크 테마**: zinc-950 기반 배경, 모던한 느낌
- **Inter 폰트**: 전역 적용, 가독성 우선
- **Bento Grid**: 통일된 카드 레이아웃 시스템
- **Framer Motion**: 부드러운 애니메이션 전환
- **그라데이션**: 각 카드별 고유 색상 그라데이션

### 🛠️ 핵심 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **UI Library**: Radix UI, Lucide Icons
- **AI Integration**: Vercel AI SDK
- **Authentication**: NextAuth.js

### 📋 컴포넌트 패턴
- **BentoCard**: 모든 메인 기능을 카드 형태로 표현
- **BackgroundPaths**: 페이지별 일관된 애니메이션 배경
- **Motion Components**: 페이지 전환 시 부드러운 애니메이션
- **Responsive Design**: 모바일 우선 반응형 레이아웃

## 중요 컨벤션

### 1. 코드 품질
- **TypeScript 엄격 모드**: `any` 타입 지양
- **기존 패턴 준수**: 파일 수정 전 반드시 내용 확인
- **컴포넌트 재사용**: 기존 UI 컴포넌트 최대 활용
- **일관된 애니메이션**: Framer Motion variants 패턴 사용

### 2. 스타일링
- **Tailwind CSS Only**: 직접 CSS 작성 금지
- **Consistent Spacing**: 정해진 spacing scale 준수
- **Color System**: zinc 계열 색상 팔레트 사용
- **Typography**: Inter 폰트 + 일관된 크기 체계

### 3. 성능 최적화
- **Image Optimization**: Next.js Image 컴포넌트 사용
- **Code Splitting**: 동적 import 적극 활용
- **Bundle Analysis**: 불필요한 의존성 제거
- **Accessibility**: ARIA 속성 및 키보드 네비게이션

## 환경변수 설정
```env
# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."

# AI API (선택사항)
OPENAI_API_KEY="..."
OPENROUTER_API_KEY="..."
```

이 문서는 DevMatch 프로젝트의 현재 상태와 개발 방향을 정리한 것입니다. 
모든 구현은 실제 서비스 배포 수준의 품질을 목표로 합니다.