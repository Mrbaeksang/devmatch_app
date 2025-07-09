# 🎯 DevMatch 프로젝트 최종 구조 (Annotated Directory Tree)

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

---

```
devmatch-app/
├─ app/ // Next.js 15 App Router 기반 메인 앱
│  ├─ api/ // 백엔드 API 엔드포인트 모음
│  │  ├─ auth/[...nextauth]/route.ts // NextAuth 인증 처리, 모든 로그인 플로우 관리
│  │  ├─ chat/route.ts // AI 상담 채팅 API, DeepSeek 연동, /projects/new에서 호출
│  │  ├─ projects/
│  │  │  ├─ route.ts // 프로젝트 CRUD, 목록 조회/생성, /projects 페이지 데이터 제공
│  │  │  ├─ initial-setup/route.ts // 초기 프로젝트 생성, AI 상담 완료 후 호출
│  │  │  ├─ [projectId]/
│  │  │  │  ├─ route.ts // 개별 프로젝트 조회/수정, 프로젝트 상세 페이지 데이터
│  │  │  │  ├─ invite/route.ts // 초대링크 생성/검증, 팀원 모집 시스템
│  │  │  │  ├─ join/route.ts // 팀원 참여 처리, 대기실 상태 업데이트
│  │  │  │  ├─ members/route.ts // 팀원 목록/상태 관리, 실시간 업데이트
│  │  │  │  └─ chat/route.ts // 팀 채팅 메시지 처리, WebSocket 연동
│  │  │  └─ ai/roles/route.ts // AI 역할 제안, 팀 구성 최적화
│  │  ├─ users/
│  │  │  ├─ route.ts // 사용자 프로필 CRUD
│  │  │  ├─ [userId]/route.ts // 개별 사용자 정보
│  │  │  └─ search/route.ts // 사용자 검색, 팀원 매칭 시스템
│  │  └─ upload/route.ts // 파일 업로드, 프로필 이미지/포트폴리오
│  ├─ (auth)/ // 인증 관련 페이지 그룹
│  │  ├─ login/page.tsx // 로그인 페이지, auth-options-card 사용
│  │  └─ register/page.tsx // 회원가입 페이지
│  ├─ projects/ // 프로젝트 관련 페이지 그룹
│  │  ├─ page.tsx // 프로젝트 허브, BentoGrid 기반 대시보드
│  │  ├─ new/page.tsx // AI 개인 상담, ExpandableChat 구조
│  │  ├─ my-projects/page.tsx // 내 프로젝트 목록, 필터링/정렬 기능
│  │  ├─ join/[inviteCode]/page.tsx // 팀 대기실, 실시간 상태 업데이트
│  │  └─ [projectId]/
│  │     ├─ page.tsx // 프로젝트 상세, 팀 채팅 + 관리 도구
│  │     ├─ settings/page.tsx // 프로젝트 설정, 권한 관리
│  │     └─ analytics/page.tsx // 프로젝트 분석, AI 인사이트
│  ├─ profile/ // 사용자 프로필 관리
│  │  ├─ page.tsx // 프로필 조회/수정
│  │  ├─ portfolio/page.tsx // 포트폴리오 관리
│  │  └─ settings/page.tsx // 계정 설정
│  ├─ layout.tsx // 전역 레이아웃, SessionProvider 적용
│  ├─ page.tsx // 홈페이지, FuzzyText + 로그인 진입점
│  └─ providers.tsx // Context 제공자들 (Auth, Theme, Socket)
├─ components/ // 재사용 가능한 컴포넌트 모음
│  ├─ ui/ // 기본 UI 컴포넌트 (Radix UI 기반)
│  │  ├─ expandable-chat.tsx // 채팅 레이아웃 시스템, 모든 대화형 페이지 기본
│  │  ├─ chat-bubble.tsx // 메시지 표시, AI 상담 + 팀 채팅에서 사용
│  │  ├─ animated-modal.tsx // 21st.dev 모달, 프로젝트 생성 확인 등
│  │  ├─ project-modal.tsx // 프로젝트 전용 모달, 생성/수정 시 사용
│  │  ├─ background-paths.tsx // 애니메이션 배경, 모든 페이지 공통 적용
│  │  ├─ bento-grid.tsx // 카드 레이아웃, 대시보드 + 목록 페이지
│  │  └─ ... (기타 UI 컴포넌트들)
│  ├─ common/ // 공통 비즈니스 로직 컴포넌트
│  │  ├─ LoadingSpinner.tsx // 로딩 상태, 모든 비동기 작업에 사용
│  │  ├─ ErrorBoundary.tsx // 에러 처리, 페이지 레벨 에러 관리
│  │  └─ Navbar.tsx // 네비게이션, 인증 상태 기반 메뉴
│  ├─ project/ // 프로젝트 특화 컴포넌트
│  │  ├─ ProjectCard.tsx // 프로젝트 카드, 목록/대시보드에서 사용
│  │  ├─ ProjectForm.tsx // 프로젝트 생성/수정 폼
│  │  ├─ TeamMemberList.tsx // 팀원 목록, 상태 표시
│  │  ├─ InviteCodeInput.tsx // 초대링크 공유 UI
│  │  └─ ProjectProgress.tsx // 진행률 표시, 실시간 업데이트
│  ├─ chat/ // 채팅 관련 컴포넌트
│  │  ├─ ChatRoom.tsx // 팀 채팅방, WebSocket 연동
│  │  ├─ MessageInput.tsx // 메시지 입력, 파일 첨부 지원
│  │  └─ TypingIndicator.tsx // 입력 중 표시
│  └─ hooks/ // 커스텀 훅 모음
│     ├─ use-project.ts // 프로젝트 상태 관리, CRUD 작업
│     ├─ use-chat.ts // 채팅 기능, 메시지 송수신
│     ├─ use-auth.ts // 인증 상태, 로그인/로그아웃
│     ├─ use-socket.ts // WebSocket 연결, 실시간 통신
│     └─ use-auto-scroll.ts // 채팅 자동 스크롤
├─ lib/ // 유틸리티 및 설정 모음
│  ├─ auth.ts // NextAuth 설정, OAuth 제공자 관리
│  ├─ db.ts // 데이터베이스 연결, Prisma 클라이언트
│  ├─ socket.ts // WebSocket 서버/클라이언트 설정
│  ├─ utils.ts // 공통 유틸리티 함수 (cn, 날짜 포맷 등)
│  ├─ api-client.ts // API 호출 래퍼, 에러 처리 포함
│  └─ constants.ts // 상수 정의, 설정값 관리
├─ types/ // TypeScript 타입 정의
│  ├─ project.ts // 프로젝트 관련 타입, 모든 프로젝트 기능에서 참조
│  ├─ user.ts // 사용자 관련 타입, 인증 + 프로필 시스템
│  ├─ api.ts // API 응답 타입, 백엔드 통신 표준화
│  ├─ chat.ts // 채팅 관련 타입, 실시간 메시징
│  └─ next-auth.d.ts // NextAuth 타입 확장
├─ prisma/ // 데이터베이스 스키마 및 마이그레이션
│  ├─ schema.prisma // DB 스키마 정의, 모든 데이터 구조 관리
│  ├─ migrations/ // DB 마이그레이션 파일들
│  └─ seed.ts // 초기 데이터 생성
├─ public/ // 정적 파일 (이미지, 아이콘)
└─ docs/ // 프로젝트 문서
   ├─ CLAUDE.md // 개발 가이드라인, 코딩 표준
   ├─ API.md // API 문서
   └─ DEPLOYMENT.md // 배포 가이드
```

