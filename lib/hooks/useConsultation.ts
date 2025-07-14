// lib/hooks/useConsultation.ts
// AI 상담 (데피) Custom Hook

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// 메시지 타입
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 프로젝트 생성 결과
interface ProjectResult {
  id: string;
  inviteCode: string;
  [key: string]: unknown;
}

// Hook의 반환 타입
interface UseConsultationReturn {
  // 상태
  messages: Message[];
  userInput: string;
  isLoading: boolean;
  isComplete: boolean;
  projectData: ProjectResult | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  
  // 액션
  setUserInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  navigateToProject: () => void;
  goBack: () => void;
}

/**
 * AI 상담 Custom Hook
 * 데피와의 대화를 통해 프로젝트 청사진을 생성하는 모든 기능 관리
 * 
 * @param userId - 현재 사용자 ID (필수)
 */
export function useConsultation(userId?: string): UseConsultationReturn {
  const router = useRouter();
  
  // ===== 상태 관리 =====
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [projectData, setProjectData] = useState<ProjectResult | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasInitialized = useRef(false);
  
  /**
   * 메시지 추가 헬퍼 함수
   */
  const addMessage = useCallback((role: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(async () => {
    if (!userInput.trim() || isLoading || isComplete) return;
    
    const userMessage = userInput.trim();
    setUserInput("");
    addMessage('user', userMessage);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '응답을 받는 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      
      // AI 응답 추가
      addMessage('ai', data.response);
      
      // 프로젝트 생성 완료 체크
      if (data.complete && data.projectData) {
        setIsComplete(true);
        setProjectData(data.projectData);
        toast.success('프로젝트가 성공적으로 생성되었습니다!');
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      toast.error(error instanceof Error ? error.message : '메시지 전송에 실패했습니다.');
      addMessage('ai', '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, isComplete, messages, addMessage]);
  
  /**
   * 엔터키 처리
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);
  
  /**
   * 프로젝트로 이동
   */
  const navigateToProject = useCallback(() => {
    if (projectData?.id) {
      router.push(`/projects/${projectData.id}`);
    }
  }, [projectData, router]);
  
  /**
   * 뒤로가기
   */
  const goBack = useCallback(() => {
    router.push('/projects');
  }, [router]);
  
  /**
   * 초기 메시지 설정
   */
  useEffect(() => {
    if (!hasInitialized.current && userId) {
      hasInitialized.current = true;
      
      // 초기 인사 메시지
      addMessage('ai', `안녕하세요! 저는 AI 상담사 데피입니다. 🤖

프로젝트 아이디어를 구체화하고 팀 구성을 도와드릴게요.
어떤 프로젝트를 만들고 싶으신가요?

예시:
- "쇼핑몰 웹사이트를 만들고 싶어요"
- "할 일 관리 앱을 개발하려고 해요"
- "간단한 게임을 만들어보고 싶어요"`);
    }
  }, [userId, addMessage]);
  
  /**
   * 메시지 추가 시 스크롤
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  /**
   * 입력창 포커스
   */
  useEffect(() => {
    if (!isLoading && !isComplete) {
      inputRef.current?.focus();
    }
  }, [isLoading, isComplete]);
  
  return {
    // 상태
    messages,
    userInput,
    isLoading,
    isComplete,
    projectData,
    messagesEndRef,
    inputRef,
    
    // 액션
    setUserInput,
    sendMessage,
    handleKeyPress,
    navigateToProject,
    goBack,
  };
}