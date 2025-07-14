// lib/errors/handler.ts
// 중앙 집중식 에러 핸들링 시스템

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { 
  ApiError, 
  ApiErrorCode, 
  DevMatchErrorCode,
  ERROR_STATUS_MAP, 
  USER_FRIENDLY_MESSAGES,
  DEVMATCH_ERROR_MESSAGES
} from './types';

/**
 * 표준화된 에러 핸들러 클래스
 * 모든 API 라우트에서 일관된 에러 처리를 위한 중앙 집중식 시스템
 */
export class ErrorHandler {
  
  /**
   * 에러를 ApiError 형식으로 변환
   * @param error - 원본 에러 객체
   * @param requestId - 요청 추적용 ID
   */
  static createApiError(
    code: ApiErrorCode | DevMatchErrorCode,
    message?: string,
    details?: string,
    field?: string,
    requestId?: string
  ): ApiError {
    return {
      code: code as ApiErrorCode,
      message: message || this.getDefaultMessage(code),
      details: process.env.NODE_ENV === 'development' ? details : undefined,
      field,
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  /**
   * 에러 코드에 따른 기본 메시지 반환
   */
  private static getDefaultMessage(code: ApiErrorCode | DevMatchErrorCode): string {
    return USER_FRIENDLY_MESSAGES[code as ApiErrorCode] || 
           DEVMATCH_ERROR_MESSAGES[code as DevMatchErrorCode] || 
           '알 수 없는 오류가 발생했습니다.';
  }

  /**
   * NextResponse로 에러 응답 생성
   * @param apiError - ApiError 객체
   */
  static createErrorResponse(apiError: ApiError): NextResponse {
    const statusCode = ERROR_STATUS_MAP[apiError.code] || 500;
    
    console.error('API 에러:', {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      field: apiError.field,
      timestamp: apiError.timestamp,
      requestId: apiError.requestId
    });

    return NextResponse.json(
      { error: apiError },
      { status: statusCode }
    );
  }

  /**
   * 일반적인 에러를 ApiError로 자동 변환
   * @param error - 원본 에러
   * @param requestId - 요청 추적용 ID
   */
  static handleGenericError(error: unknown, requestId?: string): NextResponse {
    let apiError: ApiError;

    if (error instanceof Error) {
      // Prisma 에러 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        apiError = this.handlePrismaError(error, requestId);
      }
      // DevMatch 커스텀 에러 처리
      else if (this.isDevMatchError(error.message)) {
        apiError = this.handleDevMatchError(error.message, requestId);
      }
      // AI 서비스 에러 처리
      else if (this.isAIServiceError(error.message)) {
        apiError = this.handleAIServiceError(error.message, requestId);
      }
      // 일반적인 Error 객체
      else {
        apiError = this.createApiError(
          ApiErrorCode.SYSTEM_ERROR,
          USER_FRIENDLY_MESSAGES[ApiErrorCode.SYSTEM_ERROR],
          error.message,
          undefined,
          requestId
        );
      }
    } else {
      // 알 수 없는 타입의 에러
      apiError = this.createApiError(
        ApiErrorCode.SYSTEM_ERROR,
        USER_FRIENDLY_MESSAGES[ApiErrorCode.SYSTEM_ERROR],
        String(error),
        undefined,
        requestId
      );
    }

    return this.createErrorResponse(apiError);
  }

  /**
   * Prisma 에러를 ApiError로 변환
   */
  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError, 
    requestId?: string
  ): ApiError {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return this.createApiError(
          ApiErrorCode.DB_DUPLICATE_ENTRY,
          undefined,
          `Unique constraint failed: ${error.meta?.target}`,
          undefined,
          requestId
        );
      
      case 'P2003': // Foreign key constraint violation
        return this.createApiError(
          ApiErrorCode.DB_CONSTRAINT_VIOLATED,
          undefined,
          `Foreign key constraint failed: ${error.meta?.field_name}`,
          undefined,
          requestId
        );
      
      case 'P2025': // Record not found
        return this.createApiError(
          ApiErrorCode.DB_RECORD_NOT_FOUND,
          undefined,
          error.message,
          undefined,
          requestId
        );
      
      default:
        return this.createApiError(
          ApiErrorCode.DB_CONNECTION_FAILED,
          undefined,
          error.message,
          undefined,
          requestId
        );
    }
  }

  /**
   * DevMatch 도메인 에러 확인
   */
  private static isDevMatchError(message: string): boolean {
    const devMatchKeywords = [
      '팀 정원', '프로젝트', '초대 코드', '상담', '면담', '분석',
      'PROJECT_FULL', 'CONSULTATION_', 'INTERVIEW_', 'TEAM_ANALYSIS_'
    ];
    return devMatchKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * DevMatch 도메인 에러 처리
   */
  private static handleDevMatchError(message: string, requestId?: string): ApiError {
    // 메시지 기반으로 에러 코드 추론
    if (message.includes('팀 정원') || message.includes('PROJECT_FULL')) {
      return this.createApiError(
        DevMatchErrorCode.PROJECT_FULL,
        undefined,
        message,
        undefined,
        requestId
      );
    }
    
    if (message.includes('상담') || message.includes('CONSULTATION_')) {
      return this.createApiError(
        DevMatchErrorCode.CONSULTATION_INCOMPLETE,
        undefined,
        message,
        undefined,
        requestId
      );
    }
    
    if (message.includes('면담') || message.includes('INTERVIEW_')) {
      return this.createApiError(
        DevMatchErrorCode.INTERVIEW_NOT_COMPLETED,
        undefined,
        message,
        undefined,
        requestId
      );
    }

    // 기본 비즈니스 규칙 위반으로 처리
    return this.createApiError(
      ApiErrorCode.BUSINESS_RULE_VIOLATED,
      message,
      undefined,
      undefined,
      requestId
    );
  }

  /**
   * AI 서비스 에러 확인
   */
  private static isAIServiceError(message: string): boolean {
    const aiKeywords = [
      'OpenRouter', 'AI', 'Gemini', 'GPT', 'quota', 'timeout', 'parsing'
    ];
    return aiKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * AI 서비스 에러 처리
   */
  private static handleAIServiceError(message: string, requestId?: string): ApiError {
    if (message.includes('timeout')) {
      return this.createApiError(
        ApiErrorCode.AI_TIMEOUT,
        undefined,
        message,
        undefined,
        requestId
      );
    }
    
    if (message.includes('quota') || message.includes('limit')) {
      return this.createApiError(
        ApiErrorCode.AI_QUOTA_EXCEEDED,
        undefined,
        message,
        undefined,
        requestId
      );
    }
    
    if (message.includes('parsing') || message.includes('JSON')) {
      return this.createApiError(
        ApiErrorCode.AI_PARSING_FAILED,
        undefined,
        message,
        undefined,
        requestId
      );
    }

    return this.createApiError(
      ApiErrorCode.AI_SERVICE_UNAVAILABLE,
      undefined,
      message,
      undefined,
      requestId
    );
  }

  /**
   * 인증 에러 생성 헬퍼
   */
  static createAuthError(message?: string, requestId?: string): NextResponse {
    const apiError = this.createApiError(
      ApiErrorCode.AUTH_REQUIRED,
      message,
      undefined,
      undefined,
      requestId
    );
    return this.createErrorResponse(apiError);
  }

  /**
   * 검증 에러 생성 헬퍼
   */
  static createValidationError(
    message: string, 
    field?: string, 
    requestId?: string
  ): NextResponse {
    const apiError = this.createApiError(
      ApiErrorCode.VALIDATION_FAILED,
      message,
      undefined,
      field,
      requestId
    );
    return this.createErrorResponse(apiError);
  }

  /**
   * DevMatch 비즈니스 에러 생성 헬퍼
   */
  static createDevMatchError(
    code: DevMatchErrorCode,
    customMessage?: string,
    requestId?: string
  ): NextResponse {
    const apiError = this.createApiError(
      code,
      customMessage,
      undefined,
      undefined,
      requestId
    );
    return this.createErrorResponse(apiError);
  }

  /**
   * 요청 ID 생성 (로그 추적용)
   */
  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 일반적인 HTTP 에러 응답 헬퍼 메서드들
   */
  static handleUnauthorized(message?: string): NextResponse {
    return this.createAuthError(message || '인증이 필요합니다.');
  }

  static handleBadRequest(message: string): NextResponse {
    return this.createValidationError(message);
  }

  static handleNotFound(message: string): NextResponse {
    const apiError = this.createApiError(
      ApiErrorCode.RESOURCE_NOT_FOUND,
      message
    );
    return this.createErrorResponse(apiError);
  }

  static handleForbidden(message: string): NextResponse {
    const apiError = this.createApiError(
      ApiErrorCode.PERMISSION_DENIED,
      message
    );
    return this.createErrorResponse(apiError);
  }

  static handleInternalError(error: unknown): NextResponse {
    return this.handleGenericError(error);
  }
}