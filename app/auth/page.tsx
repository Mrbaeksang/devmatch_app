"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import React from "react";

const AuthPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/projects";

  const handleLogin = (provider: "google" | "kakao") => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          AI 팀 빌딩 매니저
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          로그인하고 최고의 팀을 만들어보세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <Button
              className="w-full"
              onClick={() => handleLogin("google")}
            >
              Google 계정으로 로그인
            </Button>
            <Button
              className="w-full bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
              onClick={() => handleLogin("kakao")}
            >
              Kakao 계정으로 로그인
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
