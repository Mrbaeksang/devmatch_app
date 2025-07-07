# AI 팀 빌딩 매니저 프로젝트: 개발 가이드 (기본 정보)

## Part 1: 프로젝트 개요 및 기본 정보 (한 번만 읽으면 되는 정보)

### 1. 프로젝트 개요 및 목표

#### 1.1. 프로젝트 목표

-   **AI 기반 팀 빌딩 자동화**: 소규모 개발팀(특히 부트캠프)의 역할 분배 및 팀 빌딩 과정을 AI를 통해 자동화하고 최적화하는 웹 애플리케이션을 개발합니다.
-   **역량 분석 및 역할 추천**: AI가 대화형 설문을 통해 각 팀원의 역량, 경험, 협업 스타일을 분석하여 데이터 기반의 최적 역할을 추천합니다.
-   **통합 협업 환경 제공**: AI 챗봇 기반의 설문, 간편한 팀원 초대, 역할 추천 대시보드, 그리고 팀 전용 채팅방까지 원스톱으로 제공하여 성공적인 프로젝트 시작을 지원합니다.
-   **사용자 경험**: 직관적이고 간편한 사용성, 시각적으로 매력적인 UI/UX 제공을 최우선으로 합니다.

### 2. 전체 사용자 흐름 (UX 시나리오 v2.0 기반)

주인공: 부트캠프 동기들과 막 한 팀이 되어, 앞으로의 역할 분담이 막막하기만 한 주니어 개발자, "김초보"

#### 2.1. Phase 1: 프로젝트의 시작 - "우리 팀의 깃발을 꽂다"

1.  **첫 만남 (간편 로그인)**:
    *   김초보는 "AI 팀 빌딩 매니저" 웹사이트에 접속합니다.
    *   복잡한 회원가입 절차 없이, Google 또는 Kakao 로그인 버튼을 클릭하여 간편하게 로그인합니다.
    *   로그인 완료 후, "환영합니다, 김초보님!" 메시지와 함께 깔끔한 대시보드(`/projects`)로 자동 이동됩니다.
    *   **참고**: 로그인 및 회원가입 페이지는 이메일/비밀번호 입력 없이 Google 및 Kakao OAuth 버튼만 제공합니다.
    *   **예외**: 이미 회원이고 진행 중인 프로젝트가 있다면, `/projects` 페이지 대신 마지막으로 작업하던 프로젝트 상세 페이지(`/projects/[id]`)로 바로 이동합니다.

2.  **프로젝트 등록 (생성)**:
    *   로그인 후, 김초보를 위한 대시보드(`/projects`)에서 `[+ 새 프로젝트 시작하기]` 버튼을 클릭합니다.
    *   "프로젝트 이름"과 "이 프로젝트의 목표는 무엇인가요?"를 묻는 입력창에 정보를 입력합니다.
        *   **예시**: 이름: 팀 시너지 게시판, 목표: Spring Boot와 JPA, React를 사용하여 기본적인 CRUD 기능과 로그인 기능이 있는 게시판 웹사이트를 4주 안에 완성한다.
    *   `[우리 팀 프로젝트 등록하기]` 버튼을 클릭합니다.
    *   AI가 프로젝트 목표를 바탕으로 "이 프로젝트에 필요한 역할은 몇 개로 나눌까요? (예: 프론트엔드 1명, 백엔드 1명, 디자이너 1명)"와 같이 상세히 질문하고, 김초보의 대답을 바탕으로 프로젝트 역할을 확정합니다. 이 과정은 대화형으로 진행될 수 있습니다.
    *   잠시 로딩 스피너가 보인 후, "프로젝트가 성공적으로 생성되었습니다!"라는 토스트 메시지가 뜨고, 화면이 즉시 전환되어 "팀 시너지 게시판" 프로젝트만의 전용 상세 페이지(`/projects/[id]`)로 이동합니다.

3.  **우리 팀의 아지트 (프로젝트 상세 페이지)**:
    *   화면에는 프로젝트의 이름과 목표가 명확하게 표시됩니다.
    *   하단에는 팀원들을 맞이할 준비가 되어 있습니다.
    *   프로젝트 상세 페이지에는 `[프로젝트 종료]` 또는 `[프로젝트 나가기]` 버튼이 존재합니다.
    *   상단에는 현재 열려있는 프로젝트들을 탭 형태로 오갈 수 있는 UI가 제공되며, 각 탭에는 프로젝트 이름이 표시되어 쉽게 전환할 수 있습니다. 프로젝트 이름은 언제든지 변경 가능합니다.