## 🎯 **핵심 데이터 흐름**

**1. 사용자 플로우**: 홈페이지 → 로그인 → 프로젝트 허브 → AI 상담 → 팀 모집 → 프로젝트 진행
**2. API 플로우**: 클라이언트 → API 라우트 → Prisma → PostgreSQL
**3. 실시간 플로우**: 클라이언트 → WebSocket → 다른 클라이언트들

## 🔧 **현재 구현 상태**

✅ **완료**: 기본 UI 시스템, AI 상담, 팀 대기실, 프로젝트 상세 페이지, 타입 정의
🔄 **진행 중**: 백엔드 API 완성, 실시간 기능, 데이터베이스 연동
⏳ **예정**: 사용자 프로필, 프로젝트 설정, 분석 기능

## 🎯 **베타 버전 완성 목표**

- AI 개인 상담 → 프로젝트 생성
- 초대링크 공유 → 팀원 모집
- 실시간 팀 채팅
- 프로젝트 진행률 추적
- 완전한 팀 빌딩 플로우

---

## 📋 **작업 기록 (Development Log)**

### **2025-01-09 작업 진행**

#### **📊 현재 vs 목표 구조 비교 분석**

**✅ 이미 구현된 파일들:**
```
app/
├─ api/
│  ├─ auth/[...nextauth]/route.ts ✅ // NextAuth OAuth 인증 처리
│  ├─ chat/route.ts ✅ // AI 상담 채팅 API (DeepSeek)
│  └─ projects/
│     ├─ initial-setup/route.ts ✅ // 프로젝트 초기 생성 API
│     ├─ ai/roles/route.ts ✅ // AI 역할 추천 API
│     └─ [projectId]/invite/route.ts ✅ // 초대링크 관련 API
├─ projects/
│  ├─ page.tsx ✅ // 프로젝트 허브 대시보드 (BentoGrid)
│  ├─ new/page.tsx ✅ // AI 개인 상담 페이지 (ExpandableChat)
│  ├─ my-projects/page.tsx ✅ // 내 프로젝트 목록 (하드코딩 데이터)
│  ├─ join/[inviteCode]/page.tsx ✅ // 팀 대기실 (실시간 상태)
│  └─ [projectId]/page.tsx ✅ // 프로젝트 상세+팀채팅
├─ auth/page.tsx ✅ // 로그인 페이지 (AuthOptionsCard)
├─ layout.tsx ✅ // 전역 레이아웃 + SessionProvider
├─ page.tsx ✅ // 홈페이지 (FuzzyText + BackgroundPaths)
└─ providers.tsx ✅ // Context 제공자 래퍼

components/
├─ ui/ ✅ // 기본 UI 컴포넌트들 (Button, Card, Dialog 등)
│  ├─ expandable-chat.tsx ✅ // 채팅 레이아웃 시스템
│  ├─ chat-bubble.tsx ✅ // 메시지 버블 컴포넌트
│  ├─ background-paths.tsx ✅ // 애니메이션 배경
│  ├─ bento-grid.tsx ✅ // 카드 레이아웃 시스템
│  └─ project-modal.tsx ✅ // 프로젝트 모달 (Dialog 기반)
├─ common/LoadingSpinner.tsx ✅ // 로딩 스피너
├─ project/ProjectCard.tsx ✅ // 프로젝트 카드 컴포넌트
└─ project/ProjectForm.tsx ✅ // 프로젝트 폼 컴포넌트

types/
├─ project.ts ✅ // 프로젝트 관련 타입 정의
├─ user.ts ✅ // 사용자 관련 타입 정의
├─ api.ts ✅ // API 응답 타입 정의
├─ chat.ts ✅ // 채팅 관련 타입 정의
└─ next-auth.d.ts ✅ // NextAuth 타입 확장

lib/
├─ auth.ts ✅ // NextAuth 설정
├─ db.ts ✅ // Prisma 클라이언트
├─ utils.ts ✅ // 유틸리티 함수
├─ api-client.ts ✅ // API 호출 통합 클라이언트
└─ constants.ts ✅ // 프로젝트 상수 정의

prisma/
└─ schema.prisma ✅ // DB 스키마 (업데이트됨)
```

