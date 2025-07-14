"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Send,
  Sparkles,
  Bot,
  ArrowLeft
} from "lucide-react";
import { 
  LoadingState, 
  ChatMessage, 
  ChatLoading, 
  SuccessModal 
} from "@/components/common";
import { useConsultation } from "@/lib/hooks/useConsultation";

/**
 * 프로젝트 생성 페이지 (AI 상담)
 * 데피와의 대화를 통해 프로젝트 청사진을 생성
 * 모듈화: useConsultation Hook과 공통 컴포넌트 사용
 */
export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Custom Hook 사용 - 모든 AI 상담 로직이 여기에!
  const {
    messages,
    userInput,
    isLoading,
    isComplete,
    projectData,
    messagesEndRef,
    inputRef,
    setUserInput,
    sendMessage,
    handleKeyPress,
    navigateToProject,
    goBack
  } = useConsultation(session?.user?.id);
  
  // 인증 체크
  if (status === "loading") {
    return <LoadingState message="로그인 정보를 확인하는 중..." />;
  }
  
  if (!session) {
    router.push('/');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <BackgroundPaths />
      
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-purple-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            프로젝트 목록으로
          </Button>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/50">
            <Bot className="h-3 w-3 mr-1" />
            AI 상담 모드
          </Badge>
        </div>
      </div>
      
      {/* 메인 채팅 영역 */}
      <div className="flex-1 container mx-auto px-4 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex flex-col"
        >
          {/* 채팅 헤더 */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                  새 프로젝트 만들기
                </h2>
                <p className="text-purple-300 text-sm mt-1">
                  AI 상담사 데피가 프로젝트 설계를 도와드립니다
                </p>
              </div>
              <div className="text-sm text-purple-300">
                {messages.length - 1} 메시지
              </div>
            </div>
          </div>
          
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  role: message.role === 'ai' ? 'ai' : 'user',
                  content: message.content,
                  timestamp: message.timestamp,
                  user: message.role === 'user' ? {
                    name: session.user?.name || '사용자',
                    avatar: session.user?.image || undefined
                  } : undefined
                }}
                isMyMessage={message.role === 'user'}
                variant="interview"
              />
            ))}
            {isLoading && <ChatLoading variant="interview" />}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 입력 영역 */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isComplete ? "상담이 완료되었습니다!" : "프로젝트에 대해 자유롭게 이야기해주세요..."}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-purple-300/50 focus:outline-none focus:border-purple-400 resize-none"
                rows={2}
                disabled={isLoading || isComplete}
              />
              <Button
                type="submit"
                disabled={!userInput.trim() || isLoading || isComplete}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <p className="text-xs text-purple-300/50 mt-2">
              Shift + Enter로 줄바꿈, Enter로 전송
            </p>
          </div>
        </motion.div>
      </div>
      
      {/* 성공 모달 */}
      <SuccessModal
        isOpen={isComplete && !!projectData}
        projectData={projectData!}
        onNavigate={navigateToProject}
      />
    </div>
  );
}