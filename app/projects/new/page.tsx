"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  User, 
  Loader2, 
  CheckCircle2, 
  Send,
  Sparkles,
  MessageSquare,
  RefreshCw,
  AlertCircle
} from "lucide-react";

// 상담 단계 정의
enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION', 
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

// 상담 데이터 타입
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

// 프로그레스 계산 함수
const calculateProgress = (data: ConsultationData): number => {
  const totalSteps = 5;
  let completedSteps = 0;

  if (data.userName) completedSteps++;
  if (data.projectName) completedSteps++;
  if (data.projectGoal) completedSteps++;
  if (data.techStack && data.techStack.length > 0) completedSteps++;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

      // 타이핑 중인 메시지 추가
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        isTyping: true,
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

  // 프로젝트 생성
  const handleCreateProject = async () => {
    try {
      toast.loading("프로젝트를 생성하는 중...");
      
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
      toast.success("프로젝트가 생성되었습니다!");
      router.push(`/projects/${newProject.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '프로젝트 생성 중 오류가 발생했습니다.');
    }
  };

  const progress = calculateProgress(consultationData);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* 헤더 */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" />
            <h1 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI 프로젝트 컨설팅
            </h1>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Progress value={progress} className="w-20 md:w-32 h-2" />
            <Badge variant="secondary" className="text-xs">
              {Math.round(progress)}%
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* 채팅 영역 - 고정 높이 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-4"
        >
          <div className="max-w-3xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 border-2 border-primary/10">
                    <AvatarFallback className={message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <Card className={`${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/50 backdrop-blur'
                    } shadow-sm`}>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.isTyping ? (
                            <TypingMessage 
                              content={message.content} 
                              onComplete={() => handleTypingComplete(message.id)}
                            />
                          ) : (
                            message.content
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 로딩 인디케이터 */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <Avatar className="h-8 w-8 border-2 border-primary/10">
                  <AvatarFallback className="bg-muted">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-card/50 backdrop-blur shadow-sm">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">AI가 응답 중...</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
                      onClick={handleCreateProject} 
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
          </div>
        </div>

        {/* 입력 영역 */}
        {!isConsultationComplete && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    disabled={isLoading}
                    className="min-h-[48px] resize-none bg-background/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  size="lg"
                  className="h-12 px-4"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}