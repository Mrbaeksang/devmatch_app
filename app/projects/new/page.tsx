"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useChat } from 'ai/react';
import type { Message as VercelAIMessage } from 'ai';

export default function NewProjectPage() {
  const router = useRouter();

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: '안녕하세요! 새로운 프로젝트를 시작하시려는군요? 어떤 종류의 프로젝트를 만들고, 주요 목표는 무엇인가요? 자세히 알려주실수록 좋습니다.',
      },
    ],
    onFinish: async (message: VercelAIMessage) => {
      try {
        // AI가 JSON 형식의 문자열을 반환했다고 가정하고 파싱
        const lastResponseJson = JSON.parse(message.content);

        // AI가 상담 완료를 명시적으로 표시했는지 확인
        if (lastResponseJson.isConsultationComplete) {
          toast.success("AI 상담이 성공적으로 완료되었습니다!");

          const { projectName, projectGoal } = lastResponseJson;
          const consultationData = messages.map(msg => ({ role: msg.role, content: msg.content }));

          const response = await fetch('/api/projects/initial-setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName, projectGoal, consultationData }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save initial project setup');
          }

          const newProject = await response.json();
          toast.info("프로젝트 생성 중... 잠시만 기다려주세요.");
          
          // 다음 단계인 팀원 초대 페이지로 리다이렉트
          router.push(`/projects/${newProject.id}/invite`);
        }
      } catch (error) {
        // JSON 파싱에 실패하면 일반 텍스트로 처리 (아직 상담 진행 중)
        console.log("AI 응답이 JSON 형식이 아니므로 상담을 계속 진행합니다.");
      }
    },
    onError: (error: Error) => {
      console.error("AI chat error:", error);
      toast.error("AI와 대화 중 오류가 발생했습니다. 다시 시도해주세요.");
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
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-lg px-4 py-2 rounded-lg shadow-md ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-gray-800"}`}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-2 rounded-lg bg-white text-gray-800 shadow-md">
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
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}