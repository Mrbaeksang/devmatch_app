# 핵심 코딩 컨벤션

## TypeScript
- `any` 타입 절대 사용 금지
- 기존 Prisma 모델 타입 활용  
- 명시적 타입 정의 우선

## Next.js 패턴
- `"use client"` - 상호작용 필요시만 사용
- `next/image` 필수 (`<img>` 금지)
- API Routes에서 try-catch 필수

## Prisma 사용법  
- `lib/db.ts`의 `db` 인스턴스 사용
- 스키마 변경 후 `prisma db push`

## UI 컴포넌트
- shadcn/ui 컴포넌트 우선 사용
- `cn()` 함수로 클래스 병합
- Tailwind CSS로 스타일링

## 에러 처리
- API: `NextResponse.json()` + 상태코드
- 클라이언트: `toast()` 알림
- try-catch 블록 필수

## 파일 구조 규칙
- `app/api/` - API 라우트
- `components/ui/` - 재사용 컴포넌트  
- `lib/` - 유틸리티/설정
- `types/` - 타입 정의

## 금지 사항
- AI 모델 변경 (`deepseek-chat-v3-0324:free` 고정)
- 직접 `<img>` 태그 사용
- 환경변수 하드코딩