"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useChat } from 'ai/react'; // Vercel AI SDK의 useChat 훅 임포트

export default function NewProjectPage() {
  const router = useRouter();
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat', // AI 모델과의 통신을 처리할 API 라우트 (다음 단계에서 구현 예정)
    initialMessages: [
      { id: '1', role: 'assistant', content: '안녕하세요! 새로운 프로젝트를 시작하시려는군요? 어떤 종류의 프로젝트를 만드시려고 하시나요? (예: 웹 서비스, 모바일 앱, 게임 등)' },
    ],
    onFinish: (message) => {
      // TODO: AI 상담 완료 조건 및 최종 프로젝트 생성 로직 구현 (다음 단계에서)
      // 예시: 특정 키워드(예: "상담 완료")가 포함되면 다음 단계로 이동
      // if (message.content.includes("상담 완료")) {
      //   toast.success("프로젝트 초기 설정이 완료되었습니다!");
      //   router.push("/projects");
      // }
    },
    onError: (error) => {
      console.error("AI 상담 중 오류 발생:", error);
      toast.error("AI 상담 중 오류가 발생했습니다.");
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Card className="flex flex-col flex-grow m-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">새 프로젝트 시작하기 (AI 상담)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-4 overflow-hidden">
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-100 rounded-lg shadow-inner">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === "user"
                      ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}
                  `}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-800">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex p-4 border-t bg-white rounded-b-lg">
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="AI에게 메시지를 입력하세요..."
              className="flex-grow mr-2"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "전송"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}