// lib/types/analysis.types.ts
// 팀 분석 관련 타입 정의

import { TechStackStructure } from './common.types';

/**
 * 팀 분석 요청 타입
 */
export interface TeamAnalysisRequest {
  projectId: string;
}

/**
 * 프로젝트 정보 (분석용)
 */
export interface ProjectAnalysisInfo {
  id: string;
  name: string;
  description: string;
  techStack: TechStackStructure;
  roleDistribution: {
    frontend: number;
    backend: number;
    fullstack: number;
  };
  maxMembers: number;
}

/**
 * 멤버 프로필 (분석용)
 */
export interface MemberAnalysisProfile {
  userId: string;
  userName: string;
  skillScores: Record<string, number>;  // 기술별 1-8점
  workStyles: string[];                 // 워크스타일 (1개)
}

/**
 * 개별 멤버 분석 결과
 */
export interface MemberAnalysisResult {
  userId: string;
  role: 'Frontend Developer' | 'Backend Developer' | 'Fullstack Developer';
  strengths: string[];         // 개인 강점 2개
  leadershipScore: number;     // 팀장 추천도 (0-100)
}

/**
 * 팀 전체 분석 결과
 */
export interface TeamAnalysisResult {
  teamStrengths: string[];                    // 팀 강점 3개
  aiAdvice: string[];                         // AI 조언 2개
  operationRecommendations: string[];         // 운영 권장사항 2개
  leadershipDistribution: Record<string, number>;  // userId별 팀장 추천도
}

/**
 * AI 분석 응답 타입
 */
export interface AIAnalysisResponse {
  teamAnalysis: TeamAnalysisResult;
  memberAnalysis: MemberAnalysisResult[];
}

/**
 * 팀 분석 컨텍스트
 */
export interface TeamAnalysisContext {
  project: ProjectAnalysisInfo;
  members: MemberAnalysisProfile[];
}