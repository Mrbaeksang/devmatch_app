// lib/errors/index.ts
// 에러 시스템 통합 export

export * from './types';
export * from './handler';

// 편의 함수들
export { ErrorHandler } from './handler';
export { 
  ApiErrorCode, 
  DevMatchErrorCode,
  type ApiError 
} from './types';