**❌ 구현 필요한 파일들:**
```
app/api/
├─ projects/route.ts ❌ // 프로젝트 목록 조회/생성 API
├─ projects/[projectId]/route.ts ❌ // 개별 프로젝트 CRUD API
├─ projects/[projectId]/join/route.ts ❌ // 프로젝트 참여 처리 API
├─ projects/[projectId]/members/route.ts ❌ // 팀원 관리 API
├─ projects/[projectId]/chat/route.ts ❌ // 팀 채팅 메시지 API
├─ users/route.ts ❌ // 사용자 프로필 CRUD API
├─ users/[userId]/route.ts ❌ // 개별 사용자 정보 API
├─ users/search/route.ts ❌ // 사용자 검색 API
└─ upload/route.ts ❌ // 파일 업로드 API

app/
├─ (auth)/login/page.tsx ❌ // 전용 로그인 페이지
├─ (auth)/register/page.tsx ❌ // 회원가입 페이지
├─ projects/[projectId]/settings/page.tsx ❌ // 프로젝트 설정 페이지
├─ projects/[projectId]/analytics/page.tsx ❌ // 프로젝트 분석 페이지
├─ profile/page.tsx ❌ // 사용자 프로필 페이지
├─ profile/portfolio/page.tsx ❌ // 포트폴리오 관리 페이지
└─ profile/settings/page.tsx ❌ // 계정 설정 페이지

components/
├─ common/ErrorBoundary.tsx ❌ // 에러 바운더리 컴포넌트
├─ common/Navbar.tsx ❌ // 네비게이션 바 (간단 구현)
├─ project/TeamMemberList.tsx ❌ // 팀원 목록 컴포넌트
├─ project/InviteCodeInput.tsx ❌ // 초대링크 입력 컴포넌트
├─ project/ProjectProgress.tsx ❌ // 프로젝트 진행률 컴포넌트
├─ chat/ChatRoom.tsx ❌ // 팀 채팅방 컴포넌트
├─ chat/MessageInput.tsx ❌ // 메시지 입력 컴포넌트
├─ chat/TypingIndicator.tsx ❌ // 타이핑 인디케이터
└─ hooks/
    ├─ use-project.ts ❌ // 프로젝트 상태 관리 훅
    ├─ use-chat.ts ❌ // 채팅 기능 훅
    ├─ use-auth.ts ❌ // 인증 상태 훅
    └─ use-socket.ts ❌ // WebSocket 연결 훅

lib/
├─ socket.ts ❌ // WebSocket 서버/클라이언트
└─ prisma/seed.ts ❌ // 초기 데이터 생성
```

