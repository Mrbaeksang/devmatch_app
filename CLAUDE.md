# CLAUDE.md - DevMatch 개발 가이드

## 🎯 프로젝트 개요
**DevMatch**: AI 기반 팀 빌딩 플랫폼  
**기술 스택**: Next.js 15 + TypeScript + Prisma + PostgreSQL + OpenRouter API  
**개발자**: 초보 개발자 (2개월차)

## 🚨 절대 준수사항 (Claude 행동 규칙)

### 1. 초보 개발자 친화적 코딩
- ✅ **모든 코드에 상세한 주석 필수**
- ✅ **새로운 개념 등장 시 간단 설명 포함**
- ✅ **왜 이렇게 코딩하는지 이유 설명**
- ✅ **복잡한 로직은 단계별로 나눠서 설명**
- ❌ **설명 없이 코드만 제공 금지**

### 2. 실무 표준 준수
- ✅ **업계 표준/베스트 프랙티스 우선 적용**
- ✅ **제안 전 표준 방법 조사 필수**
- ✅ **왜 이 방법이 좋은지 명확한 근거 제시**
- ✅ **장기적 관점에서 확장성 고려**
- ❌ **"잘 모르겠다"고 솔직히 말하기**

### 3. 스파게티 코드 방지
- ✅ **기존 구조 변경 시 전체 영향도 분석**
- ✅ **컴포넌트 재사용 우선**
- ✅ **Next.js App Router 표준 구조 준수**
- ✅ **API 라우트 ↔ 페이지 ↔ 타입 간 일관성 유지**
- ❌ **임시방편/땜질식 코딩 금지**

### 4. 타입 안정성
- ✅ **`any` 타입 절대 금지**
- ✅ **모든 props, 함수 파라미터 타입 정의**
- ✅ **`types/` 폴더의 공통 타입 사용**
- ❌ **타입 단언(as) 남용 금지**

### 5. 데이터베이스 안전성
- ✅ **스키마 변경 전 Git 백업 커밋**
- ✅ **기존 데이터 호환성 확인**
- ✅ **불필요한 테이블/컬럼 생성 금지**
- ❌ **데이터 손실 위험 작업 금지**

## 🏗️ Next.js 15 표준 구조

```
app/
├── (auth)/                 # 인증 관련 라우트 그룹
│   ├── login/
│   └── signup/
├── (dashboard)/           # 대시보드 라우트 그룹
│   └── projects/
├── api/                   # API 라우트
│   ├── auth/
│   ├── projects/
│   └── chat/
├── components/            # 재사용 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── forms/            # 폼 관련 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티
├── types/                # 타입 정의
└── hooks/                # 커스텀 훅
```

## 🎯 DevMatch 핵심 플로우
1. **AI 상담** (`/api/chat`) → 프로젝트 아이디어 구체화
2. **프로젝트 생성** (`/api/projects`) → 블루프린트 저장
3. **팀원 모집** (`/projects/[id]`) → 초대 코드 공유
4. **개별 면담** (`/api/projects/[id]/interview`) → 기술 역량 평가
5. **AI 분석** (`/api/projects/[id]/analyze`) → 팀 구성 최적화
6. **팀 채팅** (`/projects/[id]/chat`) → 프로젝트 시작

## 🔧 개발 명령어
```bash
pnpm dev              # 개발 서버
pnpm build            # 빌드
pnpm lint             # ESLint
pnpm typecheck        # 타입 체크
pnpm prisma generate  # Prisma 클라이언트 생성
pnpm prisma studio    # DB 관리
```

## 🔍 디버깅 도구
```bash
node scripts/debug-all.js <프로젝트ID>     # 전체 검증
node scripts/debug-flow.js <프로젝트ID>    # 플로우 검증
```

## 📋 체크리스트

### 코드 작성 전
- [ ] 기존 컴포넌트 재사용 가능한지 확인
- [ ] Next.js 표준 구조에 맞는지 확인
- [ ] 타입 정의가 `types/` 폴더에 있는지 확인

### 코드 작성 중
- [ ] 모든 코드에 주석 추가
- [ ] 새 개념 등장 시 설명 포함
- [ ] 타입 안정성 확보