#### 2.2. Phase 2: 팀원 소집 - "흩어진 동료들을 한 곳으로"

1.  **초대장 발송 (링크 생성 및 공유)**:
    *   프로젝트 상세 페이지의 `[팀원 초대하기]` 섹션에서 `[초대 링크 만들기]` 버튼을 클릭합니다.
    *   "24시간 동안 유효한 초대 링크가 생성되었습니다." 라는 안내와 함께, 복사하기 쉬운 URL이 나타납니다.
    *   김초보는 이 링크를 복사하여 팀원들에게 공유합니다.

2.  **팀원들의 합류 (로그인 우선 참여)**:
    *   팀원이 초대 링크를 클릭하면, "팀 시너지 게시판" 프로젝트에 초대되었다는 안내와 함께, Google/Kakao 로그인 버튼이 나타납니다.
    *   팀원은 간편하게 로그인합니다.
    *   로그인이 끝나자, "팀 시너지 게시판 프로젝트에 참여하시겠습니까?" 라는 최종 확인창이 뜨고, `[네, 참여할게요!]` 버튼을 클릭하여 참여합니다.
    *   참여가 완료되면, 팀원은 김초보와 똑같은 프로젝트 상세 페이지로 이동합니다.

3.  **실시간 현황판 (Live Update)**:
    *   김초보가 보고 있던 프로젝트 상세 페이지의 `[참여 팀원]` 목록에 변화가 실시간으로 반영됩니다.
    *   예: `[참여 인원: 1/5]` -> `[참여 인원: 2/5]` 로 숫자가 바뀌고, "팀원 A"의 프로필이 목록에 실시간으로 추가됩니다.

#### 2.3. Phase 3 & 4: AI와의 만남 그리고 한 팀으로

1.  **AI 1:1 인터뷰**:
    *   모든 팀원이 모이면, 각자 "AI 역량 진단"을 시작하여 자신의 기술과 경험에 대해 AI와 심층 대화를 나눕니다.
    *   AI는 프로젝트 생성 시 확정된 역할 분배 및 기술 스택 정보에 기반하여 필요한 질문만 합니다.

2.  **AI 역할 추천**:
    *   모든 인터뷰가 끝나면, 대시보드에서 AI가 데이터 기반으로 추천해준 각자의 최적 역할을 확인합니다.

3.  **진정한 팀의 시작**:
    *   역할이 확정된 팀은, 이제 이 서비스가 제공하는 팀 전용 채팅방에 모두 모여, 각자의 명확한 역할을 가지고 프로젝트의 첫 번째 업무를 논의하기 시작합니다.

### 3. 기술 스택

-   **Frontend & Backend**: Next.js (React, TypeScript)
    -   **API Routes**: 백엔드 API (인증, 프로젝트 관리, 팀원 관리, AI 인터뷰 데이터 처리 등) 구현에 사용됩니다.
    -   **Server Components**: 초기 로딩 성능 최적화 및 데이터 페칭에 사용됩니다.
    -   **Client Components**: 사용자 인터랙션 및 동적인 UI 처리에 사용됩니다.
-   **Database**: Neon (PostgreSQL)
    -   **ORM**: Prisma (Next.js와의 통합 용이성, 타입 안정성)를 사용하여 데이터베이스와 상호작용합니다.
    -   **데이터 모델**: 사용자, 프로젝트, 팀원, 초대 링크, AI 인터뷰 결과, 역할 추천 결과, 채팅 메시지 등을 관리합니다.
-   **AI/ML**: Google Gemini API (또는 유사 LLM)
    -   **역할**: 대화형 설문을 통한 역량 분석, 프로젝트 목표 기반 역할 추천, 팀원별 최적 역할 매칭에 활용됩니다.
    -   **구현 방식**: Next.js API Routes에서 Gemini API를 호출하고 데이터를 처리합니다.
-   **Authentication**: NextAuth.js
    -   **Provider**: Google OAuth, Kakao OAuth를 통해 간편 로그인을 구현합니다.
    -   **Session Management**: JWT 기반 세션 관리를 사용합니다.
