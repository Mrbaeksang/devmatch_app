// lib/hooks/useAnalysis.ts
// 팀 분석 기능을 위한 Custom Hook

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  ProjectStatus, 
  InterviewStatus, 
  TeamAnalysis
} from '@/types/project';

// 팀원 정보 (확장된 구조)
interface TeamMemberExtended {
  id: string;
  name: string;
  userId: string;
  interviewStatus: InterviewStatus;
  memberProfile?: {
    skillScores?: Record<string, number>;
    workStyles?: string[];
    strengths?: string[];
    leadershipScore?: number;
    expertiseScore?: number;
    experienceScore?: number;
    passionScore?: number;
  };
  role?: string;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string | null;
  };
}

// 프로젝트 정보 (확장된 구조)
interface ProjectExtended {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  inviteCode: string;
  teamSize: number;
  blueprint?: unknown;
  teamAnalysis?: TeamAnalysis;
  members: TeamMemberExtended[];
  createdAt: Date;
}

// Hook의 반환 타입
interface UseAnalysisReturn {
  // 상태
  project: ProjectExtended | null;
  loading: boolean;
  error: string | null;
  selectedMember: TeamMemberExtended | null;
  
  // 액션
  setSelectedMember: (member: TeamMemberExtended | null) => void;
  fetchProject: () => Promise<void>;
  startChatting: () => void;
  goBack: () => void;
  
  // 계산된 값
  isAnalyzing: boolean;
  isAnalysisComplete: boolean;
  canStartChatting: boolean;
  analysisProgress: number;
  totalScore: number;
  recommendedLeader: TeamMemberExtended | undefined;
  roleDistribution: Record<string, TeamMemberExtended[]>;
}

/**
 * 팀 분석 Custom Hook
 * AI 팀 분석 결과를 표시하고 관리
 * 
 * @param projectId - 프로젝트 ID
 * @param enablePolling - 실시간 업데이트를 위한 폴링 활성화 여부 (기본값: true)
 * @param pollingInterval - 폴링 간격 (밀리초, 기본값: 5000)
 */
export function useAnalysis(
  projectId: string,
  enablePolling: boolean = true,
  pollingInterval: number = 5000
): UseAnalysisReturn {
  const router = useRouter();
  
  // 상태 관리
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectExtended | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMemberExtended | null>(null);
  
  // 자동 새로고침을 위한 인터벌
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  /**
   * 프로젝트 데이터 가져오기
   */
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      
      const data = await response.json();
      
      // 타입 변환 및 데이터 매핑
      const projectData: ProjectExtended = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        inviteCode: data.inviteCode,
        teamSize: data.teamSize,
        blueprint: data.blueprint,
        teamAnalysis: data.teamAnalysis,
        members: data.members?.map((member: any) => ({
          id: member.id,
          name: member.user?.nickname || member.user?.name || member.name || '알 수 없음',
          userId: member.userId || member.user?.id,
          interviewStatus: member.interviewStatus,
          memberProfile: member.memberProfile,
          role: member.role,
          joinedAt: new Date(member.joinedAt)
        })) || [],
        createdAt: new Date(data.createdAt)
      };
      
      setProject(projectData);
      setError(null);
      
      // 분석 완료 시 폴링 중지
      if (projectData.teamAnalysis) {
        console.log('팀 분석이 완료되었습니다. 폴링을 중지합니다.');
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
      }
      
    } catch (error) {
      console.error('프로젝트 정보 조회 오류:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, intervalId]);

  /**
   * 채팅 시작
   */
  const startChatting = () => {
    toast.success('팀 채팅이 활성화되었습니다!');
    router.push(`/projects/${projectId}/chat`);
  };

  /**
   * 뒤로가기
   */
  const goBack = () => {
    router.push(`/projects/${projectId}`);
  };

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  /**
   * 자동 새로고침 (폴링)
   * 분석 중일 때만 활성화
   */
  useEffect(() => {
    if (enablePolling && project && project.status === ProjectStatus.ANALYZING && !project.teamAnalysis) {
      const id = setInterval(() => {
        console.log('프로젝트 정보 자동 새로고침...');
        fetchProject();
      }, pollingInterval);
      
      setIntervalId(id);

      return () => {
        clearInterval(id);
      };
    }
  }, [enablePolling, project, pollingInterval, fetchProject]);

  /**
   * 계산된 값들
   */
  const isAnalyzing = project?.status === ProjectStatus.ANALYZING && !project?.teamAnalysis;
  const isAnalysisComplete = Boolean(project?.teamAnalysis);
  const canStartChatting = isAnalysisComplete && project?.status === ProjectStatus.ANALYZING;
  
  // 분석 진행률 계산
  const analysisProgress = (() => {
    if (!project) return 0;
    if (isAnalysisComplete) return 100;
    if (isAnalyzing) return 50; // 분석 중일 때는 50%로 표시
    return 0;
  })();
  
  // 전체 팀 점수
  const totalScore = project?.teamAnalysis?.overallScore || 0;
  
  // 추천 리더 찾기
  const recommendedLeader = project?.members.find(
    member => member.id === project.teamAnalysis?.leadershipAnalysis?.recommendedLeader
  );
  
  // 역할 분포 계산
  const roleDistribution = (() => {
    const distribution: Record<string, TeamMemberExtended[]> = {};
    
    if (project?.teamAnalysis?.roleAssignments) {
      // roleAssignments가 배열인지 객체인지 확인
      if (Array.isArray(project.teamAnalysis.roleAssignments)) {
        // 배열 형태 처리
        project.teamAnalysis.roleAssignments.forEach(assignment => {
          const member = project.members.find(m => m.userId === assignment.userId);
          if (member) {
            const role = assignment.assignedRole;
            if (!distribution[role]) {
              distribution[role] = [];
            }
            distribution[role].push(member);
          }
        });
      } else {
        // 객체 형태 처리 (Record<string, string>)
        Object.entries(project.teamAnalysis.roleAssignments).forEach(([memberId, role]) => {
          const member = project.members.find(m => m.id === memberId);
          if (member && typeof role === 'string') {
            if (!distribution[role]) {
              distribution[role] = [];
            }
            distribution[role].push(member);
          }
        });
      }
    }
    
    return distribution;
  })();

  return {
    // 상태
    project,
    loading,
    error,
    selectedMember,
    
    // 액션
    setSelectedMember,
    fetchProject,
    startChatting,
    goBack,
    
    // 계산된 값
    isAnalyzing,
    isAnalysisComplete,
    canStartChatting,
    analysisProgress,
    totalScore,
    recommendedLeader,
    roleDistribution,
  };
}