#### **🎯 우선순위 작업 계획**

**Phase 1: 핵심 API 구현 (2-3시간)**
1. `app/api/projects/route.ts` - 프로젝트 CRUD
2. `app/api/projects/[projectId]/route.ts` - 개별 프로젝트 관리
3. `app/api/projects/[projectId]/members/route.ts` - 팀원 관리
4. `lib/api-client.ts` - API 호출 통합 클라이언트
5. Prisma 스키마 업데이트

**Phase 2: 실시간 기능 (2-3시간)**
1. `lib/socket.ts` - WebSocket 설정
2. `app/api/projects/[projectId]/chat/route.ts` - 채팅 API
3. `components/chat/ChatRoom.tsx` - 채팅 컴포넌트
4. `components/hooks/use-socket.ts` - WebSocket 훅

**Phase 3: 사용자 관리 (1-2시간)**
1. `app/api/users/route.ts` - 사용자 CRUD
2. `app/profile/page.tsx` - 프로필 페이지
3. `components/hooks/use-auth.ts` - 인증 훅

**Phase 4: 최종 정리 (1시간)**
1. 에러 처리 및 로딩 상태 개선
2. 타입 안정성 확보
3. 빌드 테스트 및 배포 준비

---

### **⏰ 작업 진행 상황**

**[2025-01-08 23:30] 작업 시작**
- TO_CLAUDE.md 구조 분석 및 개발 가이드라인 설정 완료
- 현재 프로젝트 상태 vs 목표 구조 gap 분석 완료
- 우선순위 작업 계획 수립 완료

**[2025-01-09 01:45] ProjectModal 수정 완료**
- `components/ui/project-modal.tsx` Dialog 컴포넌트로 변경 완료
- animated-modal 의존성 제거, Radix UI Dialog 사용
- 어두운 테마 일관성 유지 (zinc 컬러 팔레트)
- Framer Motion 애니메이션 유지

