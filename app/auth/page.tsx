"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AuthPageContent = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  const handleLogin = (provider: "google" | "kakao") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex w-screen h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-sm p-6">
        <CardHeader className="text-center mb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">AI 팀 빌딩 매니저</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            로그인하고 최고의 팀을 만들어보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-8">
            <Button
              onClick={() => handleLogin("google")}
              className="w-16 h-16 rounded-full flex items-center justify-center p-0 bg-white border border-gray-300 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg"
              aria-label="Google 계정으로 로그인"
            >
              <Image
                src="/images/google-icon.svg"
                alt="Google"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </Button>
            <Button
              onClick={() => handleLogin("kakao")}
              className="w-16 h-16 rounded-full flex items-center justify-center p-0 bg-white border border-gray-300 shadow-md transition-transform duration-200 hover:scale-110 hover:shadow-lg"
              aria-label="Kakao 계정으로 로그인"
            >
              <Image
                src="/images/kakao-icon.svg"
                alt="Kakao"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AuthPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
};

export default AuthPage;
