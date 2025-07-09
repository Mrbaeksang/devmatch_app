// types/project.ts
// 프로젝트 관련 공통 타입 정의

/**
 * 프로젝트 상태 열거형
 */
export enum ProjectStatus {
  RECRUITING = 'RECRUITING',   // 팀원 모집 중
  CONSULTING = 'CONSULTING',   // 개별 상담 진행 중
  ANALYZING = 'ANALYZING',     // AI 분석 중
  ACTIVE = 'ACTIVE',           // 프로젝트 진행 중
  COMPLETED = 'COMPLETED',     // 프로젝트 완료
  PAUSED = 'PAUSED'            // 일시 정지
}

/**
 * 팀원 인터페이스
 */
export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  userId?: string;
  consultationCompleted: boolean;
  joinedAt: Date;
  isActive: boolean;
  consultationData?: ConsultationData;
}

/**
 * AI 제안 역할
 */
export interface AIRole {
  role: string;
  count: number;
  note?: string;
}

/**
 * 상담 데이터 인터페이스
 */
export interface ConsultationData {
  userName?: string;
  projectName?: string;
  projectGoal?: string;
  techStack?: string[];
  mainFeatures?: string[];
  communicationSkills?: string[];
  teamMembersCount?: number;
  aiSuggestedRoles?: AIRole[];
}

/**
 * 프로젝트 인터페이스
 */
export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  inviteCode: string;
  maxMembers: number;
  createdBy: string;
  members: TeamMember[];
  techStack: string[];
  consultationData?: ConsultationData;
  aiAnalysis?: {
    strengths: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 프로젝트 생성 데이터
 */
export interface CreateProjectData {
  name: string;
  description: string;
  consultationData: ConsultationData;
  maxMembers?: number;
}

/**
 * 프로젝트 업데이트 데이터
 */
export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  progress?: number;
  maxMembers?: number;
}

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'system' | 'ai';
}