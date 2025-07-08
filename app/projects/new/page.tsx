"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "ai/react";
import type { Message as VercelAIMessage } from "ai";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  Send,
  Sparkles,
  MessageSquare
} from "lucide-react";

enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION', 
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

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
  const [currentStep, setCurrentStep] = useState<ConsultationStep>(ConsultationStep.NAME_COLLECTION);
  const [consultationData, setConsultationData] = useState<ConsultationData>({});
  const [isConsultationComplete, setIsConsultationComplete] = useState(false);
  const [finalProjectData, setFinalProjectData] = useState<{consultationData?: ConsultationData} | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    initialMessages: [{
      id: '1',
      role: 'assistant',
      content: '👋 안녕하세요! AI 프로젝트 매니저입니다. 먼저 제가 뭐라고 불러드리면 될까요?',
    }],
    body: { currentStep, consultationData },
    onFinish: async (message: VercelAIMessage) => {
      try {
        const parsedResponse = JSON.parse(message.content);

        if (parsedResponse.isConsultationComplete) {
          // JSON 메시지 제거하고 완료 상태로 변경
          setMessages(prev => prev.filter(m => m.id !== message.id));
          setIsConsultationComplete(true);
          setFinalProjectData(parsedResponse);
          
          // 완료 메시지 추가
          setMessages(prev => [...prev, {
            id: `completion-${Date.now()}`,
            role: 'assistant',
            content: '🎉 상담이 완료되었습니다!'
          }]);
          return;
        }

        if (parsedResponse.displayMessage && parsedResponse.nextStep) {
          // JSON을 displayMessage로 교체
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages.find(m => m.id === message.id);
            if (lastMessage) {
              lastMessage.content = parsedResponse.displayMessage;
            }
            return newMessages;
          });

          setCurrentStep(parsedResponse.nextStep);
          if (parsedResponse.consultationData) {
            setConsultationData(prev => ({ ...prev, ...parsedResponse.consultationData }));
          }
        }
      } catch (error) {
        console.log("일반 텍스트 응답으로 처리:", error);
      }
    },
    onError: (error: Error) => {
      toast.error(`오류가 발생했습니다: ${error.message}`);
    },
  });

  const handleCreateProject = async () => {
    if (!finalProjectData) return;
    
    try {
      toast.loading("프로젝트를 생성하는 중...");
      
      const response = await fetch('/api/projects/initial-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalProjectData),
      });

      if (!response.ok) throw new Error('프로젝트 생성 실패');

      const newProject = await response.json();
      toast.success("프로젝트가 생성되었습니다!");
      router.push(`/projects/${newProject.id}`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  });

  return (
    <div className="flex h-screen bg-background">
      {/* 메인 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold">AI 프로젝트 컨설팅</h1>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {Object.keys(consultationData).length}/5 단계
              </Badge>
            </div>
          </div>
        </div>

        {/* 채팅 메시지 영역 */}
        <ScrollArea className="flex-1 px-6">
          <div className="py-6 space-y-6" ref={scrollAreaRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={`max-w-2xl ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <Card className={
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50'
                  }>
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}

            {/* 프로젝트 생성 확정 카드 */}
            {isConsultationComplete && finalProjectData && finalProjectData.consultationData && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle2 className="h-5 w-5" />
                    프로젝트 정보 수집 완료
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">프로젝트명:</span>
                      <p className="text-muted-foreground">{finalProjectData.consultationData.projectName}</p>
                    </div>
                    <div>
                      <span className="font-medium">목표:</span>
                      <p className="text-muted-foreground">{finalProjectData.consultationData.projectGoal}</p>
                    </div>
                  </div>
                  <Separator />
                  <Button onClick={handleCreateProject} className="w-full" size="lg">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    프로젝트 생성하기
                  </Button>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI가 응답 중...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* 입력 영역 */}
        {!isConsultationComplete && (
          <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="메시지를 입력하세요..."
                    disabled={isLoading}
                    className="min-h-[60px] resize-none"
                  />
                </div>
                <Button type="submit" disabled={isLoading || !input.trim()} size="lg">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}