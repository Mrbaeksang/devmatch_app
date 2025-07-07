## `app/auth/page.tsx` 파일 수정 요청 (재요청)

### 문제 설명
`pnpm run build` 실행 시 `/auth` 페이지에서 `useSearchParams()` 훅 사용으로 인한 빌드 오류가 계속 발생하고 있습니다. Next.js에서는 `useSearchParams`와 같은 클라이언트 전용 훅을 서버 컴포넌트나 정적 생성 페이지에서 사용할 때 `Suspense` 경계로 감싸야 합니다. 현재 `app/auth/page.tsx`는 클라이언트 컴포넌트이지만, 빌드 과정에서 문제가 발생하고 있습니다.

### 해결 방안
`app/auth/page.tsx` 파일의 `AuthPage` 컴포넌트를 `Suspense`로 감싸서 `useSearchParams` 훅이 클라이언트 측에서만 실행되도록 지연시킵니다. 이를 위해 기존 `AuthPage` 컴포넌트의 이름을 `AuthPageContent`로 변경하고, 새로운 `AuthPage` 컴포넌트가 `AuthPageContent`를 `Suspense`로 감싸도록 수정합니다.

### 작업 내용
아래 코드를 참고하여 `app/auth/page.tsx` 파일을 수정해주세요.

```typescript
// app/auth/page.tsx

"use client";

import React, { Suspense } from "react"; // Suspense import 추가
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

// 기존 AuthPage 컴포넌트의 이름을 AuthPageContent로 변경
const AuthPageContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  const handleLogin = (provider: "google" | "kakao") => {
    signIn(provider, { callbackUrl });
  };

  return (
    // 전체 화면을 채우고 내용을 중앙에 배치 (배경색 적용)
    <div className="flex w-screen h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm p-6"> {/* 카드 컴포넌트로 감싸고 패딩 추가 */}
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">AI 팀 빌딩 매니저</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            로그인하고 최고의 팀을 만들어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 버튼들을 가로로 배치하고 중앙 정렬하며 간격 조절 */}
          <div className="flex justify-center space-x-8"> {/* 간격을 적절히 조절 */}

            {/* Google 로그인 버튼 */}
            <Button
              onClick={() => handleLogin("google")}
              // 크기를 64px (w-16 h-16)로 정상화, 원형, 호버 효과 적용
              className="w-16 h-16 rounded-full flex items-center justify-center p-0 bg-white border border-gray-300 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg"
              aria-label="Google 계정으로 로그인"
            >
              <Image
                src="/images/google-icon.svg" // 구글 아이콘 이미지 경로
                alt="Google"
                width={40} // 이미지 크기 조절
                height={40}
                className="w-10 h-10 object-contain" // 이미지 크기 조절
              />
            </Button>

            {/* Kakao 계정으로 로그인 버튼 */}
            <Button
              onClick={() => handleLogin("kakao")}
              // 크기를 64px (w-16 h-16)로 정상화, 원형, 호버 효과 적용
              className="w-16 h-16 rounded-full flex items-center justify-center p-0 bg-white border border-gray-300 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg"
              aria-label="Kakao 계정으로 로그인"
            >
              <Image
                src="/images/kakao-icon.svg" // 카카오 아이콘 이미지 경로
                alt="Kakao"
                width={40} // 이미지 크기 조절
                height={40}
                className="w-10 h-10 object-contain" // 이미지 크기 조절
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// 새로운 AuthPage 컴포넌트가 AuthPageContent를 Suspense로 감쌈
const AuthPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}> {/* Suspense fallback 추가 */}
      <AuthPageContent />
    </Suspense>
  );
};

export default AuthPage;
```

### 작업 완료 후
파일 수정이 완료되면 저에게 알려주세요. 제가 빌드를 다시 시도하여 오류가 해결되었는지 확인하겠습니다.

### Git 커밋 명령어
```bash
git add . && git commit -m "Fix: 빌드 오류 해결 - auth 페이지 useSearchParams Suspense 처리" && git push
```