// lib/types/index.ts
// 타입 중앙 관리 (최적화된 exports)

// 공통 타입 (중복 제거된 기본 타입들)
export * from './common.types';

// 프로젝트 타입들 (중복 타입 제외하고 선별 export)
export type {
  Project,
  CreateProjectData,
  UpdateProjectData,
  AIRole,
  MemberAnalysis,
  AIAnalysisResponse,
  LeadershipAnalysis,
  LeaderCandidate,
  TeamAnalysis,
  RoleAssignment,
  TeamWaitingRoom,
  TeamMemberExtended,
  ProjectState
} from './project.types';

// 면담 시스템 타입만 선별 export
export type { 
  InterviewRequest, 
  InterviewResponse, 
  InterviewContext,
  ProjectInfo,
  MemberInfo
} from './interview.types';

// 상담 시스템 타입만 선별 export (중복 방지)
export type { 
  ConsultationRequest, 
  ConsultationResponse, 
  ConsultationContext,
  ProjectBlueprint
} from './consultation.types';