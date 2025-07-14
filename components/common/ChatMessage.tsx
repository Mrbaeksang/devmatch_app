// components/common/ChatMessage.tsx
// 채팅 메시지를 표시하는 공통 컴포넌트

import { motion } from "framer-motion";
import { MemberAvatar } from "./MemberAvatar";
import { Bot } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date | string;
    user?: {
      name: string;
      nickname?: string;
      avatar?: string;
    };
  };
  isMyMessage?: boolean;
  showAvatar?: boolean;
  variant?: 'default' | 'interview' | 'chat';
  className?: string;
}

interface ChatLoadingProps {
  variant?: 'default' | 'interview' | 'chat';
}

/**
 * 채팅 메시지 공통 컴포넌트
 * AI 면담, 팀 채팅 등에서 사용되는 메시지 UI
 * 
 * @param message - 메시지 정보
 * @param isMyMessage - 내 메시지 여부
 * @param showAvatar - 아바타 표시 여부 (기본값: true)
 * @param variant - 메시지 스타일 변형
 * @param className - 추가 클래스명
 */
export function ChatMessage({
  message,
  isMyMessage = false,
  showAvatar = true,
  variant = 'default',
  className = ""
}: ChatMessageProps) {
  const isSystem = message.role === 'system';
  const isAI = message.role === 'ai';
  const displayName = message.user?.nickname || message.user?.name || 
    (isAI ? 'AI' : isSystem ? '시스템' : '알 수 없음');
  
  // 변형별 스타일
  const variantStyles = {
    default: {
      user: 'bg-blue-500/20 text-white',
      ai: 'bg-white/10 text-white',
      system: 'bg-purple-500/20 text-purple-200'
    },
    interview: {
      user: 'bg-blue-500/20 text-white',
      ai: 'bg-white/10 text-white',
      system: 'bg-purple-500/20 text-purple-200'
    },
    chat: {
      user: isMyMessage ? 'bg-purple-500/30 text-white' : 'bg-white/10 text-white',
      ai: 'bg-white/10 text-white',
      system: 'bg-purple-500/20 text-purple-200 text-center'
    }
  };

  const messageStyle = isSystem 
    ? variantStyles[variant].system 
    : isAI 
      ? variantStyles[variant].ai 
      : variantStyles[variant].user;

  // 시스템 메시지는 중앙 정렬
  if (isSystem && variant === 'chat') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className={`rounded-lg p-3 ${messageStyle} ${className}`}>
          <p className="text-sm">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div className={`flex items-start space-x-3 max-w-[80%] ${
        isMyMessage ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* 아바타 */}
        {showAvatar && (
          <div className="flex-shrink-0">
            {isAI ? (
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
            ) : (
              <MemberAvatar
                name={displayName}
                avatar={message.user?.avatar}
                size="md"
              />
            )}
          </div>
        )}
        
        {/* 메시지 내용 */}
        <div className={`rounded-lg p-4 ${messageStyle}`}>
          {/* 사용자 이름 (팀 채팅에서만) */}
          {variant === 'chat' && !isSystem && !isMyMessage && (
            <p className="text-sm font-medium mb-1 opacity-80">{displayName}</p>
          )}
          
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {/* 타임스탬프 */}
          <p className="text-xs opacity-50 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 채팅 로딩 인디케이터
 * AI가 응답을 생성 중일 때 표시
 */
export function ChatLoading({ }: ChatLoadingProps) {
  return (
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
  );
}