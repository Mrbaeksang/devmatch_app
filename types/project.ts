// types/project.ts
// DevMatch 프로젝트 관련 타입 정의 (error.md 설계 기반)

import { ConsultationData, ChatMessage } from '@/types/chat';
import { 
  ProjectStatus, 
  InterviewStatus, 
  MemberProfile, 
  TechStackStructure, 
  RoleSuggestion 
} from '@/lib/types/common.types';

// Re-export for backward compatibility
export { ProjectStatus, InterviewStatus };
export type { MemberProfile, TechStackStructure, RoleSuggestion };

/**
 * 팀원 인터페이스 (Prisma 스키마와 일치)
 */
export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  joinedAt: Date;
  interviewStatus: InterviewStatus;  // 통합된 면담 상태
  memberProfile?: MemberProfile;     // 면담 결과
  role?: string | null;              // 최종 배정 역할
  user?: {
    id: string;
    name: string | null;
    email?: string | null;
  };
  // 호환성을 위한 추가 필드들
  name?: string;
  avatar?: string;
}

/**
 * AI 제안 역할 (확장됨)
 */
export interface AIRole {
  role: string;
  count: number;
  note?: string;
}

// RoleSuggestion은 common.types.ts에서 import하여 사용

// TechStackStructure는 common.types.ts에서 import하여 사용

/**
 * 프로젝트 청사진 (새로운 설계)
 */
export interface ProjectBlueprint {
  // 기본 정보
  creatorName: string;           // 생성자 이름
  projectName: string;           // 프로젝트명
  projectDescription: string;    // 상세 설명

  // 기술 정보
  techStack: string[] | TechStackStructure;  // 기술 스택 (배열 또는 3-category)
  projectType: string;          // 프로젝트 유형 (웹앱, 모바일 등)
  complexity: 'beginner' | 'intermediate' | 'advanced';

  // 일정 정보
  duration: string;             // "2주", "1개월" 등

  // 추가 정보
  requirements: string[];       // 특별 요구사항
  goals: string[];             // 세부 목표들

  // 팀 정보
  teamSize: number;             // 팀원 수
  preferredRoles: string[];     // 필요한 역할들
  
  // AI 제안 역할
  aiSuggestedRoles: RoleSuggestion[];
}

// MemberProfile은 common.types.ts에서 import하여 사용

/**
 * AI 분석 결과 - 개별 멤버 분석 (2025.01 추가)
 */
export interface MemberAnalysis {
  userId: string;               // 사용자 ID
  role: string;                 // 배정된 역할 (겸직 가능)
  strengths: string[];          // 개인 강점
  leadershipScore: number;      // 팀장 적합도% (0-100)
}

/**
 * AI 분석 전체 응답 구조 (2025.01 추가)
 */
export interface AIAnalysisResponse {
  teamAnalysis: {
    teamStrengths: string[];           // 팀 강점 3개
    aiAdvice: string[];                // AI 조언 2개  
    operationRecommendations: string[];// 운영 권장 2개
    leadershipDistribution: Record<string, number>; // 팀장적합도% 분배
  };
  memberAnalysis: MemberAnalysis[];    // 개별 멤버 분석 결과
}

// ConsultationData는 types/chat.ts에서 import하여 사용
// 중복 정의 제거됨

/**
 * 프로젝트 인터페이스 (Prisma 스키마와 일치)
 */
export interface Project {
  id: string;
  name: string;
  description: string;  // goal과 description 통합
  status: ProjectStatus;
  inviteCode: string;
  teamSize: number;     // maxMembers → teamSize
  members: TeamMember[];
  techStack: string[] | TechStackStructure;  // 타입 안정성 개선
  blueprint?: ProjectBlueprint;    // AI 상담 결과
  teamAnalysis?: TeamAnalysis;     // 최종 분석 결과
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 프로젝트 생성 데이터
 */
export interface CreateProjectData {
  name: string;
  description: string;
  blueprint: ProjectBlueprint;
  teamSize?: number;
}

/**
 * 프로젝트 업데이트 데이터
 */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  teamSize?: number;
}

