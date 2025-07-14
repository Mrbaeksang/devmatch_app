// lib/hooks/useInterview.ts
// 면담 기능을 위한 Custom Hook

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InterviewStatus } from '@/types/project';

// 메시지 타입 정의
interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 멤버 프로필 타입 정의
interface MemberProfile {
  skillScores: Record<string, number>;
  roleAptitudes: Record<string, number>;
  workStyles: string[];
}

// Hook의 반환 타입
interface UseInterviewReturn {
  // 상태
  userInput: string;
  chatHistory: Message[];
  isLoading: boolean;
  isInitializing: boolean;
  memberProfile: MemberProfile;
  isComplete: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  
  // 액션
  setUserInput: (input: string) => void;
  sendMessage: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleGoBack: () => void;
  
  // 계산된 값
  canSendMessage: boolean;
}

/**
 * 면담 Custom Hook
 * 1:1 AI 면담의 모든 기능을 관리
 * 
 * @param projectId - 프로젝트 ID
 * @param memberId - 멤버 ID
 * @param userId - 현재 로그인한 사용자 ID (권한 체크용)
 */
export function useInterview(
  projectId: string,
  memberId: string,
  userId?: string
): UseInterviewReturn {
  const router = useRouter();
  
  // ===== 상태 관리 (원본 코드 그대로) =====
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [memberProfile, setMemberProfile] = useState<MemberProfile>({
    skillScores: {},
    roleAptitudes: {},
    workStyles: []
  });
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ===== Refs (초기화 추적용) =====
  const hasInitialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // ===== 채팅 히스토리 변경 시 자동 스크롤 =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ===== 입력창 포커스 =====
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // ===== 초기화 (React StrictMode 대응) =====
  useEffect(() => {
    // 필수 파라미터 체크
    if (!projectId || !memberId) return;

    // AbortController로 중복 요청 방지 (React StrictMode 대응)
    const abortController = new AbortController();
    let redirectTimer: NodeJS.Timeout | null = null;

    const initializeInterview = async () => {
      try {
        console.log('[Interview] 초기화 시작:', { projectId, memberId, timestamp: new Date().toISOString() });
        setIsInitializing(true);
        
        // 1. 프로젝트 정보 조회 및 면담 완료 여부 체크
        const projectResponse = await fetch(`/api/projects/${projectId}`, {
          signal: abortController.signal
        });
        if (!projectResponse.ok) {
          throw new Error('프로젝트 정보를 불러올 수 없습니다.');
        }

        const projectData = await projectResponse.json();
        const currentMember = projectData.members?.find(
          (m: { id: string }) => m.id === memberId
        );

        if (!currentMember) {
          throw new Error('멤버 정보를 찾을 수 없습니다.');
        }

        // 권한 체크 - 본인의 면담만 가능
        if (userId && currentMember.userId !== userId) {
          throw new Error('본인의 면담만 진행할 수 있습니다.');
        }

        console.log('[Interview] 멤버 상태:', {
          memberId: currentMember.id,
          interviewStatus: currentMember.interviewStatus,
          hasProfile: !!currentMember.memberProfile
        });

        // 2. 이미 면담이 완료된 경우 처리
        if (currentMember.interviewStatus === InterviewStatus.COMPLETED) {
          console.log('[Interview] 이미 완료된 면담입니다. 프로젝트 페이지로 이동합니다.');
          toast.success('면담이 이미 완료되었습니다. 프로젝트 페이지로 이동합니다.');
          
          // 리다이렉트 (3초 대기)
          redirectTimer = setTimeout(() => {
            router.push(`/projects/${projectId}?refresh=true`);
          }, 3000);
          
          setIsComplete(true);
          return;
        }

        // 3. 면담 상태 업데이트 (PENDING -> IN_PROGRESS)
        if (currentMember.interviewStatus === InterviewStatus.PENDING) {
          const updateResponse = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interviewStatus: InterviewStatus.IN_PROGRESS }),
            signal: abortController.signal
          });

          if (!updateResponse.ok) {
            console.error('[Interview] 상태 업데이트 실패');
          }
        }

        // 4. 초기 AI 메시지 생성
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          
          console.log('[Interview] 초기 메시지 생성 중...');
          const initialResponse = await fetch(`/api/projects/${projectId}/interview`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberId,
              projectId,
              userInput: "", // 빈 입력으로 첫 메시지 요청
              chatHistory: [],
              memberProfile: {}
            }),
            signal: abortController.signal
          });

          if (!initialResponse.ok) {
            const errorData = await initialResponse.json();
            throw new Error(errorData.error || '면담 시작에 실패했습니다.');
          }

          const data = await initialResponse.json();
          
          const initialMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: data.response,
            timestamp: new Date()
          };
          
          setChatHistory([initialMessage]);
        }
        
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('[Interview] 요청이 취소되었습니다.');
          return;
        }
        
        console.error('[Interview] 초기화 오류:', error);
        setError(error.message || '면담을 시작할 수 없습니다.');
        toast.error(error.message || '면담을 시작할 수 없습니다.');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeInterview();

    // Cleanup
    return () => {
      abortController.abort();
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [projectId, memberId, userId, router]);

  // ===== 메시지 전송 함수 =====
  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      console.log('[Interview] 메시지 전송:', {
        memberId,
        projectId,
        userInput: userInput.substring(0, 50) + '...',
        chatHistoryLength: chatHistory.length
      });

      const response = await fetch(`/api/projects/${projectId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          projectId,
          userInput,
          chatHistory: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          memberProfile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '응답을 받을 수 없습니다.');
      }

      const data = await response.json();
      console.log('[Interview] AI 응답 수신:', {
        isComplete: data.isComplete,
        hasMemberProfile: !!data.memberProfile
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
      // 프로필 업데이트
      if (data.memberProfile) {
        console.log('[Interview] 프로필 업데이트:', data.memberProfile);
        setMemberProfile(prev => ({
          ...prev,
          ...data.memberProfile
        }));
      }
      
      // 면담 완료 처리
      if (data.isComplete) {
        console.log('[Interview] 면담 완료!');
        setIsComplete(true);
        toast.success('면담이 완료되었습니다! 잠시 후 프로젝트 페이지로 이동합니다.');
        setTimeout(() => {
          router.push(`/projects/${projectId}?refresh=true`);
        }, 3000);
      }
      
    } catch (error: any) {
      console.error('[Interview] 메시지 전송 오류:', error);
      toast.error(error.message || '메시지 전송에 실패했습니다.');
      
      // 에러 시 사용자 메시지 롤백
      setChatHistory(prev => prev.slice(0, -1));
      setUserInput(userInput);
    } finally {
      setIsLoading(false);
    }
  };

  // ===== 키보드 이벤트 핸들러 =====
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ===== 뒤로가기 핸들러 =====
  const handleGoBack = () => {
    router.push(`/projects/${projectId}`);
  };

  // ===== 계산된 값 =====
  const canSendMessage = !isLoading && userInput.trim().length > 0 && !isComplete;

  return {
    // 상태
    userInput,
    chatHistory,
    isLoading,
    isInitializing,
    memberProfile,
    isComplete,
    error,
    messagesEndRef,
    inputRef,
    
    // 액션
    setUserInput,
    sendMessage,
    handleKeyPress,
    handleGoBack,
    
    // 계산된 값
    canSendMessage,
  };
}