// lib/types/interview.types.ts
// 면담 시스템 전용 타입 정의 - 공통 타입 사용으로 최적화

import { TechStackStructure, MemberProfile, AIMessage } from './common.types';

/**
 * 면담 요청 인터페이스
 */
export interface InterviewRequest {
  userInput: string;
  projectId: string;
  memberId: string;
  chatHistory: AIMessage[];
  memberProfile?: unknown;
}

/**
 * AI 응답 인터페이스
 */
export interface InterviewResponse {
  response: string;
  memberProfile?: MemberProfile;
  isComplete: boolean;
}

/**
 * 프로젝트 정보 (면담용)
 */
export interface ProjectInfo {
  name: string;
  goal: string;
  techStack: unknown;
  techStackStructure?: TechStackStructure;
}

/**
 * 멤버 정보 (면담용)
 */
export interface MemberInfo {
  name: string;
}

/**
 * 면담 컨텍스트 (AI 프롬프트 생성용)
 */
export interface InterviewContext {
  projectInfo: ProjectInfo;
  memberInfo: MemberInfo;
  conversationHistory: AIMessage[];
  userInput: string;
  currentProfile: unknown;
  isFirstTurn: boolean;
  techStackArray: string[];
}