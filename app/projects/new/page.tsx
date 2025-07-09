"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ConsultationData } from "@/types/chat";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { 
  ChatBubble, 
  ChatBubbleAvatar, 
  ChatBubbleMessage 
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ProjectModal, useProjectModal } from "@/components/ui/project-modal";
import { 
  Loader2, 
  Send,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// 상담 단계 정의
enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION', 
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}


// 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// 타이핑 애니메이션 컴포넌트
const TypingMessage = ({ content, onComplete }: { content: string; onComplete: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return <>{displayedContent}</>;
};

// 프로그레스 계산 함수 (핵심 6단계)
const calculateProgress = (data: ConsultationData): number => {
  const totalSteps = 6;
  let completedSteps = 0;

  if (data.userName) completedSteps++;
  if (data.projectName) completedSteps++;
  if (data.projectGoal) completedSteps++;
  if (data.techStack && data.techStack.length > 0) completedSteps++;
  if (data.projectDuration || data.duration) completedSteps++; // 프로젝트 기간
  if (data.teamMembersCount) completedSteps++;

  return (completedSteps / totalSteps) * 100;
};

export default function NewProjectPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 안녕하세요! AI 프로젝트 매니저입니다. 먼저 제가 뭐라고 불러드리면 될까요?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ConsultationStep>(ConsultationStep.NAME_COLLECTION);
  const [consultationData, setConsultationData] = useState<ConsultationData>({});
  const [isConsultationComplete, setIsConsultationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen: isModalOpen, openModal, closeModal } = useProjectModal();

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // 메시지 전송 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          currentStep,
          consultationData,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data = await response.json();

      // AI 응답 처리
      if (data.error) {
        throw new Error(data.error);
      }

      // AI 응답 메시지 추가
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isTyping: false,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 상태 업데이트
      if (data.nextStep) {
        setCurrentStep(data.nextStep);
      }
      if (data.consultationData) {
        setConsultationData(prev => ({ ...prev, ...data.consultationData }));
      }
      if (data.isConsultationComplete) {
        setIsConsultationComplete(true);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      
      // 에러 메시지 추가
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 타이핑 완료 처리
  const handleTypingComplete = useCallback((messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isTyping: false } : msg
    ));
  }, []);

  // 재시도 버튼
  const handleRetry = () => {
    setError(null);
    // 마지막 사용자 메시지 찾기
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      // 마지막 사용자 메시지와 그 이후 메시지 제거
      const lastUserIndex = messages.findIndex(m => m.id === lastUserMessage.id);
      setMessages(messages.slice(0, lastUserIndex));
    }
  };

  // 프로젝트 생성 모달 열기
  const handleShowProjectModal = () => {
    openModal();
  };

  // 실제 프로젝트 생성 API 호출
  const handleConfirmCreateProject = async () => {
    setIsCreatingProject(true);
    try {
      const response = await fetch('/api/projects/initial-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: consultationData.projectName || '새 프로젝트',
          projectGoal: consultationData.projectGoal || '프로젝트 목표',
          consultationData: consultationData,
        }),
      });

      if (!response.ok) throw new Error('프로젝트 생성 실패');

      const newProject = await response.json();
      setCreatedProject(newProject);
      toast.success("프로젝트가 생성되었습니다!");
      
      // 팀원 모집 페이지로 이동
      router.push(`/projects/join/${newProject.inviteCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '프로젝트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const progress = calculateProgress(consultationData);

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          {/* 헤더 - ExpandableChat 스타일 */}
          <ExpandableChatHeader className="flex items-center justify-between p-4 border-b border-zinc-800">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-blue-500 animate-pulse" />
              <h1 className="text-lg md:text-xl font-semibold text-white">
                AI 프로젝트 컨설팅
              </h1>
            </motion.div>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="w-20 md:w-32 h-2" />
              <Badge variant="secondary" className="text-xs">
                {Math.round(progress)}%
              </Badge>
            </div>
          </ExpandableChatHeader>

          {/* 채팅 영역 - ExpandableChat Body */}
          <ExpandableChatBody>
            <ChatMessageList className="h-full">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === 'user' ? 'sent' : 'received'}
              >
                <ChatBubbleAvatar
                  src={message.role === 'user' 
                    ? undefined 
                    : undefined
                  }
                  fallback={message.role === 'user' ? 'YOU' : 'AI'}
                />
                <ChatBubbleMessage
                  variant={message.role === 'user' ? 'sent' : 'received'}
                  isLoading={message.isTyping}
                >
                  <div className="whitespace-pre-wrap">
                    {message.content}
                  </div>
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar fallback="AI" />
                <ChatBubbleMessage variant="received" isLoading />
              </ChatBubble>
            )}


            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRetry}
                        className="ml-2"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        재시도
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 프로젝트 생성 완료 카드 */}
            {isConsultationComplete && consultationData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Card className="border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      프로젝트 정보 수집 완료
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">프로젝트명</span>
                        <p className="text-base font-semibold">{consultationData.projectName}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">목표</span>
                        <p className="text-base">{consultationData.projectGoal}</p>
                      </div>
                      {consultationData.techStack && (
                        <div className="space-y-1 md:col-span-2">
                          <span className="font-medium text-muted-foreground">기술 스택</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {consultationData.techStack.map((tech) => (
                              <Badge key={tech} variant="secondary">{tech}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <Button 
                      onClick={handleShowProjectModal} 
                      className="w-full" 
                      size="lg"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      프로젝트 생성하기
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
            </ChatMessageList>
          </ExpandableChatBody>

          {/* 입력 영역 - demo.tsx 스타일 */}
          {!isConsultationComplete && (
            <ExpandableChatFooter>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="p-4"
              >
              <form 
                onSubmit={handleSubmit}
                className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
              >
                <ChatInput
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  disabled={isLoading}
                  className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <div className="flex items-center p-3 pt-0 justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()} 
                    size="sm" 
                    className="ml-auto gap-1.5"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        AI 응답 중...
                      </>
                    ) : (
                      <>
                        메시지 전송
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
              </motion.div>
            </ExpandableChatFooter>
          )}
        </div>
      </div>

      {/* 프로젝트 생성 확인 모달 */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`🚀 ${consultationData.projectName || '새 프로젝트'} 생성하기`}
        description="AI가 분석한 프로젝트 정보를 확인하고 팀원을 모집해보세요!"
        infoCards={[
          {
            icon: "👥",
            label: "팀원 수",
            value: `${consultationData.teamMembersCount || 4}명`
          },
          {
            icon: "⏰",
            label: "예상 기간",
            value: consultationData.projectDuration || consultationData.duration || "미정"
          },
          {
            icon: "🛠️",
            label: "기술 스택",
            value: Array.isArray(consultationData.techStack) 
              ? consultationData.techStack.slice(0, 3).join(", ")
              : consultationData.techStack || "미정"
          },
          {
            icon: "🎯",
            label: "프로젝트 목표",
            value: consultationData.projectGoal?.slice(0, 20) + "..." || "목표 설정 중"
          }
        ]}
        primaryAction={{
          label: isCreatingProject ? "생성 중..." : "프로젝트 생성 및 팀원 모집",
          onClick: handleConfirmCreateProject,
          loading: isCreatingProject
        }}
        secondaryAction={{
          label: "취소",
          onClick: () => closeModal()
        }}
      />
    </div>
  );
}