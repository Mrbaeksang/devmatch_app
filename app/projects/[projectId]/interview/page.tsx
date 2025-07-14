"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { generateAvatarDataUrl, deserializeAvatarConfig } from "@/lib/avatar";
import Image from "next/image";
import { 
  Loader2, 
  Send,
  Bot,
  User
} from "lucide-react";
import { useInterview } from "@/lib/hooks/useInterview";
import { LoadingState, ErrorState, PageHeader } from "@/components/common";

export default function InterviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  
  const projectId = params.projectId as string;
  const memberId = searchParams.get('memberId') || '';
  
  // Custom Hook 사용 - 모든 면담 로직이 여기에!
  const {
    userInput,
    chatHistory,
    isLoading,
    isInitializing,
    isComplete,
    error,
    messagesEndRef,
    inputRef,
    setUserInput,
    sendMessage,
    handleKeyPress,
    handleGoBack,
    canSendMessage,
  } = useInterview(projectId, memberId, session?.user?.id);

  // ===== 초기화 중 UI =====
  if (isInitializing) {
    return (
      <LoadingState 
        message="면담을 준비하고 있습니다..."
        subMessage="잠시만 기다려주세요."
      />
    );
  }

  // ===== 에러 상태 UI =====
  if (error) {
    return (
      <ErrorState 
        error={error}
        onGoBack={handleGoBack}
      />
    );
  }

  // ===== 면담 완료 UI =====
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackgroundPaths />
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">면담이 완료되었습니다!</h2>
            <p className="text-purple-200 text-center">
              면담해주셔서 감사합니다. 잠시 후 프로젝트 페이지로 이동합니다.
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
          </div>
        </div>
      </div>
    );
  }

  // ===== 메인 면담 UI =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <BackgroundPaths />
      
      {/* 헤더 */}
      <PageHeader
        title="1:1 AI 면담"
        subtitle="편안하게 대화하듯 답변해주세요"
        onBack={handleGoBack}
        badge={{ text: "진행 중" }}
      />

      {/* 채팅 영역 */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 pb-0">
        <div className="bg-white/10 backdrop-blur-md rounded-lg h-full flex flex-col">
          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  {/* 아바타 */}
                  <div className="flex-shrink-0">
                    {message.role === 'ai' ? (
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-6 w-6 text-white" />
                      </div>
                    ) : session?.user?.avatar ? (
                      <Image 
                        src={generateAvatarDataUrl(deserializeAvatarConfig(session.user.avatar as string))}
                        alt="You"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* 메시지 내용 */}
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-blue-500/20 text-white' 
                      : 'bg-white/10 text-white'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-50 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-white/10 p-4">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                disabled={isLoading || isComplete}
              />
              <Button
                onClick={sendMessage}
                disabled={!canSendMessage}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-purple-200 mt-2">
              Enter로 전송, Shift+Enter로 줄바꿈
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}