// lib/hooks/useChat.ts
// 팀 채팅 기능을 위한 Custom Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ProjectStatus, InterviewStatus } from '@/types/project';

// 채팅 메시지 타입
interface ChatMessage {
  id: string;
  projectId: string;
  userId?: string;
  content: string;
  type: 'USER' | 'SYSTEM' | 'AI';
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
  };
}

// 프로젝트 정보 타입 (채팅용 간소화 버전)
interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamSize: number;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    interviewStatus: InterviewStatus;
    role?: string;
    user: {
      id: string;
      name: string;
      nickname?: string;
      avatar?: string;
    };
  }>;
  teamAnalysis?: {
    overallScore: number;
    leadershipAnalysis?: {
      recommendedLeader: string;
    };
  };
  createdAt: Date;
}

// Hook의 반환 타입
interface UseChatReturn {
  // 상태
  project: ProjectInfo | null;
  messages: ChatMessage[];
  newMessage: string;
  loading: boolean;
  sending: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  
  // 액션
  setNewMessage: (message: string) => void;
  sendMessage: (e: React.FormEvent) => Promise<void>;
  scrollToBottom: () => void;
  refreshData: () => Promise<void>;
  
  // 계산된 값
  currentMember: ProjectInfo['members'][0] | undefined;
  isTeamLead: boolean;
  canChat: boolean;
}

/**
 * 팀 채팅 Custom Hook
 * 프로젝트 채팅방의 모든 기능을 관리
 * 
 * @param projectId - 프로젝트 ID
 * @param enablePolling - 실시간 업데이트를 위한 폴링 활성화 여부 (기본값: true)
 * @param pollingInterval - 폴링 간격 (밀리초, 기본값: 3000)
 */
export function useChat(
  projectId: string,
  enablePolling: boolean = true,
  pollingInterval: number = 3000
): UseChatReturn {
  const { data: session } = useSession();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 메시지 끝으로 스크롤
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * 프로젝트 정보 가져오기
   */
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      
      const data = await response.json();
      setProject(data);
      setError(null);
    } catch (error) {
      console.error('프로젝트 정보 조회 오류:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [projectId]);

  /**
   * 채팅 메시지 가져오기
   */
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/chat/messages`);
      if (!response.ok) {
        // 채팅방이 없으면 빈 배열 반환
        if (response.status === 404) {
          setMessages([]);
          return;
        }
        throw new Error('메시지를 불러올 수 없습니다.');
      }
      
      const data = await response.json();
      setMessages(data);
      
      // 새 메시지가 있으면 스크롤
      if (data.length > messages.length) {
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('메시지 조회 오류:', error);
      // 에러 발생시에도 빈 배열로 설정하여 UI가 깨지지 않도록
      setMessages([]);
    }
  }, [projectId, messages.length]);

  /**
   * 메시지 전송
   */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error('메시지 전송에 실패했습니다.');
      }

      // 메시지 전송 성공
      setNewMessage('');
      await fetchMessages();
      scrollToBottom();
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      toast.error(error instanceof Error ? error.message : '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  /**
   * 전체 데이터 새로고침
   */
  const refreshData = async () => {
    await Promise.all([fetchProject(), fetchMessages()]);
  };

  /**
   * 초기 데이터 로드 및 권한 확인
   */
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 프로젝트 정보 먼저 가져오기
        await fetchProject();
        // 그 다음 메시지 가져오기
        await fetchMessages();
      } finally {
        setLoading(false);
      }
    };

    if (projectId && session?.user?.id) {
      loadData();
    }
  }, [projectId, session?.user?.id, fetchProject, fetchMessages]);

  /**
   * 실시간 업데이트 (폴링)
   * 채팅이 활성화된 경우에만 작동
   */
  useEffect(() => {
    if (enablePolling && project && project.status === ProjectStatus.ACTIVE) {
      intervalRef.current = setInterval(() => {
        fetchMessages();
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enablePolling, project, pollingInterval, fetchMessages]);

  /**
   * 계산된 값들
   */
  const currentMember = project?.members.find(
    member => member.user.id === session?.user?.id
  );
  
  const isTeamLead = currentMember?.role === 'TEAMLEAD';
  
  const canChat = Boolean(
    project && 
    currentMember && 
    project.status === ProjectStatus.ACTIVE
  );

  return {
    // 상태
    project,
    messages,
    newMessage,
    loading,
    sending,
    error,
    messagesEndRef,
    chatContainerRef,
    
    // 액션
    setNewMessage,
    sendMessage,
    scrollToBottom,
    refreshData,
    
    // 계산된 값
    currentMember,
    isTeamLead,
    canChat,
  };
}