### 코드 완성 후
- [ ] `pnpm lint` 통과
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm build` 성공
- [ ] 기능 테스트 완료

## 🔗 **웹개발 필수 MCP 서버**

🔥 MCP 서버 기능 & 활용 가이드
1. github
기능: 리포지토리 정보 조회, 이슈/PR 생성 및 머지, 프로젝트 관리.

사용 시기: 터미널 대신 자연어로 "이 PR 머지해줘" 또는 "새 이슈 작성해줘" 등 빠른 리포지토리 조작에 유리.

2. notion
기능: Notion 페이지 읽기·쓰기·생성·업데이트.

사용 시기: 회의록 자동 생성, 기술 문서 작성, AI 기반 문서 업데이트 자동화시 유용.

3. filesystem
기능: 로컬 파일/디렉터리 읽기, 검색, 수정.

사용 시기: 코드베이스 분석, 코드 생성·수정, 프로젝트 구조 탐색 시 적합.

4. exa-search
기능: 내장 웹 검색 + 문서 임베딩 기반 고도화 검색 기능 
LobeHub
+1
GitHub
+1
.

사용 시기: 최신 기술 문서, 코드 샘플, API 리서치가 필요할 때.

5. context-7
기능: 최신 프레임워크 라이브러리 문서 자동 불러오기 .

사용 시기: React, Next.js 같은 라이브러리의 최신 함수/메소드 정보나 코드 예제 확인 필요할 경우.

6. postgre-sql-database-management-server
기능: PostgreSQL DB에 대한 쿼리 실행 및 결과 확인.

사용 시기: 테스트 데이터 조회, 통계, DB 상태 점검 자동화 필요할 때.

7. redis
기능: Redis 캐시/세션 등 데이터 키 조회와 수정.

사용 시기: 세션 문제 분석, 캐시 값 확인 및 실시간 디버깅 필요 시.

8. bright-data
기능: 원격 스크래핑 기반 데이터 추출. Bright Data 플랫폼 활용 
LobeHub
Bright Data
.

사용 시기: 웹사이트에서 동적 데이터 수집, 스크래핑 자동화용.

9. visualization-charts-server
기능: 데이터 기반 시각화 차트 생성.

사용 시기: 트래픽, DB 집계 결과 등 데이터를 보고서형 차트로 바로 시각화할 때.

10. hugeicons-mcp-server
기능: 아이콘 라이브러리 검색 및 삽입.

사용 시기: 프론트엔드 작업 시 필요한 SVG/icon 삽입 자동화.

11. ref-tools
기능: 기술 레퍼런스 문서 제공.

사용 시기: 함수/모듈 reference, 문법 확인이 필요할 때 편리.

12. scrape-graph-mcp-server
기능: 웹 스크래핑과 데이터 그래프 추출.

사용 시기: 특정 페이지에서 데이터 수집 + 정형화된 전달 필요할 때.

13. mem-0-memory-server & memory
기능: 세션 메모리 저장 • 기본 메모리 기능.

사용 시기: 질문-응답 흐름 유지, 대화 맥락 기억 등에서 유용.

14. you-tube-mcp-server
기능: 비디오 메타데이터, 자막, 채널 정보, 트렌드, 스크립트 획득 .

사용 시기: "특정 영상 요약해줘" 또는 "채널 최근 인기 영상 리스트 보여줘" 등에 활용.

📋 요약 테이블
카테고리	MCP 서버	주 사용 시나리오
🎯 Git/문서	github, notion	PR, 이슈, 문서 작업 자동화
🌐 최신 정보	exa-search, context-7, ref-tools	최신 기술 문서 및 API 검색
💾 백엔드 / DB	postgresql, redis	데이터 쿼리, 분석, 디버깅
📊 시각화 / 스크래핑	bright-data, visualization-charts, scrape-graph	보고서/차트 자동 생성
🎨 UI/디자인	hugeicons, you-tube	아이콘 삽입, 영상 정보/자막 처리
🧠 메모 / 상태	memory, mem-0	채팅/세션 맥락 유지

**⚠️ 이 가이드를 위반하지 말고, 초보 개발자가 이해할 수 있도록 친절하게 설명하세요.**