-   **UI/UX Framework**: shadcn/ui (Tailwind CSS 기반)
    -   **디자인 시스템**: Google의 Material Design principles를 적용하여 일관되고 세련된 UI/UX를 제공합니다.
    -   **컴포넌트**: shadcn/ui 컴포넌트를 활용하여 빠르고 효율적으로 UI를 구축합니다.
    -   **커스텀 스타일링**: Tailwind CSS를 통해 세부적인 디자인 조정 및 커스터마이징을 수행합니다.
-   **Real-time Communication**: WebSocket (예: Socket.IO 또는 자체 구현)
    -   **용도**: 실시간 팀원 현황 업데이트 및 팀 전용 채팅방 기능 구현에 사용됩니다.

#### 3.1. 사장님을 위한 학습 가이드 (개발 지망생)

사장님께서 개발 지망생이시라는 점을 고려하여, 프로젝트에 사용되는 주요 기술 스택에 대한 학습 가이드를 제공합니다. 이 프로젝트를 진행하면서 아래 내용을 함께 학습하시면 Next.js, TypeScript 기반의 웹 개발 역량을 크게 향상시킬 수 있습니다.

-   **Next.js 기본 개념**: App Router, Server Components, Client Components의 개념과 사용 시점을 이해하는 것이 중요합니다. [Next.js 공식 문서 - Rendering](https://nextjs.org/docs/app/building-your-application/rendering)을 시작으로, 라우팅, 데이터 페칭, API Routes 등에 대한 문서를 꾸준히 읽어보세요.
-   **TypeScript 활용**: JavaScript에 타입을 추가하여 코드의 안정성과 가독성을 높여줍니다. `types/` 디렉토리 내의 타입 정의 파일들을 살펴보면서 실제 프로젝트에서 타입이 어떻게 활용되는지 익히고, [TypeScript 공식 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html)을 통해 기본 문법과 개념을 학습하세요.
-   **shadcn/ui 사용법**: shadcn/ui는 컴포넌트 라이브러리라기보다는 "재사용 가능한 컴포넌트 모음"에 가깝습니다. 필요한 컴포넌트를 프로젝트에 직접 복사하여 사용하고, Tailwind CSS를 통해 커스터마이징합니다. [shadcn/ui 공식 문서](https://ui.shadcn.com/docs)를 참고하여 필요한 컴포넌트를 추가하고 사용하는 방법을 익히세요.
-   **Prisma 사용법**: 데이터베이스 스키마를 정의하고, 타입 안전한 쿼리를 작성할 수 있도록 도와주는 ORM입니다. `prisma/schema.prisma` 파일의 모델 정의와 `lib/db.ts`의 Prisma Client 사용법을 살펴보세요. [Prisma 공식 문서](https://www.prisma.io/docs/)를 통해 기본적인 CRUD(생성, 읽기, 업데이트, 삭제) 작업을 학습하는 것이 좋습니다.
-   **API 통신 이해**: 프론트엔드에서 백엔드 API를 호출하고 응답을 처리하는 방식(fetch API, axios 등)을 이해하는 것이 중요합니다. `app/api` 디렉토리의 API Routes 코드와 클라이언트 컴포넌트에서 API를 호출하는 부분을 살펴보세요.

### 4. 프로젝트 구조 (예상)
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Markdown
IGNORE_WHEN_COPYING_END

devmatch-app/
├── public/
│ └── ... (정적 파일, 이미지 등)
├── app/
│ ├── layout.tsx (전역 레이아웃)
│ ├── page.tsx (홈 페이지)
│ ├── api/
│ │ ├── auth/[...nextauth]/route.ts (NextAuth.js 인증 라우트)
│ │ ├── projects/
│ │ │ ├── route.ts (프로젝트 생성/조회)
│ │ │ ├── [projectId]/
│ │ │ │ ├── route.ts (특정 프로젝트 조회/수정/삭제)
│ │ │ │ ├── invite/route.ts (초대 링크 생성)
│ │ │ │ └── members/route.ts (팀원 관리)
│ │ │ └── ai/
│ │ │ ├── roles/route.ts (AI 역할 분배 질문)
│ │ │ └── interview/route.ts (AI 인터뷰 처리)
│ │ └── chat/route.ts (채팅 관련 API)
│ ├── auth/
│ │ └── page.tsx (로그인/회원가입 페이지)
│ ├── projects/
│ │ ├── page.tsx (프로젝트 대시보드)
│ │ ├── [projectId]/
│ │ │ ├── page.tsx (프로젝트 상세 페이지)
│ │ │ └── interview/page.tsx (AI 인터뷰 페이지)
│ │ └── join/[inviteCode]/page.tsx (초대 링크 참여 페이지)
│ └── components/
│ ├── ui/ (shadcn/ui 컴포넌트)
│ │ ├── button.tsx
│ │ ├── input.tsx
│ │ └── ...
│ ├── common/
│ │ ├── Header.tsx
│ │ ├── Footer.tsx
│ │ └── LoadingSpinner.tsx
│ ├── project/
│ │ ├── ProjectCard.tsx
│ │ ├── ProjectForm.tsx
│ │ └── MemberList.tsx
│ ├── auth/
│ │ └── AuthButtons.tsx
│ └── chat/
│ └── ChatWindow.tsx
├── lib/
│ ├── auth.ts (NextAuth.js 설정)
│ ├── db.ts (Prisma 클라이언트 초기화)
│ ├── utils.ts (공통 유틸리티 함수)
│ ├── ai.ts (AI 모델 인터페이스 및 유틸리티)
│ └── constants.ts (상수 정의)
├── types/
│ ├── index.d.ts (전역 타입 정의)
│ ├── auth.d.ts (인증 관련 타입)
│ ├── project.d.ts (프로젝트 관련 타입)
│ ├── user.d.ts (사용자 관련 타입)
│ └── ai.d.ts (AI 관련 타입)
├── prisma/
│ ├── schema.prisma (데이터베이스 스키마 정의)
│ └── migrations/ (마이그레이션 파일)
├── .env (환경 변수)
├── next.config.js
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── ...

Generated code
#### 4.1. 주요 파일 및 역할

-   `app/layout.tsx`: 애플리케이션의 전역 레이아웃 및 메타데이터 설정.
-   `app/page.tsx`: 애플리케이션의 랜딩 페이지.
-   `app/api/**/*.ts`: Next.js API Routes. 클라이언트 요청을 처리하고 백엔드 로직을 수행.
-   `app/**/*.tsx`: Next.js Pages (Server/Client Components). UI 렌더링 및 사용자 인터랙션.
-   `lib/auth.ts`: NextAuth.js 설정 및 인증 관련 헬퍼 함수.
-   `lib/db.ts`: Prisma Client 인스턴스 및 데이터베이스 연결 관리.
-   `lib/ai.ts`: AI 모델과의 통신 및 데이터 처리 로직.
-   `components/`: 재사용 가능한 UI 컴포넌트.
-   `prisma/schema.prisma`: 데이터베이스 테이블 구조 및 관계 정의.

### 5. UI/UX 디자인 전략

-   **Shadcn/ui**: Next.js 프로젝트에 최적화된 재사용 가능한 UI 컴포넌트 라이브러리. Tailwind CSS 기반으로 커스터마이징이 용이하며, 깔끔하고 현대적인 디자인을 제공합니다.
-   **Material Design Principles**: Google의 Material Design 가이드라인을 참고하여 일관된 시각적 언어와 사용자 경험을 제공합니다. (예: 그림자, 애니메이션, 아이콘 사용)
-   **반응형 디자인**: 모든 페이지는 다양한 디바이스(데스크톱, 태블릿, 모바일)에서 최적의 사용자 경험을 제공하도록 반응형으로 설계됩니다.
-   **접근성**: 웹 표준을 준수하고, 키보드 내비게이션 및 스크린 리더 사용자를 위한 접근성을 고려하여 개발합니다.
-   **시각적 피드백**: 로딩 스피너, 토스트 메시지, 버튼 클릭 효과 등을 통해 사용자에게 명확한 시각적 피드백을 제공합니다.

### 6. 데이터베이스 스키마 상세 (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  projects      ProjectMember[]
  interviewAnswers InterviewAnswer[]
  chatMessages  ChatMessage[]
  ownedProjects Project[] @relation("ProjectOwner")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Project {
  id            String          @id @default(cuid())
  name          String
  goal          String          @db.Text
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  ownerId       String
  owner         User            @relation("ProjectOwner", fields: [ownerId], references: [id])
  members       ProjectMember[]
  roles         Role[]
  inviteLinks   InviteLink[]
  chatMessages  ChatMessage[]
  recommendedRoles RecommendedRole[]
}

model Role {
  id          String    @id @default(cuid())
  projectId   String
  name        String
  description String?   @db.Text
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  recommendedRoles RecommendedRole[]
}

model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  joinedAt  DateTime @default(now())
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

model InviteLink {
  id        String    @id @default(cuid())
  projectId String
  code      String    @unique
  expiresAt DateTime
  createdAt DateTime  @default(now())
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

model InterviewQuestion {
  id        String    @id @default(cuid())
  question  String    @db.Text
  order     Int
  answers   InterviewAnswer[]
}

model InterviewAnswer {
  id          String    @id @default(cuid())
  userId      String
  questionId  String
  answer      String    @db.Text
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  question    InterviewQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@unique([userId, questionId])
}

model RecommendedRole {
  id          String    @id @default(cuid())
  projectId   String
  userId      String
  roleId      String
  reason      String?   @db.Text
  createdAt   DateTime  @default(now())
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  role        Role      @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
}

model ChatMessage {
  id        String    @id @default(cuid())
  projectId String
  userId    String
  content   String    @db.Text
  createdAt DateTime  @default(now())
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
IGNORE_WHEN_COPYING_END
7. 주요 API 명세 상세
7.1. AI 역할 분배 질문 API

경로: /api/projects/ai/roles

메서드: POST

설명: 프로젝트 생성 시, AI가 프로젝트 목표를 기반으로 필요한 역할에 대해 질문하고, 사용자 응답을 바탕으로 역할을 확정합니다.

요청 (Request Body):

Generated json
{
  "projectId": "string", // 생성 중인 프로젝트 ID
  "projectGoal": "string", // 프로젝트 목표
  "userResponse": "string" // AI의 질문에 대한 사용자 응답 (예: "프론트엔드 2명, 백엔드 1명, 디자이너 1명 필요해요.")
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

응답 (Response Body):

성공 (200 OK):

Generated json
{
  "status": "success",
  "message": "프로젝트 역할이 성공적으로 확정되었습니다.",
  "roles": [
    { "id": "string", "name": "프론트엔드 개발자", "description": "웹 프론트엔드 개발 담당" },
    { "id": "string", "name": "백엔드 개발자", "description": "서버 및 API 개발 담당" },
    { "id": "string", "name": "디자이너", "description": "UI/UX 디자인 담당" }
  ]
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

실패 (400 Bad Request / 500 Internal Server Error):

Generated json
{
  "status": "error",
  "message": "오류 메시지"
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END
7.2. AI 1:1 인터뷰 API

경로: /api/ai/interview

메서드: POST

설명: 팀원 개개인의 역량, 경험, 협업 스타일을 파악하기 위한 AI와의 대화형 인터뷰를 진행합니다.

요청 (Request Body):

Generated json
{
  "projectId": "string", // 현재 참여 중인 프로젝트 ID
  "userId": "string", // 인터뷰 진행 중인 사용자 ID
  "message": "string", // 사용자 메시지 (AI에게 보내는 질문 또는 답변)
  "conversationHistory": [ // 이전 대화 기록 (선택 사항, AI의 맥락 유지를 위해 사용)
    { "role": "user", "content": "이전 사용자 메시지" },
    { "role": "ai", "content": "이전 AI 응답" }
  ]
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

응답 (Response Body):

성공 (200 OK):

Generated json
{
  "status": "success",
  "aiResponse": "string", // AI의 응답 메시지 (다음 질문 또는 정보)
  "isInterviewComplete": "boolean", // 인터뷰 완료 여부
  "extractedSkills": ["string"], // AI가 대화에서 추출한 기술 스택 (예: "React", "Spring Boot")
  "extractedExperiences": ["string"] // AI가 대화에서 추출한 경험 (예: "CRUD 개발", "OAuth 연동")
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

실패 (400 Bad Request / 500 Internal Server Error):

Generated json
{
  "status": "error",
  "message": "오류 메시지"
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END
7.3. AI 역할 추천 API

경로: /api/projects/[projectId]/recommend-roles

메서드: POST

설명: 모든 팀원의 AI 인터뷰가 완료되면, 프로젝트 목표와 팀원들의 역량을 종합하여 최적의 역할을 추천합니다.

요청 (Request Body):

Generated json
{
  "projectId": "string" // 역할 추천을 요청할 프로젝트 ID
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

응답 (Response Body):

성공 (200 OK):

Generated json
{
  "status": "success",
  "message": "AI 역할 추천이 완료되었습니다.",
  "recommendations": [
    {
      "userId": "string",
      "userName": "김초보",
      "recommendedRoleId": "string",
      "recommendedRoleName": "프론트엔드 개발자",
      "reason": "React 경험이 풍부하고 UI/UX에 대한 이해도가 높습니다."
    },
    // ... 다른 팀원들의 추천 정보
  ]
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END

실패 (400 Bad Request / 500 Internal Server Error):

Generated json
{
  "status": "error",
  "message": "오류 메시지"
}
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Json
IGNORE_WHEN_COPYING_END
9. 개발 환경 설정 및 시작 방법
9.1. 현재 프로젝트 상태

프로젝트 초기화 완료: devmatch 디렉토리 내에 devmatch-app이라는 Next.js 프로젝트가 성공적으로 초기화되었습니다. (Next.js, TypeScript, ESLint, pnpm 사용)

개발 가이드 문서 통합 완료: GEMINI.md와 plan.md의 내용을 통합하여 PROJECT_GUIDE.md를 생성하고, 기존 파일들은 삭제했습니다.

다음 단계: devmatch-app 디렉토리 내에 .env 파일을 생성하고, 9.2. 개발 환경 설정 섹션에 명시된 환경 변수들을 채워야 합니다. 특히 NEXTAUTH_SECRET은 openssl rand -base64 32 명령어로 생성해야 하며, 나머지 CLIENT_ID, CLIENT_SECRET, DATABASE_URL, GEMINI_API_KEY는 각 서비스에서 발급받아 입력해야 합니다.

9.2. 개발 환경 설정

Node.js 및 pnpm 설치:

Node.js (LTS 버전 권장)가 설치되어 있지 않다면 Node.js 공식 웹사이트에서 다운로드하여 설치합니다.

pnpm은 npm보다 빠르고 효율적인 패키지 관리자입니다. 다음 명령어로 pnpm을 설치합니다:

Generated bash
npm install -g pnpm
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Git 설치:

버전 관리를 위해 Git이 필요합니다. Git 공식 웹사이트에서 다운로드하여 설치합니다.

Visual Studio Code (VS Code) 설치:

강력한 TypeScript 지원과 다양한 확장 기능을 제공하는 VS Code를 사용하는 것을 권장합니다. VS Code 공식 웹사이트에서 다운로드하여 설치합니다.

권장 확장 프로그램:

ESLint: 코드 품질 및 스타일 검사

Prettier - Code formatter: 코드 자동 포맷팅

Tailwind CSS IntelliSense: Tailwind CSS 클래스 자동 완성 및 검사

Prisma: Prisma 스키마 파일 구문 강조 및 자동 완성

환경 변수 설정 (.env 파일):

프로젝트 루트 (devmatch-app 디렉토리)에 .env 파일을 생성하고 다음 환경 변수를 추가합니다.

Generated env
# NextAuth.js
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET" # openssl rand -base64 32 로 생성
NEXTAUTH_URL="http://localhost:3000" # 개발 환경 URL

# Google OAuth
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

# Kakao OAuth
KAKAO_CLIENT_ID="YOUR_KAKAO_CLIENT_ID"
KAKAO_CLIENT_SECRET="YOUR_KAKAO_CLIENT_SECRET"

# Neon Database (PostgreSQL)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" # Neon에서 제공하는 연결 문자열

# Google Gemini API
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Env
IGNORE_WHEN_COPYING_END

NEXTAUTH_SECRET은 openssl rand -base64 32 명령어를 터미널에서 실행하여 생성할 수 있습니다.

Google 및 Kakao OAuth 클라이언트 ID/시크릿은 각 개발자 콘솔에서 발급받아야 합니다.

DATABASE_URL은 Neon 데이터베이스를 생성한 후 제공되는 연결 문자열을 사용합니다.

GEMINI_API_KEY는 Google Cloud Console에서 Gemini API를 활성화한 후 발급받아야 합니다.

9.3. 프로젝트 시작 (개발 서버 실행)

프로젝트 디렉토리로 이동:

Generated bash
cd devmatch-app
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

의존성 설치:

Generated bash
pnpm install
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

Prisma 클라이언트 생성 및 마이그레이션:

데이터베이스 스키마를 적용하고 Prisma 클라이언트를 생성합니다.

Generated bash
pnpm prisma db push
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

참고: pnpm prisma migrate dev --name init 명령어를 사용하여 마이그레이션 파일을 생성하고 적용할 수도 있습니다. 이는 데이터베이스 변경 이력을 관리하는 데 유용합니다.

개발 서버 실행:

Generated bash
pnpm dev
IGNORE_WHEN_COPYING_START
content_copy
download
Use code with caution.
Bash
IGNORE_WHEN_COPYING_END

이 명령어를 실행하면 개발 서버가 http://localhost:3000에서 시작됩니다. 웹 브라우저를 열어 해당 주소로 접속하면 프로젝트를 확인할 수 있습니다.

9.4. Next.js/TypeScript 초보자를 위한 추가 지침

Next.js 기본 개념:

App Router: Next.js 13부터 도입된 새로운 라우팅 시스템입니다. app 디렉토리 내의 파일 시스템을 기반으로 라우팅이 이루어집니다.

Server Components vs. Client Components:

Server Components: 서버에서 렌더링되며, 데이터 페칭 및 민감한 로직 처리에 적합합니다. use client 지시어가 없는 모든 컴포넌트는 기본적으로 Server Component입니다.

Client Components: 브라우저(클라이언트)에서 렌더링되며, 사용자 인터랙션(클릭, 입력 등) 및 상태 관리에 적합합니다. 파일 상단에 "use client"; 지시어를 명시해야 합니다.

학습 자료: Next.js 공식 문서 - Rendering을 참고하세요.

TypeScript 활용:

TypeScript는 JavaScript에 타입을 추가하여 코드의 안정성과 가독성을 높여줍니다.

타입 정의: types/ 디렉토리 내에 프로젝트에서 사용될 데이터 구조에 대한 타입을 정의합니다. (예: User, Project, APIResponse 등)

타입 추론: TypeScript는 변수나 함수의 타입을 자동으로 추론하는 경우가 많으므로, 모든 곳에 명시적으로 타입을 지정할 필요는 없습니다.

에러 메시지 활용: TypeScript 컴파일러가 제공하는 에러 메시지는 코드의 문제를 파악하고 수정하는 데 매우 유용합니다. 에러 메시지를 주의 깊게 읽고 이해하려고 노력하세요.

학습 자료: TypeScript 공식 핸드북을 참고하세요.

shadcn/ui 사용법:

shadcn/ui는 컴포넌트 라이브러리라기보다는 "재사용 가능한 컴포넌트 모음"에 가깝습니다. 필요한 컴포넌트를 프로젝트에 직접 복사하여 사용하고, Tailwind CSS를 통해 커스터마이징합니다.

설치 및 사용법: shadcn/ui 공식 문서를 참고하여 필요한 컴포넌트를 추가하고 사용하는 방법을 익히세요.

Prisma 사용법:

Prisma는 데이터베이스 스키마를 정의하고, 타입 안전한 쿼리를 작성할 수 있도록 도와주는 ORM입니다.

prisma/schema.prisma 파일에 데이터베이스 모델을 정의한 후, pnpm prisma generate 명령어를 실행하여 Prisma Client를 생성합니다.

학습 자료: Prisma 공식 문서를 참고하세요.

10. 테스트 계획

단위 테스트: Jest, React Testing Library를 사용하여 개별 컴포넌트 및 유틸리티 함수를 테스트합니다.

통합 테스트: API Routes 및 데이터베이스 연동을 테스트합니다.

E2E 테스트: Playwright 또는 Cypress를 사용하여 사용자 흐름 전체를 테스트합니다.

11. 배포 계획

클라우드 플랫폼: Vercel

배포 자동화: Vercel Git 연동을 통한 CI/CD를 설정합니다. main 브랜치에 푸시될 때마다 자동으로 배포가 이루어지도록 합니다.

데이터베이스: Neon (Vercel Integration 활용)을 통해 Vercel 프로젝트와 Neon 데이터베이스를 쉽게 연결할 수 있습니다.