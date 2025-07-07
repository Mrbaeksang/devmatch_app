# AI 에이전트의 프로젝트 컨벤션 학습 및 가이드

이 문서는 AI 에이전트(저)가 'AI 팀 빌딩 매니저' 프로젝트의 코드 컨벤션, 아키텍처 패턴, 권장 사례 및 금지 사례를 학습하고 기록하는 공간입니다. 사장님과 저의 효율적인 협업을 위한 공동의 지식 기반으로 활용됩니다.

## 1. 문서의 목적

*   **AI 학습 기록**: AI 에이전트가 프로젝트의 특성을 심층적으로 이해하고 내재화하는 과정을 기록합니다.
*   **컨벤션 가이드**: 프로젝트의 표준 코딩 스타일, 구조, 패턴 등을 명확히 정의하여 일관된 개발을 돕습니다.
*   **오류 방지**: 빌드/배포 오류, 린트 경고 등을 사전에 방지하기 위한 구체적인 지침을 제공합니다.
*   **협업 효율 증대**: 사장님과 AI 에이전트 간의 커뮤니케이션 비용을 줄이고, 작업 효율을 높입니다.

## 2. AI 에이전트의 학습 계획

저는 다음 단계에 따라 프로젝트 컨벤션을 심층적으로 분석하고 내재화할 것입니다.

### 2.1. 설정 파일 분석

*   `package.json`: 프로젝트 의존성, 스크립트, 버전 관리
*   `tsconfig.json`: TypeScript 컴파일러 옵션, 경로 별칭 (`paths`)
*   `eslint.config.mjs`: ESLint 규칙, 코드 스타일
*   `postcss.config.mjs`: PostCSS 설정, Tailwind CSS 통합
*   `components.json`: `shadcn/ui` 컴포넌트 설정

### 2.2. 코드 패턴 분석

*   `app/**/*.tsx`: Next.js App Router 구조, Server/Client Component 사용 시점, 데이터 페칭 방식, UI 컴포넌트 구성 패턴
*   `lib/**/*.ts`: 유틸리티 함수, 헬퍼 함수, API 클라이언트 초기화, 데이터베이스 연동 (`PrismaClient` 사용법)
*   `prisma/schema.prisma`: 데이터베이스 모델링, 관계 설정, 필드 명명 규칙

### 2.3. 프로젝트 문서 분석

*   `README_AI.md`: 프로젝트 개요, 목표, 기술 스택, 전체 사용자 흐름, 주요 API 명세
*   `GEMINI.md`: AI 에이전트의 운영 지침, 구현 단계별 계획 및 진행 상황

## 3. 주요 컨벤션 및 지침 (학습하며 추가 예정)

이 섹션에는 제가 학습한 프로젝트의 주요 컨벤션과 지침이 구체적인 예시와 함께 기록될 것입니다.

### 3.1. 일반 코딩 스타일

*   **TypeScript 사용**: 모든 `.ts`, `.tsx` 파일은 TypeScript를 사용하며, `any` 타입 사용은 지양합니다. 불가피한 경우 명시적인 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 주석과 함께 사용 이유를 간략히 명시합니다.
*   **ESLint/Prettier 준수**: `eslint.config.mjs`에 정의된 규칙과 Prettier 포맷팅을 따릅니다. (자동 포맷팅 도구 사용 권장)
*   **변수/함수 명명**: `camelCase`를 사용하며, 의미를 명확히 전달하는 이름을 사용합니다.

### 3.2. Next.js 관련

*   **`next/image` 사용**: 이미지 최적화를 위해 `<img>` 태그 대신 `next/image` 컴포넌트를 사용합니다. `width`, `height`, `alt` 속성을 필수로 포함합니다.
*   **Server/Client Component 구분**: `use client` 지시어를 통해 Server Component와 Client Component의 역할을 명확히 구분하고, 각 컴포넌트의 적절한 사용 시점을 준수합니다.
*   **API Routes**: `app/api` 경로에 정의된 API Routes는 `NextResponse`를 사용하여 응답을 처리하고, 에러 핸들링을 포함합니다.
*   **라우팅 및 네비게이션**: `next/navigation`의 `useRouter`, `redirect`, `useSearchParams` 훅과 `next/link` 컴포넌트를 사용하여 페이지 이동 및 URL 파라미터 처리를 수행합니다.

