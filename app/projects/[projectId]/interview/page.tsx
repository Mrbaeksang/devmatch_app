"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

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
import { 
  Loader2, 
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  User,
  Star,
  Users,
  ArrowLeft
} from "lucide-react";

import { InterviewStatus } from "@/types/project";

// 면담 단계 정의
enum InterviewStep {
  WELCOME = 'WELCOME',
  SKILL_ASSESSMENT = 'SKILL_ASSESSMENT',
  LEADERSHIP_ASSESSMENT = 'LEADERSHIP_ASSESSMENT',
  PREFERENCE_COLLECTION = 'PREFERENCE_COLLECTION',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED'
}

// 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

// 면담 데이터 타입
interface InterviewData {
  memberName?: string;
  skills?: string[];
  experience?: string;
  leadershipLevel?: 'none' | 'interested' | 'experienced' | 'preferred';
  workStyle?: string;
  communication?: string;
  motivation?: string;
  availability?: string;
  rolePreference?: string;
  additionalInfo?: string;
}

// 프로그레스 계산 함수
const calculateProgress = (data: InterviewData, currentStep: InterviewStep): number => {
  const totalSteps = 6;
  let completedSteps = 0;

  if (data.memberName) completedSteps++;
  if (data.skills && data.skills.length > 0) completedSteps++;
  if (data.leadershipLevel) completedSteps++;
  if (data.workStyle) completedSteps++;
  if (data.rolePreference) completedSteps++;
  if (currentStep === InterviewStep.COMPLETED) completedSteps++;

  return (completedSteps / totalSteps) * 100;
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const projectId = params.projectId as string;
  const memberId = searchParams.get('memberId');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 안녕하세요! 팀 구성을 위한 개인 면담을 시작하겠습니다. 먼저 자기소개를 간단히 해주시겠어요?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<InterviewStep>(InterviewStep.WELCOME);
  const [interviewData, setInterviewData] = useState<InterviewData>({});
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          memberId,
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          currentStep,
          interviewData,
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
      if (data.interviewData) {
        setInterviewData(prev => ({ ...prev, ...data.interviewData }));
      }
      if (data.isInterviewComplete) {
        setIsInterviewComplete(true);
      }

    } catch (error) {
      console.error('Interview error:', error);
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

  // 면담 완료 처리
  const handleCompleteInterview = async () => {
    try {
      const response = await fetch('/api/interview/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          memberId,
          interviewData,
        }),
      });

      if (!response.ok) {
        throw new Error('면담 완료 처리 실패');
      }

      toast.success("면담이 완료되었습니다!");
      
      // 프로젝트 초대코드로 돌아가기
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        router.push(`/projects/join/${projectData.inviteCode}`);
      } else {
        // 프로젝트 정보를 가져올 수 없는 경우 프로젝트 목록으로
        router.push('/projects');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '면담 완료 중 오류가 발생했습니다.');
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    router.push(`/projects/join/${projectId}`);
  };

  const progress = calculateProgress(interviewData, currentStep);

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          {/* 헤더 */}
          <ExpandableChatHeader className="flex items-center justify-between p-4 border-b border-zinc-800">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <User className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-white">
                  개인 면담
                </h1>
                <p className="text-sm text-zinc-400">팀 구성을 위한 면담 진행</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="w-20 md:w-32 h-2" />
              <Badge variant="secondary" className="text-xs">
                {Math.round(progress)}%
              </Badge>
            </div>
          </ExpandableChatHeader>

          {/* 채팅 영역 */}
          <ExpandableChatBody>
            <ChatMessageList className="h-full">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.role === 'user' ? 'sent' : 'received'}
              >
                <ChatBubbleAvatar
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 면담 완료 카드 */}
            {isInterviewComplete && interviewData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Card className="border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-5 w-5" />
                      면담 완료
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">기술 역량</span>
                        <div className="flex flex-wrap gap-1">
                          {interviewData.skills?.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">리더십 레벨</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-base">
                            {interviewData.leadershipLevel === 'none' && '리더 경험 없음'}
                            {interviewData.leadershipLevel === 'interested' && '리더 관심 있음'}
                            {interviewData.leadershipLevel === 'experienced' && '리더 경험 있음'}
                            {interviewData.leadershipLevel === 'preferred' && '리더 선호'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <Button 
                      onClick={handleCompleteInterview} 
                      className="w-full" 
                      size="lg"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      면담 완료하기
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
            </ChatMessageList>
          </ExpandableChatBody>

          {/* 입력 영역 */}
          {!isInterviewComplete && (
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
    </div>
  );
}