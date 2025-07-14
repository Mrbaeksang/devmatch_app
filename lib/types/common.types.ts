// lib/types/common.types.ts
// 공통 타입 정의 (중복 제거 및 일관성 확보)

/**
 * 프로젝트 상태 열거형
 * 프로젝트 생명주기의 모든 상태를 정의
 */
export enum ProjectStatus {
  RECRUITING = 'RECRUITING',     // 팀원 모집 중
  INTERVIEWING = 'INTERVIEWING', // 개별 면담 진행 중
  ANALYZING = 'ANALYZING',       // AI 분석 중
  ACTIVE = 'ACTIVE',             // 프로젝트 진행 중
  COMPLETED = 'COMPLETED',       // 프로젝트 완료
  CANCELLED = 'CANCELLED',       // 프로젝트 취소
  PAUSED = 'PAUSED'              // 일시 정지
}

/**
 * 면담 상태 열거형
 * 각 팀원의 면담 진행 상태
 */
export enum InterviewStatus {
  PENDING = 'PENDING',           // 면담 대기
  IN_PROGRESS = 'IN_PROGRESS',   // 면담 진행 중
  COMPLETED = 'COMPLETED'        // 면담 완료
}

/**
 * 기술 스택 3-category 구조 (표준화)
 * AI 상담과 면담에서 공통으로 사용하는 표준 구조
 */
export interface TechStackStructure {
  frontend?: {
    languages?: string[];    // [\"JavaScript\", \"TypeScript\"]
    frameworks?: string[];   // [\"React\", \"Next.js\"]
    tools?: string[];        // [\"Tailwind CSS\", \"SCSS\"]
  };
  backend?: {
    languages?: string[];    // [\"Java\", \"Python\", \"Node.js\"]
    frameworks?: string[];   // [\"Spring Boot\", \"Express\", \"Django\"]
    tools?: string[];        // [\"JPA\", \"MySQL\", \"PostgreSQL\"]
  };
  collaboration: {           // 필수값 (Git/GitHub 항상 포함)
    git: string[];           // [\"Git\", \"GitHub\", \"GitLab\"]
    tools?: string[];        // [\"PR관리\", \"코드리뷰\", \"이슈관리\"]
  };
}

/**
 * 팀 구성 정보 (표준화)
 * 역할별 인원 배치와 팀장 유무 정의
 */
export interface TeamComposition {
  totalMembers: number;
  roleRequirements: {
    backend: number;        // 백엔드 전담 인원 (0 가능, 팀장 포함될 수 있음)
    frontend: number;       // 프론트엔드 전담 인원 (0 가능, 팀장 포함될 수 있음)
    fullstack: number;      // 풀스택 인원 (0 가능, 팀장 포함될 수 있음)
  };
  hasTeamLead: boolean;     // 항상 true (팀장은 위 역할 중 하나에 포함됨)
  allowMultipleRoles: boolean;
  description?: string;     // \"4명 중 1명은 백엔드+프론트엔드 겸업\"
}

/**
 * 멤버 프로필 (표준화)
 * 면담을 통해 수집되는 사용자 정보의 표준 구조
 */
export interface MemberProfile {
  // 핵심 데이터 (필수) - 1-8점 척도
  skillScores: Record<string, number>;  // 기술 점수 {\"React\": 5, \"Node.js\": 3}
  workStyles: string[];                 // 워크스타일 (1개 선택)

  // 선택적 확장 데이터
  strengths?: string[];
  experience?: string;
  motivation?: string;
  availability?: string;
  concerns?: string[];
}

/**
 * 사용자 정보 (표준화)
 * 클라이언트로 전송되는 사용자 데이터 구조
 */
export interface UserInfo {
  id: string;
  name: string | null;
  nickname: string | null;
  email?: string;
}

/**
 * 팀원 정보 (표준화)
 * 프로젝트 팀원의 모든 정보를 포함하는 완전한 구조
 */
export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  joinedAt: Date;
  interviewStatus: InterviewStatus;
  memberProfile?: MemberProfile;
  role?: string | null;
  user?: UserInfo;
}

// ChatMessage는 별도 정의가 필요함 (AI 상담/면담용과 일반 채팅용이 다름)
// AI용 ChatMessage는 아래에 별도 정의
export interface AIMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

/**
 * API 응답 기본 구조 (표준화)
 * 모든 API 응답이 따르는 일관된 구조
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    field?: string;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * 페이지네이션 메타데이터 (표준화)
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션된 응답 구조
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/**
 * 점수 구조 (표준화)
 * 기술 점수, 역할 적합도 등에서 사용하는 공통 구조
 */
export interface ScoreItem {
  name: string;
  score: number;  // 1-8점 척도
}

/**
 * 역할 제안 구조 (표준화)
 */
export interface RoleSuggestion {
  roleName: string;
  count: number;
  description: string;
  requirements: string[];
  isLeader: boolean;
}

/**
 * 프로젝트 기본 정보 (표준화)
 * 클라이언트로 전송되는 프로젝트 요약 정보
 */
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  teamSize: number;
  status: ProjectStatus;
  inviteCode: string;
  createdAt: string;
  memberCount: number;
}

/**
 * 날짜 범위 인터페이스
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * 키-값 쌍 (제네릭)
 */
export interface KeyValuePair<T = string> {
  key: string;
  value: T;
}

/**
 * 선택 가능한 옵션 구조
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * 파일 업로드 결과
 */
export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

/**
 * 시스템 환경 설정
 */
export interface SystemConfig {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  frontendUrl: string;
  features: {
    aiConsultation: boolean;
    interview: boolean;
    teamAnalysis: boolean;
  };
}

/**
 * 로그 레벨
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

/**
 * 로그 항목
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  requestId?: string;
}