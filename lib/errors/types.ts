// lib/errors/types.ts
// API 에러 타입 정의 (중앙 집중식 에러 관리)

/**
 * API 에러 코드 열거형
 * 프론트엔드에서 에러 타입에 따른 적절한 처리를 위한 코드 체계
 */
export enum ApiErrorCode {
  // 인증 관련 (AUTH_)
  AUTH_REQUIRED = 'AUTH_REQUIRED',           // 로그인 필요
  AUTH_INVALID = 'AUTH_INVALID',             // 잘못된 인증 정보
  AUTH_EXPIRED = 'AUTH_EXPIRED',             // 세션 만료
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',         // 권한 없음

  // 검증 관련 (VALIDATION_)
  VALIDATION_FAILED = 'VALIDATION_FAILED',   // 입력 데이터 검증 실패
  VALIDATION_MISSING = 'VALIDATION_MISSING', // 필수 필드 누락
  VALIDATION_INVALID = 'VALIDATION_INVALID', // 잘못된 형식

  // 데이터베이스 관련 (DB_)
  DB_CONNECTION_FAILED = 'DB_CONNECTION_FAILED', // DB 연결 실패
  DB_CONSTRAINT_VIOLATED = 'DB_CONSTRAINT_VIOLATED', // 제약 조건 위반
  DB_RECORD_NOT_FOUND = 'DB_RECORD_NOT_FOUND',   // 레코드 없음
  DB_DUPLICATE_ENTRY = 'DB_DUPLICATE_ENTRY',     // 중복 데이터

  // AI 서비스 관련 (AI_)
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE', // AI 서비스 연결 실패
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',           // API 할당량 초과
  AI_PARSING_FAILED = 'AI_PARSING_FAILED',           // AI 응답 파싱 실패
  AI_TIMEOUT = 'AI_TIMEOUT',                         // AI 응답 시간 초과

  // 비즈니스 로직 관련 (BUSINESS_)
  BUSINESS_RULE_VIOLATED = 'BUSINESS_RULE_VIOLATED', // 비즈니스 규칙 위반
  BUSINESS_STATE_INVALID = 'BUSINESS_STATE_INVALID', // 잘못된 상태
  BUSINESS_LIMIT_EXCEEDED = 'BUSINESS_LIMIT_EXCEEDED', // 제한 초과

  // 리소스 관련
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND', // 리소스를 찾을 수 없음
  PERMISSION_DENIED = 'PERMISSION_DENIED', // 권한 거부

  // 시스템 관련 (SYSTEM_)
  SYSTEM_ERROR = 'SYSTEM_ERROR',             // 일반적인 시스템 오류
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE', // 점검 중
  SYSTEM_OVERLOADED = 'SYSTEM_OVERLOADED',   // 서버 과부하

  // 외부 서비스 관련 (EXTERNAL_)
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR', // 외부 서비스 오류
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',         // 외부 API 오류
}

/**
 * 표준화된 API 에러 인터페이스
 * 모든 API 응답 에러가 이 형식을 따름
 */
export interface ApiError {
  code: ApiErrorCode;           // 에러 코드 (프론트엔드에서 분기 처리용)
  message: string;              // 사용자에게 표시할 메시지
  details?: string;             // 개발자용 상세 정보 (개발 환경에서만)
  field?: string;               // 검증 오류 시 해당 필드명
  timestamp: string;            // 에러 발생 시간
  requestId?: string;           // 요청 추적용 ID (로그 연결용)
}

/**
 * HTTP 상태 코드와 에러 코드 매핑
 * 일관된 HTTP 응답 상태 코드 제공
 */
