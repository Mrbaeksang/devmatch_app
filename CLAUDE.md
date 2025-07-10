# CLAUDE.md - DevMatch 개발 수칙

## 📋 프로젝트 개요
**DevMatch**: AI 기반 팀 빌딩 플랫폼 (Next.js 15 + TypeScript + OpenRouter API)
- **핵심 플로우**: 상담 → 모집 → 면담 → 분석 → 프로젝트 시작
- **목표**: 실제 서비스 배포 수준의 품질

## 🚨 **절대 준수사항 (최우선)**

### **1. 타입 안정성 (Type Safety)**
- ✅ **MUST**: `any` 타입 **절대 금지** → `unknown` 또는 구체적 타입 사용
- ✅ **MUST**: 모든 props, 함수 파라미터 타입 정의 **필수**
- ✅ **MUST**: `types/` 폴더의 공통 타입 사용 (중복 정의 금지)
- ❌ **NEVER**: 타입 단언(as) 남용 금지

### **2. 코드 품질 (Code Quality)**
- ✅ **MUST**: 사용하지 않는 변수/임포트 **즉시 제거**
- ✅ **MUST**: 파일 수정 전 **반드시 내용 확인**
- ✅ **MUST**: 기존 패턴 준수 (기존 컴포넌트 재사용 우선)
- ❌ **NEVER**: 빌드 실패 상태로 커밋 금지

### **3. API 구조 일관성**
- ✅ **MUST**: 대칭 구조 유지 (`app/projects/[projectId]` ↔ `app/api/projects/[projectId]`)
- ✅ **MUST**: projectId 기반 URL 사용 (inviteCode 혼재 금지)
- ❌ **NEVER**: 스파게티 코드나 중복 API 생성 금지

## 🎯 **DevMatch 특화 규칙**

### **AI 상담 시스템 (api/chat/route.ts)**
- ✅ **DO**: 데피(Deffy) 6단계 시스템 프롬프트 구조 유지
- ✅ **DO**: 3-category techStack 구조 지원 (frontend, backend, collaboration)
- ✅ **DO**: 상담 완료 시 projectId와 inviteCode 모두 반환
- ❌ **DON'T**: AI에게 상태 전이 제어권 위임 금지

### **면담 시스템 (api/projects/[projectId]/interview/route.ts)**
- ✅ **DO**: 3-category techStack에서 모든 기술 추출하여 질문
- ✅ **DO**: 카테고리별 체계적 평가 (Frontend, Backend, Collaboration)
- ✅ **DO**: 기술별 1~5점 점수 및 워크스타일 수집
- ❌ **DON'T**: 단순 배열로만 처리하여 1개 기술만 질문하지 말 것

### **프로젝트 데이터 플로우**
```
ConsultationData (types/chat.ts) → 3-category techStack → Database → Interview
```
- ✅ **DO**: techStack 3-category 구조 일관성 유지
- ✅ **DO**: 데이터베이스 Json 필드 활용한 유연한 구조
- ✅ **DO**: 면담 시 모든 카테고리 기술들 체계적으로 평가

## 🏗️ **현재 프로젝트 구조 (정리 완료)**

### **페이지 구조**
```
app/projects/[projectId]/
├── page.tsx (팀 대기실)
├── interview/page.tsx (개인 면담)
└── analysis/page.tsx (팀 분석)
```

### **API 구조**
```
app/api/projects/[projectId]/
├── route.ts (프로젝트 정보)
├── interview/route.ts (면담 진행)
├── join/route.ts (프로젝트 참여)
└── analyze/route.ts (팀 분석)
```

### **기술스택 구조**
```typescript
techStack: {
  frontend?: {
    languages: string[];    // ["JavaScript", "TypeScript"]
    frameworks: string[];   // ["React", "Next.js"]
    tools?: string[];       // ["Tailwind CSS", "SCSS"]
  };
  backend?: {
    languages: string[];    // ["Java", "Python", "Node.js"]
    frameworks: string[];   // ["Spring Boot", "Express", "Django"]
    tools?: string[];       // ["JPA", "MySQL", "PostgreSQL"]
  };
  collaboration: {          // 필수값
    git: string[];          // ["Git", "GitHub", "GitLab"]
    tools?: string[];       // ["PR관리", "코드리뷰", "이슈관리"]
  };
}
```

## 🔧 **기술 스택별 핵심 수칙**

### **Next.js 15 (App Router)**
- ✅ **DO**: `"use client"`는 상태/이벤트 핸들러 사용 시만
- ✅ **DO**: API 라우트는 `route.ts` 파일명 사용
- ❌ **DON'T**: Server Component에서 `useState`, `useEffect` 사용 금지

### **TypeScript (Strict Mode)**
- ✅ **DO**: 모든 API 응답 타입 정의
- ✅ **DO**: enum 타입 활용 (ProjectStatus, InterviewStatus)
- ❌ **DON'T**: 타입 추론에만 의존하지 말고 명시적 타입 선언

### **Prisma ORM**
- ✅ **DO**: 스키마 변경 후 `pnpm prisma generate` 실행
- ✅ **DO**: Json 필드 활용한 유연한 데이터 구조
- ❌ **DON'T**: 트랜잭션 없이 관련 데이터 동시 수정 금지

### **NextAuth.js**
- ✅ **DO**: 모든 보호된 라우트에 세션 체크
- ✅ **DO**: `getServerSession(authOptions)` 사용
- ❌ **DON'T**: 클라이언트에서 직접 토큰 관리 금지

## 🛡️ **필수 검증 체크리스트**

### **코드 작성 중 (DURING)**
- [ ] 모든 변수/함수 타입 정의
- [ ] 사용하지 않는 임포트 즉시 제거
- [ ] 기존 컴포넌트 재사용 우선
- [ ] API 구조 대칭성 확인
- [ ] 3-category techStack 구조 준수

### **커밋 전 (AFTER)**
- [ ] `pnpm typecheck` 에러 없음
- [ ] `pnpm lint` 에러 없음
- [ ] `pnpm build` 성공 확인
- [ ] 런타임 에러 테스트 완료

## 📖 **개발 명령어**
```bash
pnpm dev              # 개발 서버 실행
pnpm build            # 프로덕션 빌드
pnpm typecheck        # TypeScript 타입 검사
pnpm lint             # ESLint 검사
pnpm prisma generate  # Prisma 클라이언트 생성
```

## 🔑 **환경 변수 (필수)**
```env
NEXTAUTH_SECRET=      # NextAuth 시크릿
NEXTAUTH_URL=         # NextAuth URL
GOOGLE_CLIENT_ID=     # Google OAuth
GOOGLE_CLIENT_SECRET= # Google OAuth
OPENROUTER_API_KEY=   # AI API 키
DATABASE_URL=         # PostgreSQL 연결
```

## 📊 **현재 프로젝트 상태**
- **구조 정리**: ✅ 완료 (스파게티 코드 해결, 대칭 구조 완성)
- **기술스택 시스템**: ✅ 완료 (3-category 구조 지원)
- **API 일관성**: ✅ 완료 (projectId 기반 통합)
- **타입 안전성**: ✅ 유지
- **빌드 상태**: ✅ 성공
- **개발 단계**: Phase E (기능 완성 및 최적화 단계)

---

**⚠️ 이 수칙을 위반하면 즉시 수정하고, 모든 작업은 이 문서를 기준으로 진행하세요.**
**📈 현재 상태: 깔끔한 구조 완성, 3-category 기술스택 시스템 완료**