**[2025-01-09 02:00] API 에러 수정 & AI 질문 로직 개선 완료**
- `app/api/projects/initial-setup/route.ts` 500 에러 해결
  - description 필드 누락 문제 수정 (Prisma 스키마 필수 필드)
  - status 'PENDING' → 'RECRUITING' 변경
- AI 상담 질문 로직 대폭 개선:
  - 진행률 바: 5단계 → 8단계로 확장 (60% 멈춤 문제 해결)
  - 질문 순서 개선: 프로젝트 목표 → **구현 범위** → 기술 스택 → 핵심 기능 → **프로젝트 기간** → 팀원 수
  - 예산 질문 제거 (학생 프로젝트에 부적절)
  - 프론트엔드/백엔드 구현 범위 질문 추가
  - 프로젝트 기간 질문 추가
- 타입 정의 업데이트:
  - `types/chat.ts`에 ConsultationData 인터페이스 확장
  - projectScope, projectDuration 필드 추가

**[2025-01-09 02:15] Foreign Key 오류 & AI 로직 대대적 수정 완료**

**1. Foreign Key Constraint 오류 해결:**
- 문제: NextAuth JWT strategy + PrismaAdapter 조합으로 User 데이터 미생성
- 해결: `lib/auth.ts` session strategy를 "jwt" → "database"로 변경
- 결과: OAuth 로그인 시 User, Account, Session 테이블이 자동 관리됨

**2. AI 질문 로직 대대적 단순화:**
- 기존: 8~10개 복잡한 질문 (게시판 종류, 구현 범위, 역할 분담 등)
- 변경: **핵심 6개 정보만 수집**
  1. 이름 → 2. 프로젝트명 → 3. 목표 → 4. 기술 스택 → 5. 기간 → 6. 팀원 수
- 제거된 질문들: 구현 범위, 게시판 종류, 역할 분담, 추가 요청사항
- 진행률 바: 8단계 → 6단계로 단순화

**3. 데이터 매핑 문제 해결:**
- AI가 `duration: '2주'`로 저장 → UI에서 `projectDuration` 찾아서 "미정" 표시
- 해결: 하위 호환성 추가 (`duration` OR `projectDuration` 모두 인식)
- 타입 정의에 `duration?: string` 필드 추가

**4. 모달 정보 최적화:**
- 기존: 팀원수, 예상기간, 구현범위, 기술스택
- 변경: 팀원수, 예상기간, 기술스택, 프로젝트목표

**[2025-01-09 02:30] 스파게티 코드 구조 정리 완료**

**발견된 문제들:**
1. **중복 API 파일**: `app/projects/[projectId]/invite/route.ts`가 잘못된 위치에 있었음
2. **API 구조 불일치**: 페이지 폴더에 API 파일이 섞여있음  
3. **Prisma 오류**: `app/api/projects/route.ts`에서 description 필드 누락

**정리 완료:**
1. ✅ 중복 파일 제거 및 올바른 위치로 정리
2. ✅ description 필드 추가로 Prisma 오류 해결
3. ✅ TypeScript 타입 오류 수정 (전역 ConsultationData 타입 사용)

**현재 깔끔한 구조:**
```
API 구조:
app/api/projects/
├─ route.ts                    ✅ 프로젝트 CRUD
├─ initial-setup/route.ts      ✅ 초기 생성  
├─ [projectId]/invite/route.ts ✅ 초대링크 API
└─ ai/roles/route.ts           ✅ AI 역할 추천

페이지 구조:
app/projects/
├─ page.tsx                    ✅ 프로젝트 허브
├─ new/page.tsx                ✅ 새 프로젝트
├─ my-projects/page.tsx        ✅ 내 프로젝트  
├─ join/[inviteCode]/page.tsx  ✅ 팀 대기실
└─ [projectId]/page.tsx        ✅ 프로젝트 상세
```

**[다음 테스트 항목]**
1. 기존 로그인 세션 삭제 후 재로그인 (NextAuth 설정 변경으로 인해)
2. AI 상담 진행 (6개 질문만 나오는지 확인)
3. 진행률 바가 100%까지 올라가는지 확인
4. 모달에 "2주" 기간 정보가 정상 표시되는지 확인
5. 프로젝트 생성 성공 및 팀 대기실 이동 확인