### 3.3. 데이터베이스 (Prisma)

*   **`schema.prisma` 관리**: 데이터베이스 스키마 변경 시, `pnpm prisma db push` 또는 `pnpm prisma migrate dev`를 통해 데이터베이스에 동기화합니다.
*   **Prisma Client 사용**: `lib/db.ts`에 정의된 `db` 인스턴스를 통해 데이터베이스 작업을 수행합니다.

### 3.4. 인증 (NextAuth.js)

*   **`next-auth` 사용**: `next-auth/react`의 `signIn` 함수를 클라이언트 컴포넌트에서 사용하여 소셜 로그인(Google, Kakao)을 처리합니다.
*   **서버 세션 관리**: `next-auth`의 `getServerSession` 함수를 서버 컴포넌트나 API Routes에서 사용하여 사용자 세션 정보를 안전하게 가져옵니다.
*   **`authOptions`**: `lib/auth.ts`에 정의된 `authOptions` 객체를 통해 NextAuth.js의 전반적인 설정을 관리합니다.

### 3.5. UI/UX 디자인 및 컴포넌트

*   **현대적이고 상용화 가능한 디자인**: 모든 UI는 현대적이고 시각적으로 매력적이며, 상용 서비스로 즉시 배포 가능한 수준의 품질을 목표로 합니다. Google Material Design principles를 적용하여 일관되고 세련된 사용자 경험을 제공합니다.
*   **`shadcn/ui` 활용**: `components/ui` 경로에 위치한 `shadcn/ui` 컴포넌트들을 사용하여 일관된 디자인과 재사용성을 확보합니다. (예: `Card`, `Button`, `Avatar`, `Tabs`, `Input`, `Toaster` 등)
*   **Tailwind CSS**: `tailwind.config.ts`에 정의된 설정과 함께 Tailwind CSS 유틸리티 클래스를 사용하여 스타일링을 적용합니다.
*   **컴포넌트 확장 및 스타일링 패턴**: `cva` (`class-variance-authority`)를 사용하여 컴포넌트의 `variant`와 `size`에 따라 동적으로 Tailwind CSS 클래스를 적용합니다. `cn` (`clsx`와 `tailwind-merge` 기반) 유틸리티 함수를 사용하여 조건부 클래스 적용 및 Tailwind CSS 클래스 충돌을 해결합니다. `asChild` prop과 `Slot` 컴포넌트를 활용하여 컴포넌트의 렌더링 요소를 유연하게 변경합니다.

### 3.6. AI SDK 관련

*   **`lims.txt` 우선**: AI 관련 기능 구현 시 `lims.txt` 문서에 제시된 Vercel AI SDK 활용 방안 및 관련 예시를 최우선 기준으로 삼습니다.
*   **AI SDK 버전 고정**: `ai@4.3.16`, `@ai-sdk/react@1.2.12`, `@ai-sdk/openai@1.3.22` 버전을 기준으로 합니다.

### 3.7. 개발 편의성

*   **데이터 목업**: 개발 초기 단계나 특정 기능 개발 시, 실제 API 연동 전에 임시 데이터를 사용하여 UI/로직을 빠르게 구현할 수 있습니다. (예: `app/projects/page.tsx`의 `projects` 배열)

### 3.8. 프로젝트 설정 및 빌드

*   **ESLint Flat Config**: `eslint.config.mjs`에서 `@eslint/eslintrc`의 `FlatCompat`를 사용하여 기존 `.eslintrc` 스타일의 설정을 새로운 Flat Config 형식으로 변환하여 사용합니다. `next/core-web-vitals` 및 `next/typescript` 확장을 통해 Next.js 및 TypeScript 프로젝트에 최적화된 린팅 규칙을 적용합니다.
*   **TypeScript 엄격 모드**: `tsconfig.json`의 `compilerOptions`에서 `strict: true`, `noEmit: true`, `isolatedModules: true` 등 엄격한 타입 검사 및 모듈 분리 설정을 사용합니다.

