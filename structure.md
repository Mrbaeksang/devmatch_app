# 프로젝트 구조 및 핵심 요소 가이드 (structure.md)

이 문서는 'AI 팀 빌딩 매니저' 프로젝트의 전반적인 구조, 주요 파일 및 디렉토리의 역할, 그리고 핵심 변수 및 타입 정의를 설명합니다. 프로젝트의 복잡성이 증가함에 따라 코드의 이해도를 높이고, 변경 사항의 영향을 파악하며, 일관된 개발을 유지하는 데 도움을 주기 위해 작성되었습니다.

## 1. 문서의 목적

*   **프로젝트 개요**: 프로젝트의 물리적 구조와 논리적 구성을 한눈에 파악할 수 있도록 돕습니다.
*   **핵심 요소 정의**: 프로젝트의 핵심이 되는 변수, 타입, 인터페이스, 함수 등의 정의와 사용처를 명시합니다.
*   **연관 관계 파악**: 각 파일, 모듈, 컴포넌트, 데이터 모델 간의 의존성과 상호작용을 설명하여 코드 변경 시 영향을 예측할 수 있도록 합니다.
*   **일관성 유지**: TypeScript 타입 정의를 중심으로 변수 및 데이터 흐름의 일관성을 유지하는 데 기여합니다.

## 2. 주요 디렉토리 및 파일 구조

프로젝트의 루트 디렉토리부터 시작하여 주요 디렉토리와 파일의 역할 및 포함하는 내용을 설명합니다.

*   `app/`: Next.js App Router의 핵심 디렉토리. 페이지, API 라우트, 레이아웃 등이 정의됩니다.
    *   `app/api/`: API 라우트 핸들러를 포함합니다.
        *   `app/api/auth/[...nextauth]/route.ts`: NextAuth.js 인증 라우트. Google, Kakao OAuth를 통한 사용자 인증을 처리하며, 세션 생성 및 관리를 담당합니다. `lib/auth.ts`의 `authOptions`를 사용합니다.
        *   `app/api/projects/initial-setup/route.ts`: AI 상담을 통해 수집된 임시 프로젝트 정보를 처리하고 저장하는 API. `prisma/schema.prisma`의 `Project` 모델과 연관됩니다.
        *   `app/api/chat/route.ts`: Vercel AI SDK를 활용한 AI 챗봇 API. 사용자 메시지를 처리하고 AI 모델(Gemini API)과 통신하여 응답을 생성합니다. `lims.txt`의 지침을 따릅니다.
        *   `app/api/projects/route.ts`: 프로젝트 목록 조회 및 생성 관련 API (향후 구현 예정).
        *   `app/api/projects/[projectId]/recommend-roles`: AI 기반 역할 추천 API (향후 구현 예정). (파일 미생성)
    *   `app/auth/page.tsx`: 로그인 페이지 UI. `next-auth/react`의 `signIn` 함수를 사용하여 Google, Kakao 로그인을 처리합니다. `useSearchParams`를 사용하여 `callbackUrl`을 관리합니다.
    *   `app/projects/`: 프로젝트 관련 페이지 및 하위 라우트.
        *   `app/projects/new/page.tsx`: 새 프로젝트 생성 페이지. Vercel AI SDK를 활용한 대화형 AI 상담 UI를 제공합니다. `app/api/projects/initial-setup/route.ts`와 연동됩니다.
        *   `app/projects/[projectId]/page.tsx`: 개별 프로젝트의 상세 정보를 표시하는 페이지. 프로젝트 정보, 팀원 목록, AI 인터뷰 결과 등을 보여줍니다.
        *   `app/api/projects/[projectId]/invite/route.ts`: 프로젝트 초대 링크 생성 및 관리 API (향후 구현 예정, 파일 미생성).
    *   `app/projects/join/[inviteCode]/page.tsx`: 초대 수락 페이지 UI (향후 구현 예정, 파일 미생성).
    *   `app/projects/[projectId]/interview/page.tsx`: Vercel AI SDK를 활용한 대화형 채팅 UI (향후 구현 예정, 파일 미생성).
    *   `app/layout.tsx`: 전역 레이아웃. `ThemeProvider`를 통한 다크 모드 지원, `Toaster`를 통한 알림 메시지 표시, 기본 폰트 설정 등을 포함합니다.
    *   `app/page.tsx`: 랜딩 페이지. 로그인 상태에 따라 `/projects`로 자동 리다이렉트하는 로직을 포함합니다.
