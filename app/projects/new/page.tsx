"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Sparkles,
  CheckCircle2,
  Bot,
  User
} from "lucide-react";

// 간단한 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 성공 모달 컴포넌트
interface SuccessModalProps {
  isOpen: boolean;
  projectData: {
    inviteCode: string;
    [key: string]: unknown;
  };
  onNavigate: () => void;
}

function SuccessModal({ isOpen, projectData, onNavigate }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">프로젝트 생성 완료!</h2>
          <p className="text-zinc-400 mb-6">이제 팀원 모집을 시작하세요</p>
          
          <div className="bg-zinc-800 rounded-lg p-6 mb-6 text-left space-y-5">
            <div>
              <h3 className="font-bold text-white text-xl mb-2">{String(projectData?.name || projectData?.projectName || '')}</h3>
              <p className="text-white text-base leading-relaxed">{String(projectData?.description || projectData?.projectGoal || '')}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="text-white font-semibold text-base">팀원 수:</span>
                <span className="text-white ml-2 text-base">{String(projectData?.teamSize || '')}명</span>
              </div>
              <div>
                <span className="text-white font-semibold text-base">기간:</span>
                <span className="text-white ml-2 text-base">{String(projectData?.duration || '')}</span>
              </div>
            </div>
            
            {projectData?.teamComposition ? (
              <div>
                <span className="text-white font-semibold text-base">역할 구성:</span>
                <p className="text-white text-base mt-2 leading-relaxed">
                  {String((projectData.teamComposition as Record<string, unknown>)?.description || '')}
                </p>
              </div>
            ) : null}
            
            <div>
              <span className="text-white font-semibold text-base">기술 스택:</span>
              <div className="flex flex-wrap gap-2 mt-3">
                {projectData?.techStack && typeof projectData.techStack === 'object' ? (
                  <>
                    {/* Frontend */}
                    {(projectData.techStack as any)?.frontend && (
                      <div className="w-full">
                        <span className="text-blue-400 text-sm font-medium">Frontend:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...((projectData.techStack as any).frontend.languages || []),
                            ...((projectData.techStack as any).frontend.frameworks || []),
                            ...((projectData.techStack as any).frontend.tools || [])
                          ].map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Backend */}
                    {(projectData.techStack as any)?.backend && (
                      <div className="w-full">
                        <span className="text-green-400 text-sm font-medium">Backend:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...((projectData.techStack as any).backend.languages || []),
                            ...((projectData.techStack as any).backend.frameworks || []),
                            ...((projectData.techStack as any).backend.tools || [])
                          ].map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs px-2 py-1 bg-green-600/20 text-green-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Collaboration */}
                    {(projectData.techStack as any)?.collaboration && (
                      <div className="w-full">
                        <span className="text-yellow-400 text-sm font-medium">협업:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...((projectData.techStack as any).collaboration.git || []),
                            ...((projectData.techStack as any).collaboration.tools || [])
                          ].map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onNavigate} 
            className="w-full text-lg font-bold py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]" 
            size="lg"
          >
            **🚀 팀원 모집 페이지로 이동**
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // 데피 시스템 기반 상태 관리
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: '안녕하세요! DevMatch에 오신 것을 환영합니다. 저는 당신의 아이디어를 구체적인 \'프로젝트 청사진\'으로 만들어드릴 AI, **데피(Deffy)**라고 해요. 함께 멋진 프로젝트를 설계해볼까요? 우선, 어떤 프로젝트를 만들고 싶으신지 편하게 말씀해주세요!',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [collectedData, setCollectedData] = useState({
    projectName: '',
    projectGoal: '',
    teamSize: 0,
    techStack: {
      frontend: {
        languages: [] as string[],
        frameworks: [] as string[],
        tools: [] as string[]
      },
      backend: {
        languages: [] as string[],
        frameworks: [] as string[],
        tools: [] as string[]
      },
      collaboration: {
        git: [] as string[],
        tools: [] as string[]
      }
    },
    duration: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [projectData, setProjectData] = useState<{
    inviteCode: string;
    techStack?: {
      frontend?: {
        languages: string[];
        frameworks: string[];
        tools?: string[];
      };
      backend?: {
        languages: string[];
        frameworks: string[];
        tools?: string[];
      };
      collaboration: {
        git: string[];
        tools?: string[];
      };
    };
    [key: string]: unknown;
  } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  
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
    }, 1000); // 1초 후 포커스
    
    return () => clearTimeout(timer);
  }, []);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: currentInput,
          collectedData,
          chatHistory: [...chatHistory, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
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

      // 데피 시스템 기반 처리
      if (data.projectCreated) {
        setProjectData(data.finalData);
        setShowSuccessModal(true);
      } else {
        // 데이터 저장 (항상)
        if (data.dataToSave) {
          setCollectedData(prev => ({ ...prev, ...data.dataToSave }));
        }
        
        // 완료 상태 처리
        setIsComplete(data.isComplete || false);
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

  // 성공 모달에서 이동
  const handleNavigate = () => {
    if (projectData?.projectId) {
      router.push(`/projects/${projectData.projectId}`);
    }
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
              <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
              <h1 className="text-xl font-bold text-white" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
              }}>
                AI 프로젝트 생성
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
                    fontFamily: '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif',
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
                <div className="bg-zinc-800 text-zinc-100 px-5 py-4 rounded-2xl mr-12 shadow-lg" style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>데피가 생각하고 있어요...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 오토스크롤 타겟 */}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
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
        </div>
      </div>

      {/* 성공 모달 */}
      {projectData && (
        <SuccessModal
          isOpen={showSuccessModal}
          projectData={projectData}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}