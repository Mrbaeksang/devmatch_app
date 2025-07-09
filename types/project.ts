// types/project.ts
// DevMatch 프로젝트 관련 타입 정의 (error.md 설계 기반)

/**
 * 프로젝트 상태 열거형 (수정됨)
 */
export enum ProjectStatus {
  RECRUITING = 'RECRUITING',   // 팀원 모집 중
  INTERVIEWING = 'INTERVIEWING', // 개별 면담 진행 중
  ANALYZING = 'ANALYZING',     // AI 분석 중
  ACTIVE = 'ACTIVE',           // 프로젝트 진행 중
  COMPLETED = 'COMPLETED',     // 프로젝트 완료
  PAUSED = 'PAUSED'            // 일시 정지
}

/**
 * 면담 단계 열거형
 */
export enum InterviewPhase {
  PENDING = 'PENDING',         // 면담 대기
  IN_PROGRESS = 'IN_PROGRESS', // 면담 진행 중
  COMPLETED = 'COMPLETED'      // 면담 완료
}

/**
 * 면담 상태 열거형
 */
export enum InterviewStatus {
  PENDING = 'PENDING',         // 면담 대기
  IN_PROGRESS = 'IN_PROGRESS', // 면담 진행 중
  COMPLETED = 'COMPLETED'      // 면담 완료
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
 * AI 제안 역할 (확장됨)
 */
export interface AIRole {
  role: string;
  count: number;
  note?: string;
}

/**
 * 역할 제안 (새로운 설계)
 */
export interface RoleSuggestion {
  roleName: string;             // 역할명
  count: number;                // 필요 인원
  description: string;          // 역할 설명
  requirements: string[];       // 필요 스킬
  isLeader: boolean;           // 팀장 여부
}

/**
 * 프로젝트 청사진 (새로운 설계)
 */
export interface ProjectBlueprint {
  // 기본 정보
  creatorName: string;           // 생성자 이름
  projectName: string;           // 프로젝트명
  projectDescription: string;    // 상세 설명

  // 기술 정보
  techStack: string[];          // 기술 스택 배열
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

/**
 * 팀원 프로필 (개별 면담에서 수집)
 */
export interface MemberProfile {
  // 기본 정보
  memberId: string;
  memberName: string;

  // 기술 역량
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  strongSkills: string[];      // 자신있는 기술
  learningGoals: string[];     // 배우고 싶은 것

  // 역할 선호도
  preferredRole: 'frontend' | 'backend' | 'fullstack' | 'leader';
  
  // 팀장 관련 (개선된 4단계 시스템)
  leadershipLevel: 'none' | 'interested' | 'experienced' | 'preferred';
  leadershipExperience: string[];  // 팀장 경험 설명
  leadershipMotivation: string;    // 팀장 지원 동기

  // 협업 스타일
  workStyle: 'individual' | 'collaborative' | 'mixed';

  // 프로젝트 관련
  projectMotivation: string;   // 참여 동기
  contributions: string[];     // 기여하고 싶은 부분
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
 * 리더십 분석 (팀장 선정을 위한 AI 분석)
 */
export interface LeadershipAnalysis {
  candidates: LeaderCandidate[];
  selectedLeader: string;
  selectionReason: string;
  alternativeLeaders: string[];    // 부팀장 후보
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
 * 팀 종합 분석 결과
 */
export interface TeamAnalysis {
  projectInfo: ProjectBlueprint;
  teamMembers: MemberProfile[];
  
  // AI 분석 결과
  roleAssignments: RoleAssignment[];
  leadershipAnalysis: LeadershipAnalysis;
  recommendations: string[];   // AI 추천사항
  compatibilityScore: number;  // 팀 호환성 점수
}

/**
 * 역할 배정 결과
 */
export interface RoleAssignment {
  memberId: string;
  memberName: string;
  primaryRole: string;        // 주 역할
  responsibilities: string[]; // 세부 책임
  reasonings: string[];      // 배정 이유
  isTeamLeader: boolean;     // 팀장 여부
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
  interviewPhase: InterviewPhase;
  blueprint?: ProjectBlueprint;
  teamAnalysis?: TeamAnalysis;
  progress: number;
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