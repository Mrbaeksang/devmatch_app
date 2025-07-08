# CLAUDE.md

DevMatch - AI 기반 팀 빌딩 플랫폼 (Next.js 15 + TypeScript + Vercel AI SDK)

## 프로젝트 개요
AI의 도움을 받아 최적의 개발 팀을 구성하는 플랫폼입니다. 사용자가 프로젝트를 생성하면 AI가 팀원 매칭, 역할 분담, 면접 등을 지원합니다.

## 개발 명령어
- `pnpm dev` - 개발 서버 실행
- `pnpm build` - 빌드 
- `pnpm lint` - ESLint 검사
- `pnpm typecheck` - TypeScript 타입 검사

## 현재 상태 (2025-01-08)
✅ **완료된 기능**:
- NextAuth.js 세션 관리 (Google/Kakao OAuth)
- FuzzyText 효과 랜딩 페이지
- BackgroundPaths 애니메이션 배경
- Bento Grid 레이아웃 시스템
- 프로젝트 대시보드 (/projects)
- 팀원 대기 페이지 (/projects/join/[inviteCode])
- Vercel AI SDK 기반 채팅 API

🔄 **진행 중**: UI 컴포넌트 통합 및 최적화
⏳ **대기**: 데이터베이스 연동, 실제 팀 매칭 로직

## 핵심 파일 구조

### UI 컴포넌트
- `components/ui/bento-grid.tsx` - 메인 카드 레이아웃 시스템
- `components/ui/background-paths.tsx` - 애니메이션 SVG 배경
- `components/ui/fuzzy-text.tsx` - 글리치 효과 텍스트
- `components/ui/auth-options-card.tsx` - 소셜 로그인 버튼
- `components/ui/shape-landing-hero.tsx` - 랜딩 페이지 메인 컴포넌트

### 페이지 컴포넌트
- `app/page.tsx` - 랜딩 페이지 (로그인 진입점)
- `app/projects/page.tsx` - 프로젝트 대시보드 (3개 메인 카드)
- `app/projects/new/page.tsx` - 새 프로젝트 생성
- `app/projects/join/[inviteCode]/page.tsx` - 팀원 대기 페이지
- `app/api/chat/route.ts` - AI 상담 API (Vercel AI SDK)

### 설정 파일
- `app/providers.tsx` - NextAuth SessionProvider 래퍼
- `app/layout.tsx` - 전역 레이아웃 및 폰트 설정
- `types/next-auth.d.ts` - NextAuth 타입 확장

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

## 우선순위 개발 계획

### 1단계 (즉시 구현 필요)
- **내 프로젝트 목록 페이지** (`/projects/my-projects`)
- **프로젝트 상세 페이지** (`/projects/[projectId]`)
- **팀 빌딩 결과 페이지** (`/projects/[projectId]/team-result`)

### 2단계 (단기 목표)
- **AI 면접 시스템** (`/projects/[projectId]/interview`)
- **사용자 프로필 관리** (`/profile`)
- **데이터베이스 스키마** (PostgreSQL + Prisma)

### 3단계 (중장기 목표)
- **실시간 팀 매칭** (WebSocket 연동)
- **프로젝트 관리 도구** (칸반 보드, 일정 관리)
- **커뮤니티 기능** (프로젝트 쇼케이스, 네트워킹)

## 학습 가이드
- 사용자가 단계별로 학습하면서 프로젝트 완성
- 각 구현 단계별 상세 설명 제공
- 실제 프로덕션 수준의 코드 품질 유지
- 최신 웹 개발 트렌드 및 베스트 프랙티스 적용

## 참고 자료
- **Next.js 15 문서**: App Router, Server Components
- **Vercel AI SDK**: 채팅 및 AI 통합
- **Framer Motion**: 애니메이션 구현
- **Tailwind CSS**: 스타일링 시스템
- **Radix UI**: 접근성 우선 컴포넌트

---

이 문서는 DevMatch 프로젝트의 현재 상태와 개발 방향을 정리한 것입니다. 
모든 구현은 실제 서비스 배포 수준의 품질을 목표로 합니다.