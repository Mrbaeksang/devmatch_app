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

### **3. 파일 간 의존성 관리**
- ✅ **MUST**: `pages.md` 참조하여 파일 관계 파악
- ✅ **MUST**: 기존 구조 변경 시 영향도 분석
- ✅ **MUST**: API 라우트 ↔ 페이지 ↔ 타입 간 일관성 유지

## 🎯 **DevMatch 특화 규칙**

### **AI 상담 시스템 (api/chat/route.ts)**
- ✅ **DO**: ConsultationStep 단계별 강제 제어
- ✅ **DO**: OpenRouter API 응답 파싱 후 검증
- ✅ **DO**: 상담 데이터 타입 안정성 확보
- ❌ **DON'T**: AI에게 상태 전이 제어권 위임 금지

### **프로젝트 데이터 플로우**
```
ConsultationData (types/chat.ts) → ProjectBlueprint (types/project.ts) → Database
```
- ✅ **DO**: 각 단계별 타입 변환 명확히
- ✅ **DO**: 배열/문자열 타입 충돌 방지 (techStack 주의)
- ✅ **DO**: 데이터베이스 스키마와 코드 동기화

### **실시간 업데이트 시스템**
- ✅ **DO**: 폴링 기반 상태 업데이트 (5초 간격)
- ✅ **DO**: 프로젝트 상태별 UI 조건부 렌더링
- ✅ **DO**: 사용자 권한별 기능 제한

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
- ✅ **DO**: 관계형 데이터는 `include` 또는 `select` 명시
- ❌ **DON'T**: 트랜잭션 없이 관련 데이터 동시 수정 금지

### **NextAuth.js**
- ✅ **DO**: 모든 보호된 라우트에 세션 체크
- ✅ **DO**: `getServerSession(authOptions)` 사용
- ❌ **DON'T**: 클라이언트에서 직접 토큰 관리 금지

## 🛡️ **필수 검증 체크리스트**

### **파일 수정 전 (BEFORE)**
- [ ] `pages.md` 참조하여 파일 역할 파악
- [ ] 기존 타입 정의 `types/` 폴더에서 확인
- [ ] 유사한 기능 구현체 검색
- [ ] 데이터 플로우 영향도 분석

### **코드 작성 중 (DURING)**
- [ ] 모든 변수/함수 타입 정의
- [ ] 사용하지 않는 임포트 즉시 제거
- [ ] 기존 컴포넌트 재사용 우선
- [ ] 에러 핸들링 코드 포함

### **커밋 전 (AFTER)**
- [ ] `pnpm lint` 에러 없음
- [ ] `pnpm typecheck` 에러 없음
- [ ] `pnpm build` 성공 확인
- [ ] 런타임 에러 테스트 완료

## ⚡ **성능 최적화 & 디자인 시스템**

### **UI/UX 일관성**
- **색상**: zinc 컬러 팔레트 통일 사용
- **레이아웃**: BentoGrid 기반 카드 시스템
- **애니메이션**: Framer Motion variants 패턴
- **반응형**: 모바일 우선 (`md:`, `lg:`)

### **성능 최적화**
- **번들 최적화**: 불필요한 의존성 제거
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 분할**: 동적 import 적극 활용

## 📖 **개발 명령어**
```bash
pnpm dev              # 개발 서버 실행
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint 검사
pnpm typecheck        # TypeScript 타입 검사
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

---

**⚠️ 이 수칙을 위반하면 즉시 수정하고, 모든 작업은 이 문서를 기준으로 진행하세요.**
**📊 현재 상태: Phase D (테스트 및 안정성 개선 단계)**