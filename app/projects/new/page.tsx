"use client";

import React from "react";
import { useRouter } from "next/navigation"; // useRouter 임포트 추가
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useChat } from '@ai-sdk/react'; // lims.txt 지침에 따라 임포트 경로 변경

// Vercel AI SDK의 Message 타입을 명시적으로 임포트
import type { Message as VercelAIMessage } from 'ai';

export default function NewProjectPage() {
  const router = useRouter(); // router 변수 선언
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    initialMessages: [
      { id: '1', role: 'assistant', content: '안녕하세요! 새로운 프로젝트를 시작하시려는군요? 어떤 종류의 프로젝트를 만드시려고 하시나요? (예: 웹 서비스, 모바일 앱, 게임 등)' },
    ],
    onFinish: async (message: VercelAIMessage) => {
      // TODO: AI 상담 완료 조건 및 최종 프로젝트 생성 로직 구현 (다음 단계에서)
      // 현재는 임시로 마지막 AI 메시지에 "상담 완료"가 포함되면 완료로 간주
      // 실제 구현에서는 AI 응답을 파싱하여 구조화된 데이터를 추출해야 합니다.
      if (message.content.includes("상담 완료")) {
        toast.success("프로젝트 초기 설정이 완료되었습니다!");

        // 프로젝트 목표 및 상담 데이터 추출 (임시 로직)
        // 실제 구현에서는 AI 응답을 파싱하여 구조화된 데이터를 추출해야 합니다.
        // 여기서는 간단하게 마지막 사용자 메시지를 목표로, 전체 대화 내용을 상담 데이터로 사용합니다.
        const projectGoal = messages.filter(msg => msg.role === 'user').pop()?.content || "AI 상담을 통한 프로젝트 목표";
        const consultationData = messages.map(msg => ({ role: msg.role, content: msg.content }));

        try {
          const response = await fetch('/api/projects/initial-setup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectGoal, consultationData }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '프로젝트 초기 설정 저장 실패');
          }

          const newProject = await response.json();
          toast.success("프로젝트 초기 정보가 성공적으로 저장되었습니다!");
          router.push(`/projects/${newProject.id}/invite`); // 다음 단계로 리다이렉트 (팀원 초대 페이지)

        } catch (error) {
          console.error("프로젝트 초기 설정 저장 오류:", error);
          toast.error(`프로젝트 초기 설정 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
        }
      }
    },
    onError: (error: Error) => {
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
            {messages.map((msg: VercelAIMessage) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === "user"
                      ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-800"}`}
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