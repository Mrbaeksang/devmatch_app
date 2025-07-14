// lib/types/consultation.types.ts
// AI 상담 시스템 타입 정의 (데피 시스템) - 공통 타입 사용으로 최적화

import { TechStackStructure, TeamComposition, AIMessage } from './common.types';

/**
 * AI 상담 요청 데이터 타입
 * 사용자 입력과 수집된 데이터를 포함
 */
export interface ConsultationRequest {
  userInput: string;
  collectedData: {
    projectName?: string;
    projectGoal?: string;
    teamSize?: number;
    techStack?: TechStackStructure;
    duration?: string;
  };
  chatHistory: AIMessage[];
}

/**
 * AI 상담 응답 타입
 * 데피가 생성하는 모든 응답 구조
 */
export interface ConsultationResponse {
  response: string;                        // 사용자에게 보여줄 자연어 응답
  dataToSave: Record<string, unknown>;     // 이번 턴에서 수집된 데이터
  isComplete: boolean;                     // 상담 완료 여부
  finalData?: ProjectBlueprint;            // 상담 완료 시 최종 청사진
  projectId?: string;                      // 생성된 프로젝트 ID (상담 완료 시)
}

/**
 * 프로젝트 청사진 (최종 결과물)
 * AI 상담을 통해 생성되는 완전한 프로젝트 설계서
 */
export interface ProjectBlueprint {
  // 기본 정보
  projectName: string;           // 프로젝트명
  projectGoal: string;           // 구체적인 목표 설명
  teamSize: number;              // 총 팀원 수
  
  // 기술 정보
  techStack: TechStackStructure; // 기술 스택 (3-category 구조)
  duration: string;              // 예상 기간
  
  // 팀 구성
  teamComposition: TeamComposition;
}

/**
 * 상담 컨텍스트
 * AI 프롬프트 생성에 필요한 모든 정보
 */
export interface ConsultationContext {
  userInput: string;
  collectedData: Record<string, unknown>;
  conversationHistory: AIMessage[];
  isFirstTurn: boolean;
}