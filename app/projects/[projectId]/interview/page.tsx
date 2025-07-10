"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateAvatarDataUrl, deserializeAvatarConfig } from "@/lib/avatar";
import Image from "next/image";
import { 
  Loader2, 
  Send,
  Bot,
  User,
  ArrowLeft
} from "lucide-react";

// 간단한 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const projectId = params.projectId as string;
  const memberId = searchParams.get('memberId') || '';
  
  // 면담 상태 관리
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memberProfile, setMemberProfile] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // 오토스크롤용 ref
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 채팅 히스토리 변경 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // 컴포넌트 마운트 시 입력창 포커스 (지연)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // 면담 완료 여부 체크 및 첫 인사
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          const currentMember = data.members?.find(
            (m: { id: string }) => m.id === memberId
          );
          
          if (currentMember?.interviewStatus === 'COMPLETED') {
            toast.error('이미 면담을 완료하셨습니다!');
            setTimeout(() => {
              router.push(`/projects/${projectId}`);
            }, 1500);
            return;
          }
          
          // 첫 로드 시 AI 인사말 전송
          if (isFirstLoad && chatHistory.length === 0) {
            setIsFirstLoad(false);
            setIsLoading(true);
            
            const firstResponse = await fetch(`/api/projects/${projectId}/interview`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userInput: '',
                projectId,
                memberId,
                chatHistory: [],
                memberProfile: {}
              })
            });
            
            if (firstResponse.ok) {
              const firstData = await firstResponse.json();
              const aiGreeting: Message = {
                id: Date.now().toString(),
                role: 'ai',
                content: firstData.response,
                timestamp: new Date()
              };
              setChatHistory([aiGreeting]);
            }
            
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Interview initialization error:', error);
        setIsLoading(false);
      }
    };

    if (projectId && memberId) {
      initializeInterview();
    }
  }, [projectId, memberId, router, isFirstLoad, chatHistory.length]);

  // 새로운 메시지 전송 함수
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput.trim(),
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentInput = userInput.trim();
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: currentInput,
          projectId,
          memberId,
          chatHistory: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          memberProfile
        })
      });

      if (!response.ok) throw new Error('서버 오류');

      const data = await response.json();

      // AI 응답 메시지 추가
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMessage]);

      // 면담 데이터 업데이트
      if (data.memberProfile) {
        setMemberProfile(prev => ({ ...prev, ...data.memberProfile }));
      }
      
      // 완료 상태 처리
      if (data.isComplete) {
        setIsComplete(true);
        toast.success('면담이 완료되었습니다!');
        // 자동 리다이렉트 제거 - 사용자가 직접 확인 후 이동하도록 변경
      }

    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      // AI 응답 후 입력창으로 포커스 복귀
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 뒤로가기 (면담 완료 후에는 강제 새로고침)
  const handleGoBack = () => {
    if (isComplete) {
      // 면담 완료 후에는 프로젝트 페이지로 직접 이동 (강제 새로고침)
      router.push(`/projects/${projectId}?refresh=${Date.now()}`);
    } else {
      router.back();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-white">
                개인 면담
              </h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {isComplete ? '완료' : '진행중'}
            </Badge>
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {message.role === 'user' ? (
                    session?.user?.avatar ? (
                      <Image
                        src={generateAvatarDataUrl(deserializeAvatarConfig(session.user.avatar))}
                        alt="User avatar"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-white" />
                    )
                  ) : (
                    <Bot className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div
                  className={`max-w-5xl px-5 py-4 rounded-2xl whitespace-pre-wrap break-words shadow-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-zinc-800 text-zinc-100 mr-12'
                  }`}
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                    fontSize: '16px',
                    lineHeight: '1.7',
                    fontWeight: '500'
                  }}
                >
                  <div dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }} />
                </div>
              </div>
            ))}

            {/* 로딩 표시 */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-500" />
                </div>
                <div className="bg-zinc-800 text-zinc-100 px-5 py-4 rounded-2xl mr-12 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>면담관이 생각하고 있어요...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 오토스크롤 타겟 */}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          {!isComplete ? (
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈, Enter로 전송)"
                  disabled={isLoading}
                  rows={2}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 text-base resize-none min-h-[3rem] max-h-32"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!userInput.trim() || isLoading}
                  size="sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 border-t border-zinc-800 bg-green-500/5">
              <div className="text-center">
                <div className="text-green-500 text-xl mb-3">✅</div>
                <h3 className="text-white font-bold text-lg mb-2">면담이 완료되었습니다!</h3>
                <p className="text-zinc-400 mb-4">
                  수집된 정보를 바탕으로 최적의 역할 분배가 진행됩니다.
                </p>
                <Button 
                  onClick={handleGoBack}
                  className="w-full text-lg font-bold py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  프로젝트로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}