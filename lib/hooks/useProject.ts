// lib/hooks/useProject.ts
// 프로젝트 데이터 관리를 위한 Custom Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { ProjectStatus, InterviewStatus, ProjectBlueprint } from '@/types/project';

// 팀원 데이터 타입
interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  userId?: string;
  role?: string;
  interviewStatus: InterviewStatus;
  canStartInterview: boolean;
  agreedToAnalysis: boolean;
  user: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
  };
}

// 프로젝트 데이터 타입
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  inviteCode: string;
  teamSize: number;
  blueprint?: ProjectBlueprint;
  teamAnalysis?: unknown;
  members: TeamMember[];
  createdAt: Date;
}

// Hook의 반환 타입
interface UseProjectReturn {
  // 상태
  project: Project | null;
  currentUser: TeamMember | null;
  loading: boolean;
  error: string | null;
  inviteUrl: string;
  
  // 액션
  fetchProject: () => Promise<void>;
  joinProject: () => Promise<void>;
  completeInterview: (memberId: string) => Promise<void>;
  resetInterview: (memberId: string) => Promise<void>;
  agreeToAnalysis: (memberId: string) => Promise<void>;
  triggerAnalysis: () => Promise<void>;
  resetAllInterviews: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // 로딩 상태
  joiningProject: boolean;
  agreeingToAnalysis: boolean;
  triggeringAnalysis: boolean;
  resettingAllInterviews: boolean;
}

/**
 * 프로젝트 데이터 관리 Custom Hook
 * 프로젝트 정보 조회, 팀원 관리, 면담 상태 관리 등을 담당
 * 
 * @param projectId - 프로젝트 ID
 * @param enablePolling - 실시간 업데이트를 위한 폴링 활성화 여부 (기본값: true)
 * @param pollingInterval - 폴링 간격 (밀리초, 기본값: 5000)
 */
export function useProject(
  projectId: string,
  enablePolling: boolean = true,
  pollingInterval: number = 5000
): UseProjectReturn {
  const { data: session } = useSession();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState('');
  
  // 액션 로딩 상태
  const [joiningProject, setJoiningProject] = useState(false);
  const [agreeingToAnalysis, setAgreeingToAnalysis] = useState(false);
  const [triggeringAnalysis, setTriggeringAnalysis] = useState(false);
  const [resettingAllInterviews, setResettingAllInterviews] = useState(false);
  
  // 폴링을 위한 ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      
      // 현재 사용자 정보를 members에서 찾기
      const user = data.members?.find((member: TeamMember) => 
        member.user.id === session?.user?.id
      ) || null;
      setCurrentUser(user);
      
      // 초대 URL 설정
      if (typeof window !== 'undefined') {
        setInviteUrl(`${window.location.origin}/projects/${projectId}`);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, session?.user?.id]);

  /**
   * 프로젝트 참가하기
   */
  const joinProject = async () => {
    if (!session?.user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setJoiningProject(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '프로젝트 참가에 실패했습니다.');
      }

      toast.success('프로젝트에 성공적으로 참가했습니다!');
      await fetchProject();
    } catch (error) {
      console.error('Error joining project:', error);
      toast.error(error instanceof Error ? error.message : '프로젝트 참가에 실패했습니다.');
    } finally {
      setJoiningProject(false);
    }
  };

  /**
   * 면담 완료 처리 (테스트용)
   */
  const completeInterview = async (memberId: string) => {
    try {
      const response = await fetch(`/api/test/complete-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error('면담 완료 처리 실패');

      toast.success('면담이 완료되었습니다!');
      await fetchProject();
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('면담 완료 처리에 실패했습니다.');
    }
  };

  /**
   * 면담 초기화 (테스트용)
   */
  const resetInterview = async (memberId: string) => {
    try {
      const response = await fetch(`/api/test/reset-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error('면담 초기화 실패');

      toast.success('면담이 초기화되었습니다!');
      await fetchProject();
    } catch (error) {
      console.error('Error resetting interview:', error);
      toast.error('면담 초기화에 실패했습니다.');
    }
  };

  /**
   * 팀 분석 동의
   */
  const agreeToAnalysis = async (memberId: string) => {
    setAgreeingToAnalysis(true);
    try {
      const response = await fetch(`/api/test/agree-to-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error('동의 처리 실패');

      toast.success('팀 분석에 동의했습니다!');
      await fetchProject();
    } catch (error) {
      console.error('Error agreeing to analysis:', error);
      toast.error('동의 처리에 실패했습니다.');
    } finally {
      setAgreeingToAnalysis(false);
    }
  };

  /**
   * 팀 분석 실행
   */
  const triggerAnalysis = async () => {
    setTriggeringAnalysis(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('분석 시작 실패');

      toast.success('팀 분석이 시작되었습니다!');
      await fetchProject();
    } catch (error) {
      console.error('Error triggering analysis:', error);
      toast.error('팀 분석 시작에 실패했습니다.');
    } finally {
      setTriggeringAnalysis(false);
    }
  };

  /**
   * 모든 면담 초기화
   */
  const resetAllInterviews = async () => {
    setResettingAllInterviews(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/reset-interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('전체 면담 초기화 실패');

      const data = await response.json();
      toast.success(`${data.resetCount}명의 면담이 초기화되었습니다!`);
      await fetchProject();
    } catch (error) {
      console.error('Error resetting all interviews:', error);
      toast.error('전체 면담 초기화에 실패했습니다.');
    } finally {
      setResettingAllInterviews(false);
    }
  };

  /**
   * 데이터 새로고침
   */
  const refreshData = async () => {
    await fetchProject();
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId && session?.user?.id) {
      fetchProject();
    }
  }, [projectId, session?.user?.id, fetchProject]);

  // 실시간 업데이트 (폴링)
  useEffect(() => {
    if (enablePolling && project && project.status === ProjectStatus.RECRUITING) {
      intervalRef.current = setInterval(() => {
        fetchProject();
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enablePolling, project, pollingInterval, fetchProject]);

  return {
    // 상태
    project,
    currentUser,
    loading,
    error,
    inviteUrl,
    
    // 액션
    fetchProject,
    joinProject,
    completeInterview,
    resetInterview,
    agreeToAnalysis,
    triggerAnalysis,
    resetAllInterviews,
    refreshData,
    
    // 로딩 상태
    joiningProject,
    agreeingToAnalysis,
    triggeringAnalysis,
    resettingAllInterviews,
  };
}