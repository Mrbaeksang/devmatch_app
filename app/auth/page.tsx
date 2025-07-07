// app/auth/page.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const AuthPage = () => {
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

export default AuthPage;