*   `components/`: 재사용 가능한 UI 컴포넌트.
    *   `components/common/`: 프로젝트 전반에 걸쳐 사용되는 공통 컴포넌트.
        *   `Header.tsx`: 애플리케이션 상단 헤더.
        *   `Footer.tsx`: 애플리케이션 하단 푸터.
        *   `LoadingSpinner.tsx`: 로딩 상태를 표시하는 스피너.
    *   `components/ui/`: `shadcn/ui`에서 생성된 컴포넌트. `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `sonner.tsx`, `tabs.tsx`, `textarea.tsx` 등.
    *   `components/project/`: 프로젝트 관련 컴포넌트.
        *   `ProjectCard.tsx`: 프로젝트 정보를 요약하여 보여주는 카드 컴포넌트.
        *   `ProjectForm.tsx`: 프로젝트 생성 또는 수정에 사용되는 폼 컴포넌트.
*   `lib/`: 유틸리티 함수, 데이터베이스 연결, 인증 로직 등 핵심 비즈니스 로직.
    *   `lib/auth.ts`: NextAuth.js 설정 파일. Google, Kakao Provider 설정 및 콜백 로직을 포함하는 `authOptions` 객체를 정의합니다.
    *   `lib/db.ts`: Prisma Client 인스턴스를 초기화하고 내보내는 파일. 모든 데이터베이스 상호작용은 이 `db` 인스턴스를 통해 이루어집니다.
    *   `lib/utils.ts`: 일반적인 유틸리티 함수 (예: `cn` 함수).
*   `prisma/`: Prisma ORM 관련 파일.
    *   `prisma/schema.prisma`: 데이터베이스 스키마 정의 파일. `User`, `Account`, `Session`, `Project` 모델 및 `ProjectStatus` Enum이 정의되어 있습니다. `refresh_token_expires_in` 필드가 `Account` 모델에 추가되어 Kakao 로그인 오류를 해결합니다.
*   `public/`: 정적 자산 (이미지, 아이콘 등). `google-icon.svg`, `kakao-icon.svg` 등이 포함됩니다.
*   `types/`: 전역 TypeScript 타입 정의 파일.
    *   `types/next-auth.d.ts`: NextAuth.js의 기본 타입 정의를 확장하여 커스텀 세션 및 사용자 속성을 추가합니다.

## 3. 핵심 변수 및 타입 정의

프로젝트 전반에 걸쳐 사용되는 중요한 변수, 인터페이스, 타입 별칭 등을 정의하고, 이들이 어떤 파일에서 선언되고 어디서 사용되는지 설명합니다.

*   **`User` (Prisma Model):**
    *   **선언**: `prisma/schema.prisma`
    *   **설명**: 애플리케이션 사용자를 나타내는 데이터베이스 모델. `id`, `name`, `email`, `emailVerified`, `image` 필드를 포함합니다. `Account` 및 `Session` 모델과 관계를 가집니다.
    *   **사용처**: `app/api/auth/[...nextauth]/route.ts` (인증 시), `lib/auth.ts` (세션 관리), `lib/db.ts` (데이터베이스 쿼리).

*   **`Account` (Prisma Model):**
    *   **선언**: `prisma/schema.prisma`
    *   **설명**: 사용자의 OAuth 계정 정보를 나타내는 데이터베이스 모델. `userId`, `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`, `refresh_token_expires_in` 필드를 포함합니다. `User` 모델과 관계를 가집니다.
    *   **사용처**: `app/api/auth/[...nextauth]/route.ts` (OAuth 콜백 처리).

*   **`Session` (Prisma Model):**
    *   **선언**: `prisma/schema.prisma`
    *   **설명**: 사용자 세션 정보를 나타내는 데이터베이스 모델. `sessionToken`, `userId`, `expires` 필드를 포함합니다. `User` 모델과 관계를 가집니다.
    *   **사용처**: `app/api/auth/[...nextauth]/route.ts` (세션 관리).

*   **`Project` (Prisma Model):**
    *   **선언**: `prisma/schema.prisma`
    *   **설명**: AI 상담을 통해 생성되는 프로젝트 정보를 나타내는 데이터베이스 모델. `id`, `name`, `description`, `status`, `consultationData`, `createdAt`, `updatedAt` 필드를 포함합니다. `status` 필드는 `ProjectStatus` Enum을 사용합니다.
    *   **사용처**: `app/api/projects/initial-setup/route.ts` (프로젝트 정보 저장), `app/projects/[projectId]/page.tsx` (프로젝트 상세 정보 표시).

*   **`ProjectStatus` (Prisma Enum):**
    *   **선언**: `prisma/schema.prisma`
    *   **설명**: 프로젝트의 현재 상태를 나타내는 열거형. `PENDING`, `ACTIVE`, `COMPLETED`, `ARCHIVED` 등의 값을 가질 수 있습니다.
    *   **사용처**: `Project` 모델의 `status` 필드.

*   **`AuthOptions` (NextAuth.js):**
    *   **선언**: `lib/auth.ts`
    *   **설명**: NextAuth.js의 핵심 설정 객체. `providers`, `adapter`, `callbacks`, `pages` 등의 속성을 포함하여 인증 방식을 구성합니다.
    *   **사용처**: `app/api/auth/[...nextauth]/route.ts`에서 NextAuth.js를 초기화할 때 사용됩니다.

*   **`db` (Prisma Client Instance):**
    *   **선언**: `lib/db.ts`
    *   **설명**: Prisma Client의 싱글톤 인스턴스. 애플리케이션 전반에서 데이터베이스 쿼리를 수행하는 데 사용됩니다.
    *   **사용처**: `app/api` 경로의 모든 API 라우트 핸들러, 서버 컴포넌트 등 데이터베이스 접근이 필요한 모든 곳.

*   **`UIMessage` (Vercel AI SDK):**
    *   **선언**: `ai` 패키지
    *   **설명**: Vercel AI SDK에서 UI와 AI 모델 간의 메시지 형식을 정의하는 타입. `id`, `role`, `content`, `attachments` 등의 속성을 포함합니다.
    *   **사용처**: `app/api/chat/route.ts` (메시지 처리), `app/projects/new/page.tsx` (AI 상담 UI).

*   **`NewResourceParams` (Drizzle ORM):**
    *   **선언**: `lib/db/schema/resources.ts` (RAG 챗봇 예시에서 사용)
    *   **설명**: 새로운 리소스를 생성할 때 필요한 파라미터의 타입을 정의합니다. `content` 필드를 포함합니다.
    *   **사용처**: `lib/actions/resources.ts` (리소스 생성 서버 액션).

*   **`embeddings` (Drizzle ORM):**
    *   **선언**: `lib/db/schema/embeddings.ts` (RAG 챗봇 예시에서 사용)
    *   **설명**: 임베딩 데이터를 저장하는 데이터베이스 테이블의 스키마. `id`, `resourceId`, `content`, `embedding` 필드를 포함합니다.
    *   **사용처**: `lib/ai/embedding.ts` (임베딩 생성 및 검색), `lib/actions/resources.ts` (임베딩 저장).

## 4. 변수 및 타입 업데이트 지침

프로젝트의 타입 안정성과 코드 일관성을 유지하기 위해, 변수 및 타입 정의를 변경하거나 추가할 때 다음 지침을 따릅니다.

*   **단일 책임 원칙**: 각 타입/인터페이스는 명확하고 단일한 책임을 가지도록 정의합니다.
*   **재사용성 고려**: 여러 곳에서 사용될 수 있는 타입은 `types/` 디렉토리 또는 관련 모듈의 최상위 레벨에 정의하여 재사용성을 높입니다.
*   **Prisma Schema 우선**: 데이터베이스 모델과 관련된 타입은 `prisma/schema.prisma`를 통해 관리하고, `PrismaClient`가 생성하는 타입을 활용합니다.
*   **명확한 명명 규칙**: 변수와 타입의 이름은 그 목적과 내용을 명확히 반영하도록 `GUIDE.md`의 명명 규칙을 따릅니다.
*   **변경 관리**: 변수나 타입 정의가 변경될 경우, 해당 변경이 영향을 미치는 모든 파일과 `structure.md`를 업데이트합니다. 특히, `GUIDE.md`의 `3.1. 일반 코딩 스타일` 섹션의 `TypeScript 사용` 지침을 준수합니다.
*   **타입 추론 활용**: TypeScript의 타입 추론 기능을 최대한 활용하되, 복잡하거나 명시적인 선언이 필요한 경우에는 타입을 명시합니다.

## 5. 문서 업데이트 및 관리

이 `structure.md` 문서는 프로젝트의 코드 변경 사항을 반영하여 지속적으로 업데이트되어야 합니다.

*   **주요 변경 시 업데이트**: 새로운 기능 추가, DB 스키마 변경, 핵심 로직 리팩토링 등 프로젝트 구조에 영향을 미치는 주요 변경이 있을 때마다 이 문서를 업데이트합니다.
*   **AI 에이전트 직접 관리**: 이 문서는 AI 에이전트가 직접 관리하고 업데이트합니다. 사장님께서는 이 문서의 내용이 최신 상태를 유지하도록 AI 에이전트에게 요청할 수 있습니다.
*   **Git 커밋**: 이 문서의 변경 사항은 다른 문서 변경과 마찬가지로 명확한 커밋 메시지와 함께 Git에 기록됩니다.

---