### 3.9. 환경 변수 관리

*   **`.env` 파일 사용**: 민감한 정보(API 키, DB URL 등)는 `.env` 파일에 저장하고, `process.env`를 통해 접근합니다.
*   **클라이언트/서버 환경 변수 구분**: 클라이언트 사이드에서 사용되는 환경 변수는 `NEXT_PUBLIC_` 접두사를 붙여야 합니다. (예: `NEXT_PUBLIC_API_URL`). 서버 사이드 환경 변수는 접두사가 필요 없습니다.
*   **Non-null Assertion Operator (`!`) 사용**: `process.env.VARIABLE_NAME!`와 같이 사용될 경우, 해당 환경 변수가 반드시 존재함을 가정합니다. 배포 환경에서 누락되지 않도록 주의해야 합니다.

### 3.10. 에러 핸들링 및 로깅

*   **API Routes 에러 처리**: `try-catch` 블록을 사용하여 API Routes에서 발생하는 예외를 처리하고, `NextResponse.json`을 통해 적절한 상태 코드와 에러 메시지를 반환합니다.
*   **클라이언트 에러 처리**: `sonner` 라이브러리의 `toast`를 사용하여 사용자에게 시각적인 에러 피드백을 제공합니다.
*   **콘솔 로깅**: 개발 환경에서는 `console.log`, `console.error` 등을 적극 활용하여 디버깅 정보를 출력하고, 운영 환경에서는 불필요한 로그를 제거하거나 로깅 시스템을 활용합니다.

### 3.11. 성능 최적화

*   **이미지 최적화**: `next/image` 사용은 필수입니다.
*   **폰트 최적화**: `next/font`를 사용하여 폰트를 최적화하고 Cumulative Layout Shift (CLS)를 방지합니다. (현재 `app/layout.tsx`에서 `next/font/google`의 `Inter` 폰트를 사용 중)
*   **번들 사이즈**: 불필요한 라이브러리나 코드를 제거하여 번들 사이즈를 최소화합니다.

### 3.12. 보안

*   **환경 변수 보안**: 민감한 정보는 `.env` 파일에만 저장하고, 클라이언트 번들에 노출되지 않도록 주의합니다.
*   **NextAuth.js 보안**: 세션 관리, CSRF 보호, 콜백 URL 검증 등 NextAuth.js가 제공하는 보안 기능을 올바르게 활용합니다.
*   **API 보안**: API Routes에서 사용자 인증 및 권한 검사를 철저히 수행합니다.

### 3.13. 프로젝트 파일 및 디렉토리 구조

*   **`.gitignore`**: `.env`, `node_modules`, `.next`, `pnpm-lock.yaml` 등 버전 관리에서 제외되어야 할 파일 및 디렉토리를 명확히 명시합니다.
*   **`next-env.d.ts`**: Next.js가 자동으로 생성하는 타입 정의 파일로, 수동으로 수정하지 않습니다.
*   **`README.md`**: 프로젝트의 개요, 설치 및 실행 방법 등 기본적인 정보를 담고 있습니다.
*   **`types/` 디렉토리**: `next-auth.d.ts`와 같이 라이브러리 타입 확장을 포함하여, 프로젝트 전반에 걸쳐 사용되는 커스텀 타입 정의 파일을 관리합니다.
*   **`public/` 디렉토리**: 이미지, SVG 등 웹에서 직접 접근 가능한 정적 자산을 저장합니다. 코드에서 `/path/to/asset.svg`와 같이 루트 상대 경로로 참조합니다.

---

## 4. AI 에이전트의 작업 방식

*   **문서 우선 개발**: 코드를 수정하기 전에 관련된 문서(특히 `GEMINI.md`, `GUIDE.md`)를 먼저 업데이트합니다.
*   **`ORDER.md`를 통한 작업 요청**: 모든 코드 생성/수정 및 쉘 명령어 실행은 `ORDER.md`를 통해 사장님께 요청합니다. `ORDER.md`에는 작업의 목적, 상세 지침, 그리고 커밋 명령어가 포함됩니다.
*   **자체 검증**: 코드를 제안하기 전에 빌드, 린트, 타입 체크를 통과하는지 내부적으로 검증합니다.