export const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  // 400 Bad Request
  [ApiErrorCode.VALIDATION_FAILED]: 400,
  [ApiErrorCode.VALIDATION_MISSING]: 400,
  [ApiErrorCode.VALIDATION_INVALID]: 400,
  [ApiErrorCode.BUSINESS_RULE_VIOLATED]: 400,
  [ApiErrorCode.BUSINESS_STATE_INVALID]: 400,

  // 401 Unauthorized
  [ApiErrorCode.AUTH_REQUIRED]: 401,
  [ApiErrorCode.AUTH_INVALID]: 401,
  [ApiErrorCode.AUTH_EXPIRED]: 401,

  // 403 Forbidden
  [ApiErrorCode.AUTH_FORBIDDEN]: 403,
  [ApiErrorCode.PERMISSION_DENIED]: 403,

  // 404 Not Found
  [ApiErrorCode.DB_RECORD_NOT_FOUND]: 404,
  [ApiErrorCode.RESOURCE_NOT_FOUND]: 404,

  // 409 Conflict
  [ApiErrorCode.DB_DUPLICATE_ENTRY]: 409,
  [ApiErrorCode.DB_CONSTRAINT_VIOLATED]: 409,

  // 429 Too Many Requests
  [ApiErrorCode.AI_QUOTA_EXCEEDED]: 429,
  [ApiErrorCode.BUSINESS_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ApiErrorCode.SYSTEM_ERROR]: 500,
  [ApiErrorCode.DB_CONNECTION_FAILED]: 500,
  [ApiErrorCode.AI_SERVICE_UNAVAILABLE]: 500,
  [ApiErrorCode.AI_PARSING_FAILED]: 500,
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
  [ApiErrorCode.EXTERNAL_API_ERROR]: 500,

  // 502 Bad Gateway
  [ApiErrorCode.AI_TIMEOUT]: 502,

  // 503 Service Unavailable
  [ApiErrorCode.SYSTEM_MAINTENANCE]: 503,
  [ApiErrorCode.SYSTEM_OVERLOADED]: 503,
};

/**
 * 사용자 친화적 에러 메시지 매핑
 * 기술적인 에러 코드를 사용자가 이해하기 쉬운 메시지로 변환
 */