/**
 * 리더십 분석 (실제 API 응답 구조)
 */
export interface LeadershipAnalysis {
  recommendedLeader: string;       // 추천 리더 userId
  leadershipScores: Array<{
    userId: string;
    score: number;
    reasoning: string;
  }>;
  
  // 호환성을 위한 추가 필드들
  candidates?: LeaderCandidate[];
  selectedLeader?: string;
  selectionReason?: string;
  alternativeLeaders?: string[];
  reason?: string;                 // 리더 선정 이유
}

/**
 * 팀장 후보 분석
 */
export interface LeaderCandidate {
  memberId: string;
  memberName: string;
  leadershipScore: number;        // AI 평가 점수
  strengths: string[];            // 리더십 장점
  concerns: string[];             // 우려사항
  recommendation: 'primary' | 'secondary' | 'not_recommended';
}

/**
 * 팀 종합 분석 결과 (새로운 간소화된 구조)
 */
export interface TeamAnalysis {
  // 새로운 구조 (2025.01 업데이트)
  teamStrengths?: string[];           // 팀 강점 3개
  aiAdvice?: string[];                // AI 조언 2개  
  operationRecommendations?: string[];// 운영 권장 2개
  leadershipDistribution?: Record<string, number>; // 팀장적합도% 분배 (합계 100%)
  
  // 기존 구조 (하위 호환성)
  overallScore?: number;        // 전체 점수 (0-100)
  strengths?: string[];         // 팀의 강점
  concerns?: string[];          // 우려사항
  recommendations?: string[];   // AI 추천사항
  leadershipAnalysis?: LeadershipAnalysis;
  
  // 추가 필드들 (호환성)
  projectInfo?: ProjectBlueprint;
  teamMembers?: MemberProfile[];
  roleAssignments?: RoleAssignment[] | Record<string, string>;
  compatibilityScore?: number;
  skillCoverage?: number;       // 기술 커버리지 
  teamworkScore?: number;       // 팀워크 점수
  summary?: string;             // AI 종합 분석
}

/**
 * 역할 배정 결과 (실제 API 응답 구조)
 */
export interface RoleAssignment {
  userId: string;
  assignedRole: string;       // 배정된 역할
  isLeader: boolean;          // 팀장 여부
  reasoning: string;          // 배정 이유
  responsibilities: string[]; // 세부 책임
  matchScore: number;         // 적합도 점수 (0-100)
  
  // 호환성을 위한 추가 필드들
  memberId?: string;
  memberName?: string;
  primaryRole?: string;
  reasonings?: string[];
  isTeamLeader?: boolean;
}

/**
 * 팀 대기실 상태 관리
 */
export interface TeamWaitingRoom {
  project: ProjectBlueprint;
  members: TeamMemberExtended[];
  inviteCode: string;
  status: 'RECRUITING' | 'INTERVIEWING' | 'READY_FOR_ANALYSIS';
  canStartInterview: boolean;     // 면담 시작 가능 여부
}

/**
 * 팀원 상태 정보 (확장됨)
 */
export interface TeamMemberExtended extends TeamMember {
  interviewStatus: InterviewStatus;
  canStartInterview: boolean;     // 개별 면담 가능 여부
  memberProfile?: MemberProfile;  // 면담 완료 시 프로필 데이터
}

/**
 * 프로젝트 전체 상태
 */
export interface ProjectState {
  id: string;
  status: ProjectStatus;
  // interviewPhase 제거됨 - 개별 멤버의 interviewStatus로 관리
  blueprint?: ProjectBlueprint;
  teamAnalysis?: TeamAnalysis;
  progress: number;
}

// 채팅 메시지는 types/chat.ts에서 import하여 사용
// 중복 정의 제거