"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AuthContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">DevMatch 로그인</CardTitle>
          <p className="text-muted-foreground">팀 빌딩을 시작해보세요</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full"
            variant="outline"
          >
            Google로 로그인
          </Button>
          <Button
            onClick={() => signIn("kakao", { callbackUrl })}
            className="w-full"
            variant="outline"
          >
            Kakao로 로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

const AuthPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
};

export default AuthPage;