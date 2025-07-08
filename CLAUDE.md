# CLAUDE.md

DevMatch - AI 팀 빌딩 매니저 (Next.js 15 + TypeScript + Prisma + OpenRouter)

## 개발 명령어
- `npm run dev` - 개발 서버 실행
- `npm run build` - 빌드 (prisma generate 포함)  
- `npm run lint` - ESLint 검사
- `prisma db push` - DB 스키마 동기화

## 현재 상태 (2025-01-08)
✅ **완료**: OAuth 로그인, AI 상담 기능, DB 스키마
🔄 **진행중**: 팀원 초대 기능 
⏳ **대기**: AI 인터뷰, 역할 추천

## 핵심 파일들
- `app/api/chat/route.ts` - AI 상담 API (OpenRouter + deepseek-chat-v3)
- `app/projects/new/page.tsx` - AI 상담 UI (단계별 진행)
- `lib/auth.ts` - NextAuth 설정 (Google/Kakao OAuth)
- `prisma/schema.prisma` - DB 스키마 (User, Project, ProjectMember 등)

## 중요 컨벤션
1. **TypeScript 엄격 모드**: `any` 타입 지양, 기존 타입 정의 활용
2. **기존 파일 확인**: 수정 전 반드시 파일 내용 읽고 패턴 따르기
3. **Prisma 모델 우선**: DB 관련 타입은 schema.prisma 기준
4. **AI 모델 고정**: `deepseek-chat-v3-0324:free` 절대 변경 금지
5. **shadcn/ui 사용**: 일관된 UI 컴포넌트 활용

## UI/UX 디자인 표준 (배포 가능한 수준)

### 🎨 핵심 디자인 철학
- **기존 템플릿/디자인 클론 활용**: 직접 디자인보다는 잘 짜여진 디자인 시스템 복제
- **shadcn/ui 적극 활용**: 모든 컴포넌트에서 shadcn/ui 우선 사용
- **일관된 디자인 시스템**: 컬러, 타이포그래피, 간격 체계 통일
- **현대적 UI**: 그라데이션, 블러 효과, 부드러운 그림자 활용

### 🛠️ 권장 디자인 리소스
- **UI 템플릿**: shadcn/ui examples, Tailwind UI, Headless UI
- **디자인 시스템**: Vercel Design System, GitHub Primer, Stripe
- **컬러 팔레트**: Tailwind CSS 기본 색상 체계
- **아이콘**: Lucide React (이미 설치됨)
- **폰트**: Inter (Google Fonts)

### 📋 필수 구현 요소
- **Navigation**: 깔끔한 헤더 + 사이드바 (필요시)
- **Cards**: 모든 콘텐츠를 카드 형태로 구성
- **Buttons**: 다양한 variant (primary, secondary, outline, ghost)
- **Forms**: 적절한 validation + 에러 메시지
- **Loading States**: 스켈레톤 UI, 스피너, 프로그래스 바
- **Modals/Dialogs**: shadcn/ui Dialog 컴포넌트 활용
- **Toasts**: 성공/에러 알림 (sonner 라이브러리)

### 🚫 피해야 할 것들
- 직접 CSS 작성 (Tailwind CSS만 사용)
- 일관성 없는 간격 (spacing scale 준수)
- 촌스러운 색상 조합
- 접근성 무시

## 학습 목표
- 사용자가 학습하면서 프로젝트 완성을 원함
- ORDER.md 통해 단계별 가이드 제공
- 직접 구현보다는 설명과 함께 학습 지원

## 환경변수 필수
```
DATABASE_URL="postgresql://..."
OPENROUTER_API_KEY="sk-..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
KAKAO_CLIENT_ID="..."
KAKAO_CLIENT_SECRET="..."
NEXTAUTH_SECRET="..."
```

## 다음 구현 목표
1. 초대 링크 생성/관리 API (`app/api/projects/[projectId]/invite/route.ts`)
2. 초대 수락 페이지 (`app/projects/join/[inviteCode]/page.tsx`)  
3. AI 인터뷰 기능
4. 역할 추천 대시보드