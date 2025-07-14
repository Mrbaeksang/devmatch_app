// lib/ai/parsers/response.parser.ts
// AI 응답 파싱 전용 모듈 (JSON 파싱 오류 해결)

import { InterviewResponse } from '@/lib/types/interview.types';

/**
 * AI 응답 파싱 클래스
 * "죄송합니다..." 오류를 해결하기 위한 강화된 파싱 로직
 */
export class ResponseParser {
  /**
   * AI 응답을 InterviewResponse로 파싱
   * 여러 방법으로 JSON 추출 시도하여 파싱 성공률 향상
   */
  static parseInterviewResponse(rawText: string): InterviewResponse {
    console.log('🎤 원본 AI 응답:', rawText);
    
    try {
      // 방법 1: 전체 텍스트가 JSON인지 확인
      const directParse = JSON.parse(rawText);
      console.log('✅ 전체 텍스트 JSON 파싱 성공');
      return this.validateResponse(directParse);
    } catch {
      // 방법 2: 코드블록 안에서 JSON 찾기
      const codeBlockMatch = rawText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        try {
          const parsed = JSON.parse(codeBlockMatch[1]);
          console.log('✅ 코드블록 JSON 파싱 성공');
          return this.validateResponse(parsed);
        } catch (error) {
          console.warn('❌ 코드블록 JSON 파싱 실패:', error);
        }
      }
      
      // 방법 3: 첫 번째 완전한 JSON 객체 찾기
      const jsonMatch = rawText.match(/\{(?:[^{}]|{[^{}]*})*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✅ 추출된 JSON 파싱 성공');
          return this.validateResponse(parsed);
        } catch (error) {
          console.warn('❌ 추출된 JSON 파싱 실패:', error);
        }
      }
      
      // 방법 4: 마지막 수단 - 정규식으로 response 필드만 추출
      const responseMatch = rawText.match(/"response"\s*:\s*"([^"]+)"/);
      if (responseMatch) {
        console.log('⚠️ 응답 필드만 추출하여 안전 모드로 진행');
        return {
          response: responseMatch[1],
          memberProfile: undefined,
          isComplete: false
        };
      }
      
      // 모든 방법 실패 시 - AI 응답을 텍스트로 처리
      console.log('⚠️ JSON 형식 없음, 텍스트 응답으로 처리');
      
      // 텍스트를 그대로 응답으로 사용
      return {
        response: rawText.trim(),
        memberProfile: undefined,
        isComplete: false
      };
    }
  }

  /**
   * 파싱된 응답 검증
   */
  private static validateResponse(parsed: any): InterviewResponse {
    if (!parsed.response) {
      throw new Error('response 필드가 없습니다');
    }
    
    // 타입 안전성 보장
    const response: InterviewResponse = {
      response: String(parsed.response),
      memberProfile: parsed.memberProfile,
      isComplete: Boolean(parsed.isComplete)
    };
    
    console.log('🎤 면담 AI 응답:', {
      responseLength: response.response.length,
      isComplete: response.isComplete,
      hasMemberProfile: !!response.memberProfile && Object.keys(response.memberProfile).length > 0,
      memberProfile: response.memberProfile,
      memberProfileDetail: response.memberProfile ? JSON.stringify(response.memberProfile) : '없음'
    });
    
    return response;
  }

  /**
   * 파싱 실패 시 안전한 응답 반환
   */
  static createErrorResponse(error: unknown): InterviewResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('❌ JSON 파싱 오류 상세:', {
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    return {
      response: "죄송합니다. 시스템 오류가 발생했습니다. 다시 말씀해주시겠어요?",
      memberProfile: undefined,
      isComplete: false
    };
  }
}