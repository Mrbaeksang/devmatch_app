// lib/hooks/useProjects.ts
// 프로젝트 목록 관리 Custom Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectStatus, InterviewStatus } from '@/types/project';

// 사용자 프로젝트 타입
interface UserProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamSize: number;
  currentMembers: number;
  joinedAt: Date;
  myRole?: string;
  myInterviewStatus: InterviewStatus;
  inviteCode: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    interviewStatus: InterviewStatus;
    role?: string;
  }>;
  blueprint?: unknown;
  teamAnalysis?: unknown;
  createdAt: Date;
}

// Hook의 반환 타입
interface UseProjectsReturn {
  // 상태
  myProjects: UserProject[];
  loading: boolean;
  error: string | null;
  pollingEnabled: boolean;
  
  // 액션
  fetchMyProjects: () => Promise<void>;
  setPollingEnabled: (enabled: boolean) => void;
  goToProject: (project: UserProject) => void;
  createNewProject: () => void;
  
  // 계산된 값
  activeProjectsCount: number;
  completedProjectsCount: number;
}

/**
 * 프로젝트 목록 Custom Hook
 * 사용자가 참여중인 프로젝트 목록을 관리하고 폴링 기능 제공
 * 
 * @param enablePolling - 실시간 업데이트 활성화 여부 (기본값: true)
 * @param pollingInterval - 폴링 간격 (기본값: 5초)
 */
export function useProjects(
  enablePolling: boolean = true,
  pollingInterval: number = 5000
): UseProjectsReturn {
  const router = useRouter();
  
  // ===== 상태 관리 =====
  const [myProjects, setMyProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(enablePolling);
  
  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * 내 프로젝트 목록 가져오기
   */
  const fetchMyProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects/my-projects');
      if (!response.ok) {
        throw new Error('프로젝트 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setMyProjects(data);
      setError(null);
    } catch (error) {
      console.error('프로젝트 목록 조회 오류:', error);
      setError(error instanceof Error ? error.message : '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * 프로젝트로 이동
   * 프로젝트 상태에 따라 적절한 페이지로 라우팅
   */
  const goToProject = useCallback((project: UserProject) => {
    // 면담 미완료 시 면담 페이지로
    if (project.myInterviewStatus !== InterviewStatus.COMPLETED) {
      const myMember = project.members.find(m => m.interviewStatus !== InterviewStatus.COMPLETED);
      if (myMember) {
        router.push(`/projects/${project.id}/interview?memberId=${myMember.id}`);
        return;
      }
    }
    
    // 분석 중이거나 완료된 경우 분석 페이지로
    if (project.status === ProjectStatus.ANALYZING || 
        project.status === ProjectStatus.ACTIVE) {
      router.push(`/projects/${project.id}/analysis`);
      return;
    }
    
    // 기본: 프로젝트 메인 페이지로
    router.push(`/projects/${project.id}`);
  }, [router]);
  
  /**
   * 새 프로젝트 생성
   */
  const createNewProject = useCallback(() => {
    router.push('/projects/create');
  }, [router]);
  
  /**
   * 초기 로드
   */
  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);
  
  /**
   * 실시간 업데이트 (폴링)
   */
  useEffect(() => {
    if (pollingEnabled && !loading) {
      intervalRef.current = setInterval(() => {
        fetchMyProjects();
      }, pollingInterval);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollingEnabled, loading, pollingInterval, fetchMyProjects]);
  
  /**
   * 계산된 값들
   */
  const activeProjectsCount = myProjects.filter(
    p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELLED
  ).length;
  
  const completedProjectsCount = myProjects.filter(
    p => p.status === ProjectStatus.COMPLETED
  ).length;
  
  return {
    // 상태
    myProjects,
    loading,
    error,
    pollingEnabled,
    
    // 액션
    fetchMyProjects,
    setPollingEnabled,
    goToProject,
    createNewProject,
    
    // 계산된 값
    activeProjectsCount,
    completedProjectsCount,
  };
}