export const USER_FRIENDLY_MESSAGES: Record<ApiErrorCode, string> = {
  // 인증 관련
  [ApiErrorCode.AUTH_REQUIRED]: '로그인이 필요합니다.',
  [ApiErrorCode.AUTH_INVALID]: '로그인 정보가 올바르지 않습니다.',
  [ApiErrorCode.AUTH_EXPIRED]: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  [ApiErrorCode.AUTH_FORBIDDEN]: '접근 권한이 없습니다.',

  // 검증 관련
  [ApiErrorCode.VALIDATION_FAILED]: '입력한 정보가 올바르지 않습니다.',
  [ApiErrorCode.VALIDATION_MISSING]: '필수 정보가 누락되었습니다.',
  [ApiErrorCode.VALIDATION_INVALID]: '입력 형식이 올바르지 않습니다.',

  // 데이터베이스 관련
  [ApiErrorCode.DB_CONNECTION_FAILED]: '데이터베이스 연결에 문제가 발생했습니다.',
  [ApiErrorCode.DB_CONSTRAINT_VIOLATED]: '데이터 제약 조건에 위배됩니다.',
  [ApiErrorCode.DB_RECORD_NOT_FOUND]: '요청한 데이터를 찾을 수 없습니다.',
  [ApiErrorCode.DB_DUPLICATE_ENTRY]: '이미 존재하는 데이터입니다.',

  // AI 서비스 관련
  [ApiErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI 서비스에 일시적인 문제가 발생했습니다.',
  [ApiErrorCode.AI_QUOTA_EXCEEDED]: 'AI 서비스 사용량이 한도를 초과했습니다.',
  [ApiErrorCode.AI_PARSING_FAILED]: 'AI 응답 처리 중 오류가 발생했습니다.',
  [ApiErrorCode.AI_TIMEOUT]: 'AI 응답 시간이 초과되었습니다.',

  // 비즈니스 로직 관련
  [ApiErrorCode.BUSINESS_RULE_VIOLATED]: '비즈니스 규칙에 위배됩니다.',
  [ApiErrorCode.BUSINESS_STATE_INVALID]: '현재 상태에서는 해당 작업을 수행할 수 없습니다.',
  [ApiErrorCode.BUSINESS_LIMIT_EXCEEDED]: '허용된 한도를 초과했습니다.',

  // 리소스 관련
  [ApiErrorCode.RESOURCE_NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ApiErrorCode.PERMISSION_DENIED]: '이 작업을 수행할 권한이 없습니다.',

  // 시스템 관련
  [ApiErrorCode.SYSTEM_ERROR]: '시스템 오류가 발생했습니다.',
  [ApiErrorCode.SYSTEM_MAINTENANCE]: '시스템 점검 중입니다.',
  [ApiErrorCode.SYSTEM_OVERLOADED]: '서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.',

  // 외부 서비스 관련
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: '외부 서비스 연결에 문제가 발생했습니다.',
  [ApiErrorCode.EXTERNAL_API_ERROR]: '외부 API 호출 중 오류가 발생했습니다.',
};

/**
 * DevMatch 도메인별 에러 코드
 * 프로젝트 특화된 에러 상황들을 정의
 */
export enum DevMatchErrorCode {
  // 프로젝트 관련
  PROJECT_FULL = 'PROJECT_FULL',                     // 팀 정원 초과
  PROJECT_NOT_RECRUITING = 'PROJECT_NOT_RECRUITING', // 모집 중이 아님
  PROJECT_ALREADY_JOINED = 'PROJECT_ALREADY_JOINED', // 이미 참여한 프로젝트
  PROJECT_INVALID_INVITE = 'PROJECT_INVALID_INVITE', // 잘못된 초대 코드

  // AI 상담 관련
  CONSULTATION_INCOMPLETE = 'CONSULTATION_INCOMPLETE', // 상담 미완료
  CONSULTATION_INVALID_DATA = 'CONSULTATION_INVALID_DATA', // 잘못된 상담 데이터

  // 면담 관련
  INTERVIEW_NOT_COMPLETED = 'INTERVIEW_NOT_COMPLETED', // 면담 미완료
  INTERVIEW_ALREADY_DONE = 'INTERVIEW_ALREADY_DONE',   // 이미 면담 완료

  // 팀 분석 관련
  TEAM_ANALYSIS_INSUFFICIENT = 'TEAM_ANALYSIS_INSUFFICIENT', // 분석에 필요한 데이터 부족
  TEAM_ANALYSIS_ALREADY_DONE = 'TEAM_ANALYSIS_ALREADY_DONE', // 이미 분석 완료
}

/**
 * DevMatch 에러 메시지 매핑
 */
export const DEVMATCH_ERROR_MESSAGES: Record<DevMatchErrorCode, string> = {
  [DevMatchErrorCode.PROJECT_FULL]: '프로젝트 팀 정원이 가득 찼습니다.',
  [DevMatchErrorCode.PROJECT_NOT_RECRUITING]: '현재 팀원을 모집하지 않는 프로젝트입니다.',
  [DevMatchErrorCode.PROJECT_ALREADY_JOINED]: '이미 참여하고 있는 프로젝트입니다.',
  [DevMatchErrorCode.PROJECT_INVALID_INVITE]: '유효하지 않은 초대 코드입니다.',
  
  [DevMatchErrorCode.CONSULTATION_INCOMPLETE]: 'AI 상담을 먼저 완료해주세요.',
  [DevMatchErrorCode.CONSULTATION_INVALID_DATA]: '상담 데이터가 올바르지 않습니다.',
  
  [DevMatchErrorCode.INTERVIEW_NOT_COMPLETED]: '면담을 먼저 완료해주세요.',
  [DevMatchErrorCode.INTERVIEW_ALREADY_DONE]: '이미 면담을 완료했습니다.',
  
  [DevMatchErrorCode.TEAM_ANALYSIS_INSUFFICIENT]: '팀 분석을 위한 데이터가 부족합니다.',
  [DevMatchErrorCode.TEAM_ANALYSIS_ALREADY_DONE]: '이미 팀 분석이 완료되었습니다.',
};