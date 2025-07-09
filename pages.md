# 📋 DevMatch 프로젝트 구조 문서

## 🏗️ 전체 아키텍처 개요

DevMatch는 AI 기반 팀 빌딩 플랫폼으로, **상담 → 모집 → 면담 → 분석 → 프로젝트 시작**의 체계적인 플로우를 제공합니다.

### 핵심 기술 스택
- **Next.js 15** (App Router) + **TypeScript** + **Prisma** + **NextAuth.js**
- **AI**: OpenRouter API (DeepSeek 모델)
- **UI**: Tailwind CSS + Radix UI + Framer Motion

---

## 📁 App 디렉토리 구조

### 🏠 메인 페이지들
```
app/
├── page.tsx                    # 홈페이지 (로그인 전 랜딩)
├── projects/
│   ├── page.tsx               # 메인 대시보드 (BentoGrid)
│   ├── new/
│   │   └── page.tsx           # AI 프로젝트 상담 페이지
│   ├── join/
│   │   └── [inviteCode]/
│   │       └── page.tsx       # 팀원 모집 대기실
│   └── [projectId]/
│       ├── page.tsx           # 프로젝트 상세 페이지
│       ├── interview/
│       │   └── page.tsx       # 개인 면담 페이지
│       └── analysis/
│           └── page.tsx       # 팀 분석 결과 페이지
└── layout.tsx                 # 루트 레이아웃
```

### 🔌 API 라우트들
```
app/api/
├── auth/[...nextauth]/route.ts    # NextAuth 인증
├── chat/route.ts                  # AI 상담 채팅 API
├── projects/
│   ├── route.ts                   # 프로젝트 CRUD
│   ├── initial-setup/route.ts     # 프로젝트 초기 설정
│   ├── join/[inviteCode]/route.ts # 팀 참여 API
│   └── [projectId]/
│       ├── route.ts               # 개별 프로젝트 API
│       ├── analyze/route.ts       # 팀 분석 API
│       └── start/route.ts         # 프로젝트 시작 API
└── interview/
    ├── route.ts                   # 면담 진행 API
    └── complete/route.ts          # 면담 완료 API
```

---

## 🎯 핵심 기능별 상세 분석

### 1. 프로젝트 생성 플로우 (`/projects/new`)
**파일**: `app/projects/new/page.tsx`

**주요 기능**:
- 8단계 AI 상담 진행 (이름 → 프로젝트 정보 → 역할 제안)
- 실시간 채팅 UI (ExpandableChat)
- 역할 제안 승인/수정 시스템
- 상담 완료 시 프로젝트 생성 모달

**데이터 플로우**:
```
page.tsx → api/chat/route.ts → OpenRouter API → ConsultationData 수집
         → api/projects/initial-setup/route.ts → ProjectBlueprint 생성
         → prisma/db → 프로젝트 생성 완료
```

**핵심 타입**:
- `ConsultationStep` - 상담 단계 (types/chat.ts)
- `ConsultationData` - 수집된 상담 데이터 (types/chat.ts)
- `ProjectBlueprint` - 변환된 프로젝트 설계서 (types/project.ts)

### 2. 팀원 모집 플로우 (`/projects/join/[inviteCode]`)
**파일**: `app/projects/join/[inviteCode]/page.tsx`

**주요 기능**:
- 초대 코드 기반 프로젝트 접근
- 실시간 팀원 현황 업데이트 (5초 폴링)
- 상담 완료 여부 체크
- 면담 시작 버튼 활성화

**데이터 플로우**:
```
page.tsx → api/projects/join/[inviteCode]/route.ts (GET) → 프로젝트 정보 조회
         → api/projects/join/[inviteCode]/route.ts (POST) → 팀원 참여
         → 실시간 업데이트 → 면담 단계 진행
```

### 3. 개인 면담 플로우 (`/projects/[projectId]/interview`)
**파일**: `app/projects/[projectId]/interview/page.tsx`

**주요 기능**:
- AI 기반 개인 면담 진행
- 6단계 면담 (환영 → 기술평가 → 리더십평가 → 선호도수집 → 확인 → 완료)
- 4단계 리더십 레벨 평가
- MemberProfile 데이터 수집

**데이터 플로우**:
```
page.tsx → api/interview/route.ts → OpenRouter API → 면담 질문 생성
         → api/interview/complete/route.ts → MemberProfile 저장
         → InterviewStatus 업데이트
```

### 4. 팀 분석 플로우 (`/projects/[projectId]/analysis`)
**파일**: `app/projects/[projectId]/analysis/page.tsx`

**주요 기능**:
- AI 기반 팀 분석 실행
- 팀 매칭 점수 (0-100점)
- 리더십 분석 및 추천
- 역할 배정 알고리즘

**데이터 플로우**:
```
page.tsx → api/projects/[projectId]/analyze/route.ts → OpenRouter API
         → TeamAnalysis 생성 → RoleAssignment 배정
         → 프로젝트 상태 ACTIVE로 변경
```

---

## 🗂️ 핵심 디렉토리 상세

