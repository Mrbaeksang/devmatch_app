# 🔧 AI 상담 JSON 노출 문제 수정

## 📁 수정할 파일: `app/projects/new/page.tsx`

아래 코드를 **전체 복사해서** 기존 파일에 **완전히 덮어쓰기** 하세요:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Message as VercelAIMessage } from "ai";
import { useChat } from "ai/react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// 서버와 동일한 상담 단계 Enum
enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION',
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

// 서버와 동일한 상담 데이터 인터페이스
interface ConsultationData {
  userName?: string;
  projectName?: string;
  projectGoal?: string;
  techStack?: string[];
  mainFeatures?: string[];
  communicationSkills?: string[];
  teamMembersCount?: number;
  aiSuggestedRoles?: Array<{ role: string; count: number; note?: string }>;
}

export default function NewProjectPage() {
  const router = useRouter();
  // 상담 단계와 데이터를 클라이언트 상태로 관리
  const [currentStep, setCurrentStep] = useState<ConsultationStep>(ConsultationStep.NAME_COLLECTION);
  const [consultationData, setConsultationData] = useState<ConsultationData>({});
  const [isConsultationComplete, setIsConsultationComplete] = useState(false);
  const [finalProjectData, setFinalProjectData] = useState<any>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    // 초기 메시지는 AI가 첫 질문을 하도록 비워둠
    initialMessages: [
        {
            id: '1',
            role: 'assistant',
            content: '안녕하세요! 새로운 프로젝트 기획을 도와드릴 AI 매니저입니다. 시작하기에 앞서, 제가 뭐라고 불러드리면 될까요?',
        }
    ],
    // 서버로 현재 상담 상태를 전송
    body: {
      currentStep,
      consultationData,
    },
    // AI 응답 스트림이 완전히 끝나면 호출
    onFinish: async (message: VercelAIMessage) => {
      try {
        const parsedResponse = JSON.parse(message.content);

        // 1. 상담 완료 시 (최종 JSON 수신)
        if (parsedResponse.isConsultationComplete) {
          // 최종 데이터는 UI에 표시하지 않고 저장만
          setMessages(prev => prev.filter(m => m.id !== message.id));
          setIsConsultationComplete(true);
          setFinalProjectData(parsedResponse);
          
          // 상담 완료 메시지와 확정 버튼 표시
          setMessages(prev => [...prev, {
            id: `completion-${Date.now()}`,
            role: 'assistant',
            content: '🎉 상담이 완료되었습니다! 아래 내용으로 프로젝트를 생성하시겠습니까?'
          }]);
          
          return;
        }

        // 2. 상담 진행 중 (부분 JSON 수신)
        if (parsedResponse.displayMessage && parsedResponse.nextStep) {
          // AI가 보낸 원본 JSON 메시지를 사용자에게 보여줄 displayMessage로 교체
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages.find(m => m.id === message.id);
            if(lastMessage) {
                lastMessage.content = parsedResponse.displayMessage;
            }
            return newMessages;
          });

          // 다음 단계를 위해 상태 업데이트
          setCurrentStep(parsedResponse.nextStep);
          if(parsedResponse.consultationData) {
            setConsultationData(prev => ({ ...prev, ...parsedResponse.consultationData }));
          }
        }
      } catch (error) {
        // JSON 파싱 실패 시, AI가 일반 텍스트로 대답한 것으로 간주하고 대화를 이어감
        console.log("AI 응답이 JSON 형식이 아니므로 일반 대화로 처리합니다.", error);
      }
    },
    onError: (error: Error) => {
      console.error("AI chat error:", error);
      toast.error(`오류가 발생했습니다: ${error.message}`);
    },
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 프로젝트 생성 확정 처리
  const handleCreateProject = async () => {
    if (!finalProjectData) return;
    
    try {
      toast.loading("프로젝트를 생성하는 중...");
      
      const response = await fetch('/api/projects/initial-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProjectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로젝트 생성에 실패했습니다.');
      }

      const newProject = await response.json();
      toast.success("프로젝트가 성공적으로 생성되었습니다!");
      router.push(`/projects/${newProject.id}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Card className="flex flex-col flex-grow m-4 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            ✨ AI 프로젝트 기획 어시스턴트
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow p-0 overflow-hidden">
          <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.map((msg: VercelAIMessage) => (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-2xl px-6 py-4 rounded-2xl shadow-lg transition-all duration-200 ${
                  msg.role === "user" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" 
                    : "bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* 상담 완료 시 프로젝트 확정 버튼 */}
            {isConsultationComplete && finalProjectData && (
              <div className="flex justify-center mt-6">
                <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <h3 className="text-lg font-semibold">프로젝트 정보 수집 완료!</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p><strong>프로젝트명:</strong> {finalProjectData.consultationData?.projectName}</p>
                      <p><strong>목표:</strong> {finalProjectData.consultationData?.projectGoal}</p>
                      <p><strong>예상 팀원 수:</strong> {finalProjectData.consultationData?.teamMembersCount}명</p>
                    </div>
                    <Button 
                      onClick={handleCreateProject}
                      className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
                    >
                      🚀 프로젝트 생성하기
                    </Button>
                  </div>
                </Card>
              </div>
            )}
            
            {isLoading && (
              <div className="flex items-end gap-3 justify-start">
                <div className="max-w-xs px-6 py-4 rounded-2xl bg-white border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="text-gray-600">AI가 응답 중...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {!isConsultationComplete && (
            <div className="p-6 border-t bg-gray-50/50 backdrop-blur-sm">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={isLoading ? "AI가 응답을 생성 중입니다..." : "메시지를 입력하세요..."}
                  className="flex-grow bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3"
                  disabled={isLoading}
                  autoFocus
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "전송"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🎯 이 수정으로 얻는 효과:

1. **JSON 노출 문제 해결**: 사용자에게 raw JSON이 보이지 않음
2. **프로젝트 생성 확정 기능**: 상담 완료 시 "프로젝트 생성하기" 버튼 표시
3. **모던 UI 적용**: 그라데이션, 그림자, 둥근 모서리로 세련된 디자인
4. **상담 완료 표시**: 체크 아이콘과 함께 완료 상태 명확히 표시
5. **사용자 경험 개선**: 로딩 상태, 에러 처리, 부드러운 애니메이션

## 📝 Git 명령어:
```bash
git add . && git commit -m "AI 상담 JSON 노출 문제 수정 및 UI/UX 개선" && git push
```