## 5. 컨벤션 가이드 및 적용법 (예시 프롬프트 포함)

이 섹션에서는 제가 학습한 컨벤션을 바탕으로, 사장님께서 코드를 작성하실 때 참고하실 수 있는 구체적인 가이드라인과 예시 프롬프트를 제공합니다.

### 5.1. `next/image` 사용 가이드

**표준 가이드**: 이미지 최적화 및 성능 향상을 위해 Next.js의 `Image` 컴포넌트를 사용해야 합니다. `<img>` 태그는 사용하지 않습니다.

**적용법**: `next/image`에서 `Image`를 임포트하고, `src`, `alt`, `width`, `height` 속성을 필수로 제공합니다. `className` 등 다른 HTML 속성은 그대로 사용할 수 있습니다.

**예시 프롬프트**: 
```
"`app/auth/page.tsx` 파일에서 모든 `<img>` 태그를 `next/image` 컴포넌트로 교체해 주세요. `width`와 `height`는 기존 이미지 크기에 맞춰 적절히 설정하고, `alt` 속성도 의미 있게 채워주세요."
```

### 5.2. `any` 타입 사용 지양 가이드

**표준 가이드**: TypeScript의 타입 안정성을 위해 `any` 타입 사용을 최소화해야 합니다. 명확한 타입을 정의하거나, 제네릭을 활용하는 것을 권장합니다.

**금지 사례**: 변수, 함수 매개변수, 반환 값 등에 `any`를 무분별하게 사용하는 것.

**적용법**: 
*   가능한 경우, 명확한 인터페이스나 타입을 정의하여 사용합니다.
*   외부 라이브러리 등으로 인해 `any` 사용이 불가피한 경우, 해당 라인 위에 `// eslint-disable-next-line @typescript-eslint/no-explicit-any` 주석을 추가하고, 왜 `any`를 사용했는지 간략하게 설명하는 주석을 함께 남깁니다.

**예시 프롬프트**: 
```
"`app/projects/[projectId]/page.tsx` 파일에서 `ProjectMemberWithUser` 인터페이스 내의 `project: any;` 부분을 제거하여 `any` 타입 사용을 지양해 주세요. 이 인터페이스는 멤버 정보에만 집중하도록 합니다."
```

### 5.3. 사용되지 않는 변수/임포트 제거 가이드

**표준 가이드**: 코드의 가독성과 번들 크기 최적화를 위해 사용되지 않는 변수, 함수, 임포트는 제거해야 합니다.

**적용법**: ESLint 경고(`no-unused-vars`)가 발생하면 해당 요소를 제거합니다. 만약 특정 변수가 디버깅 목적으로 잠시 사용되지 않는 경우, `// eslint-disable-next-line @typescript-eslint/no-unused-vars` 주석을 사용하여 예외 처리할 수 있습니다.

**예시 프롬프트**: 
```
"`app/projects/new/page.tsx` 파일에서 `onError` 콜백 내의 `error` 변수가 사용되지 않는다는 ESLint 경고를 해결해 주세요. 변수를 사용하거나, `// eslint-disable-next-line` 주석으로 예외 처리해 주세요."
```

### 5.4. `lib/db.ts` ESLint 지시문 제거 가이드

**표준 가이드**: 불필요한 ESLint 비활성화 지시문은 제거하여 코드 베이스를 깔끔하게 유지합니다.

**적용법**: `lib/db.ts` 파일 상단에 있는 `/* eslint-disable no-var */` 주석을 제거합니다. 이 규칙 위반이 더 이상 발생하지 않으므로 불필요합니다.

**예시 프롬프트**: 
```
"`lib/db.ts` 파일에서 사용되지 않는 `eslint-disable no-var` 지시문을 제거해 주세요.""
```

---

**이 문서는 프로젝트 진행 상황과 저의 학습에 따라 지속적으로 업데이트될 예정입니다.**