### 📚 lib/ 폴더
```
lib/
├── auth.ts          # NextAuth 설정 (Google, Kakao OAuth)
├── db.ts            # Prisma 클라이언트 (전역 인스턴스)
├── utils.ts         # 유틸리티 함수 (cn, clsx)
├── constants.ts     # 상수 정의
└── api-client.ts    # API 클라이언트 (fetch 래퍼)
```

### 🏷️ types/ 폴더
```
types/
├── project.ts       # 프로젝트 관련 타입
│   ├── ProjectStatus, InterviewStatus, InterviewPhase
│   ├── ProjectBlueprint, TeamAnalysis, MemberProfile
│   └── RoleAssignment, LeadershipAnalysis
├── chat.ts          # 채팅 및 상담 관련 타입
│   ├── ConsultationStep, ConsultationData
│   └── ChatMessage, AIResponse
├── api.ts           # API 응답 타입
├── user.ts          # 사용자 타입
└── next-auth.d.ts   # NextAuth 타입 확장
```

### 🧩 components/ 폴더
```
components/
├── ui/              # 공통 UI 컴포넌트 (shadcn/ui 기반)
│   ├── bento-grid.tsx       # 메인 대시보드 그리드
│   ├── background-paths.tsx # 배경 애니메이션
│   ├── expandable-chat.tsx  # 채팅 UI 컴포넌트
│   ├── chat-bubble.tsx      # 채팅 메시지 UI
│   ├── project-modal.tsx    # 프로젝트 생성 모달
│   ├── button.tsx           # 버튼 컴포넌트
│   ├── card.tsx             # 카드 컴포넌트
│   └── ... (기타 shadcn/ui 컴포넌트들)
├── common/          # 공통 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── LoadingSpinner.tsx
└── hooks/           # 커스텀 훅
    └── use-auto-scroll.ts
```

### 🗄️ prisma/ 폴더
```
prisma/
└── schema.prisma    # 데이터베이스 스키마
    ├── User, Project, ProjectMember
    ├── Account, Session (NextAuth)
    ├── InterviewQuestion, InterviewAnswer
    └── ChatMessage
```

---

## 🔄 데이터 플로우 상세

### 전체 사용자 여정
```
1. 홈페이지 (/) → 로그인 → 대시보드 (/projects)
2. 새 프로젝트 (/projects/new) → AI 상담 → 프로젝트 생성
3. 초대 링크 공유 → 대기실 (/projects/join/[code])
4. 팀원 참여 → 상담 완료 → 면담 시작
5. 개인 면담 (/projects/[id]/interview) → 면담 완료
6. 전체 면담 완료 → 팀 분석 (/projects/[id]/analysis)
7. 분석 완료 → 프로젝트 시작 (/projects/[id])
```

### 파일 간 주요 의존성
```
프론트엔드 페이지 → API 라우트 → lib/db → Prisma → Database
                → OpenRouter API (AI 기능)
                → lib/auth → NextAuth (인증)
                → types/* (타입 정의)
                → components/ui/* (UI 컴포넌트)
```

---

## 🚨 현재 알려진 문제점

### 1. 린트 에러 (총 41개)
- **any 타입 남용**: 17개 파일에서 타입 안정성 위반
- **unused vars**: 컴포넌트 임포트 후 미사용
- **empty interface**: 불필요한 인터페이스 정의

### 2. 런타임 에러
- `consultationData.techStack.map is not a function` - 배열/문자열 타입 충돌
- 데이터베이스 스키마와 코드 간 불일치

### 3. AI 로직 제어 문제
- OpenRouter API 응답 불안정
- 상담 단계 건너뛰기 현상
- 예기치 않은 AI 질문 (예: 예산 질문)

---

## 🎯 우선순위 수정 사항

### 즉시 수정 필요 (빌드 가능하게)
1. **린트 에러 일괄 수정** - any 타입 제거, unused vars 정리
2. **타입 안정성 확보** - 엄격한 타입 체크
3. **런타임 에러 수정** - techStack 배열 처리

### 아키텍처 개선
1. **AI 로직 안정화** - 상담 단계 강제 제어
2. **에러 바운더리** - 런타임 에러 처리
3. **API 에러 핸들링** - 통합된 에러 처리

---

## 📖 개발 가이드

### 개발 환경 설정
```bash
pnpm install          # 의존성 설치
pnpm dev              # 개발 서버 (localhost:3000)
pnpm build            # 프로덕션 빌드
pnpm lint             # 린트 검사
pnpm typecheck        # 타입 검사
```

### 주요 환경 변수
```env
NEXTAUTH_SECRET=      # NextAuth 시크릿
NEXTAUTH_URL=         # NextAuth URL
GOOGLE_CLIENT_ID=     # Google OAuth
GOOGLE_CLIENT_SECRET= # Google OAuth
KAKAO_CLIENT_ID=      # Kakao OAuth
KAKAO_CLIENT_SECRET=  # Kakao OAuth
OPENROUTER_API_KEY=   # AI API 키
DATABASE_URL=         # PostgreSQL 연결
```

---

**프로젝트 상태**: 핵심 기능 구현 완료, Phase D 테스트 및 안정성 개선 단계
**마지막 업데이트**: 2024-12-07
