# DevMatch 페이지 구조 및 기능 정리

## 현재 구현된 페이지

### 1. 메인 페이지 (/)
- **기능**: 랜딩 페이지, 로그인 진입점
- **구성요소**:
  - FuzzyText 효과가 적용된 타이틀
  - 구글/카카오 로그인 버튼
  - BackgroundPaths 애니메이션 배경
- **파일**: `app/page.tsx`, `components/ui/shape-landing-hero.tsx`

### 2. 프로젝트 대시보드 (/projects)
- **기능**: 프로젝트 관리 메인 허브
- **구성요소**:
  - 새 프로젝트 만들기 카드
  - 팀 매칭 AI 카드
  - 내 프로젝트들 카드
  - Bento Grid 레이아웃
- **파일**: `app/projects/page.tsx`

### 3. 새 프로젝트 만들기 (/projects/new)
- **기능**: 새 프로젝트 생성 및 팀원 모집
- **구성요소**: 프로젝트 정보 입력 폼
- **파일**: `app/projects/new/page.tsx`

### 4. 프로젝트 참여 대기 (/projects/join/[inviteCode])
- **기능**: 초대 코드로 프로젝트 참여, 팀원 대기
- **구성요소**:
  - 팀원 모집 중 카드
  - 프로젝트 정보 카드
  - 대기 시간 카드
  - Bento Grid 레이아웃
- **파일**: `app/projects/join/[inviteCode]/page.tsx`

### 5. 채팅 API (/api/chat)
- **기능**: AI 상담 및 팀 빌딩 지원
- **구성요소**: Vercel AI SDK 기반 채팅 API
- **파일**: `app/api/chat/route.ts`

## 향후 개발 예정 페이지

### 1. 내 프로젝트 목록 (/projects/my-projects)
- **기능**: 역할 분담 완료된 프로젝트 목록
- **예상 구성요소**:
  - 참여 중인 프로젝트 카드들
  - 프로젝트 상태 표시 (진행 중, 완료, 대기)
  - 팀원 정보 및 역할 분담 현황
- **우선순위**: 높음

### 2. 프로젝트 상세 페이지 (/projects/[projectId])
- **기능**: 특정 프로젝트의 상세 정보 및 관리
- **예상 구성요소**:
  - 프로젝트 개요 및 목표
  - 팀원 목록 및 역할 분담
  - 진행 상황 추적
  - 파일 공유 및 커뮤니케이션
- **우선순위**: 높음

### 3. AI 면접 페이지 (/projects/[projectId]/interview)
- **기능**: 프로젝트 참여 전 AI 면접 진행
- **예상 구성요소**:
  - 실시간 AI 면접 인터페이스
  - 기술 스택 및 경험 질문
  - 팀 적합성 평가
  - 면접 결과 분석
- **우선순위**: 중간

### 4. 프로필 페이지 (/profile)
- **기능**: 사용자 프로필 관리
- **예상 구성요소**:
  - 기본 정보 수정
  - 기술 스택 및 경험 관리
  - 프로젝트 히스토리
  - 평가 및 피드백
- **우선순위**: 중간

### 5. 팀 빌딩 결과 페이지 (/projects/[projectId]/team-result)
- **기능**: AI 팀 빌딩 결과 확인 및 승인
- **예상 구성요소**:
  - 추천된 팀 구성
  - 각 팀원의 역할 및 책임
  - 팀 시너지 분석
  - 팀 구성 승인/거부
- **우선순위**: 높음

### 6. 대시보드 (/dashboard)
- **기능**: 전체 활동 요약 및 통계
- **예상 구성요소**:
  - 참여 프로젝트 요약
  - 활동 통계
  - 추천 프로젝트
  - 알림 센터
- **우선순위**: 낮음

## 개선 가능성이 있는 페이지

### 1. 프로젝트 찾기 (/projects/discover)
- **기능**: 참여 가능한 프로젝트 검색 및 필터링
- **예상 구성요소**:
  - 프로젝트 검색 및 필터
  - 카테고리별 분류
  - 프로젝트 카드 그리드
  - 즐겨찾기 기능

### 2. 팀원 찾기 (/team-members/find)
- **기능**: 프로젝트에 맞는 팀원 직접 검색
- **예상 구성요소**:
  - 기술 스택 기반 검색
  - 경험 수준 필터
  - 팀원 프로필 카드
  - 초대 발송 기능

### 3. 학습 리소스 (/learning)
- **기능**: 팀워크 및 프로젝트 관리 학습 자료
- **예상 구성요소**:
  - 팀워크 가이드
  - 프로젝트 관리 팁
  - 기술 스택 학습 자료
  - 성공 사례 분석

### 4. 커뮤니티 (/community)
- **기능**: 사용자 간 소통 및 네트워킹
- **예상 구성요소**:
  - 게시판 기능
  - 프로젝트 쇼케이스
  - 질문 및 답변
  - 네트워킹 이벤트

## 기술적 고려사항

### 현재 사용 중인 주요 기술
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **AI**: Vercel AI SDK
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI, Lucide Icons
- **Database**: 미정 (향후 구현 예정)

### 향후 필요한 기술
- **Database**: PostgreSQL 또는 MongoDB
- **Real-time**: WebSocket 또는 Socket.io
- **File Storage**: AWS S3 또는 Vercel Blob
- **Email**: Resend 또는 SendGrid
- **Deployment**: Vercel

## 우선순위 개발 순서

1. **1단계 (즉시 필요)**:
   - `/projects/my-projects` - 내 프로젝트 목록
   - `/projects/[projectId]` - 프로젝트 상세 페이지
   - `/projects/[projectId]/team-result` - 팀 빌딩 결과

2. **2단계 (단기)**:
   - `/projects/[projectId]/interview` - AI 면접
   - `/profile` - 사용자 프로필
   - Database 연동 및 실제 데이터 관리

3. **3단계 (중기)**:
   - `/projects/discover` - 프로젝트 찾기
   - `/team-members/find` - 팀원 찾기
   - Real-time 기능 추가

4. **4단계 (장기)**:
   - `/learning` - 학습 리소스
   - `/community` - 커뮤니티
   - `/dashboard` - 종합 대시보드