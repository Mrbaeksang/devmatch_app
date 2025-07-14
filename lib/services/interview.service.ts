// lib/services/interview.service.ts
// 면담 비즈니스 로직 모듈 (핵심 서비스 계층)

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { db } from '@/lib/db';
import { TechStackStructure, AIMessage } from '@/lib/types/common.types';
import { 
  InterviewRequest, 
  InterviewResponse, 
  ProjectInfo, 
  MemberInfo, 
  InterviewContext 
} from '@/lib/types/interview.types';
import { InterviewPromptGenerator } from '@/lib/ai/prompts/interview.prompt';
import { ResponseParser } from '@/lib/ai/parsers/response.parser';

/**
 * 면담 서비스 클래스
 * 면담 관련 모든 비즈니스 로직을 담당
 */
export class InterviewService {
  private static openrouter: any;

  /**
   * OpenRouter 클라이언트 초기화
   */
  private static initializeOpenRouter() {
    if (!this.openrouter) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY가 설정되지 않았습니다');
      }

      this.openrouter = createOpenRouter({
        apiKey,
        headers: {
          "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
          "X-Title": "DevMatch Interview System",
        },
      });
    }
    return this.openrouter;
  }

  /**
   * 면담 진행 메인 메서드
   */
  static async conductInterview(request: InterviewRequest): Promise<InterviewResponse> {
    console.log('🚀 conductInterview 시작:', {
      memberId: request.memberId,
      projectId: request.projectId,
      hasUserInput: !!request.userInput,
      chatHistoryLength: request.chatHistory?.length || 0,
      currentProfile: request.memberProfile
    });
    
    // 1. 프로젝트 정보 조회
    const projectInfo = await this.getProjectInfo(request.projectId);
    
    // 2. 멤버 정보 조회 및 권한 확인
    const memberInfo = await this.getMemberInfo(request.memberId, request.projectId);
    
    // 3. 면담 컨텍스트 구성
    const context = this.buildInterviewContext(
      projectInfo,
      memberInfo,
      request.chatHistory,
      request.userInput,
      request.memberProfile
    );
    
    // 4. AI 응답 생성 (상담처럼 단순하게!)
    const aiResponse = await this.generateAIResponse(context);
    
    console.log('🎯 AI 응답 결과:', {
      isComplete: aiResponse.isComplete,
      hasMemberProfile: !!aiResponse.memberProfile,
      memberProfileKeys: aiResponse.memberProfile ? Object.keys(aiResponse.memberProfile) : [],
      memberProfile: aiResponse.memberProfile
    });
    
    // 5. 면담 완료 시 DB 업데이트
    if (aiResponse.isComplete && aiResponse.memberProfile) {
      console.log('💾 DB 업데이트 시작...');
      await this.saveMemberProfile(request.memberId, aiResponse.memberProfile);
      console.log('✅ DB 업데이트 완료');
    } else {
      console.log('⏭️ 면담 진행 중 (DB 업데이트 스킵)');
    }
    
    return aiResponse;
  }

  /**
   * 프로젝트 정보 조회
   */
  private static async getProjectInfo(projectId: string): Promise<ProjectInfo> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        description: true,
        techStack: true,
        blueprint: true
      }
    });

    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    return {
      name: project.name,
      goal: project.description,
      techStack: project.techStack,
      techStackStructure: project.techStack as unknown as TechStackStructure
    };
  }

  /**
   * 멤버 정보 조회
   */
  private static async getMemberInfo(memberId: string, projectId: string): Promise<MemberInfo> {
    const member = await db.projectMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    if (!member) {
      throw new Error('팀원을 찾을 수 없습니다.');
    }

    if (member.projectId !== projectId) {
      throw new Error('프로젝트 멤버가 아닙니다.');
    }

    return {
      name: member.user.nickname || member.user.name || '팀원'
    };
  }

  /**
   * 면담 컨텍스트 구성
   */
  private static buildInterviewContext(
    projectInfo: ProjectInfo,
    memberInfo: MemberInfo,
    conversationHistory: AIMessage[],
    userInput: string,
    currentProfile: unknown
  ): InterviewContext {
    const isFirstTurn = !conversationHistory || conversationHistory.length === 0;
    
    // 프로젝트의 모든 기술 추출 (Git/GitHub 포함)
    const techStackArray: string[] = [];
    if (projectInfo.techStackStructure) {
      const ts = projectInfo.techStackStructure;
      if (ts.frontend) {
        if (ts.frontend.languages) techStackArray.push(...ts.frontend.languages);
        if (ts.frontend.frameworks) techStackArray.push(...ts.frontend.frameworks);
        if (ts.frontend.tools) techStackArray.push(...ts.frontend.tools);
      }
      if (ts.backend) {
        if (ts.backend.languages) techStackArray.push(...ts.backend.languages);
        if (ts.backend.frameworks) techStackArray.push(...ts.backend.frameworks);
        if (ts.backend.tools) techStackArray.push(...ts.backend.tools);
      }
      if (ts.collaboration) {
        if (ts.collaboration.git) techStackArray.push(...ts.collaboration.git);
        if (ts.collaboration.tools) techStackArray.push(...ts.collaboration.tools);
      }
    }

    return {
      projectInfo,
      memberInfo,
      conversationHistory,
      userInput,
      currentProfile,
      isFirstTurn,
      techStackArray
    };
  }

  // analyzeUserInput 함수 제거됨 - 프롬프트에서 직접 처리 (상담처럼 단순하게)

  /**
   * AI 응답 생성 (상담처럼 단순하게!)
   */
  private static async generateAIResponse(context: InterviewContext): Promise<InterviewResponse> {
    try {
      const openrouter = this.initializeOpenRouter();
      
      // 상담처럼 단순한 프롬프트 생성
      const prompt = InterviewPromptGenerator.generatePrompt(context);
      
      console.log('📝 면담 프롬프트 생성 완료');
      
      // AI 호출 (상담과 동일한 모델 사용)
      const result = await generateText({
        model: openrouter('google/gemini-2.5-flash-preview-05-20'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxTokens: 1000,
      });

      console.log('🤖 AI 원본 응답:', result.text);

      // 응답 파싱
      const parsedResponse = ResponseParser.parseInterviewResponse(result.text);
      
      console.log('✅ 파싱된 응답:', {
        hasResponse: !!parsedResponse.response,
        hasMemberProfile: !!parsedResponse.memberProfile,
        memberProfile: parsedResponse.memberProfile,
        isComplete: parsedResponse.isComplete
      });
      
      return parsedResponse;
      
    } catch (error) {
      console.error('면담 AI 호출 오류:', error);
      return ResponseParser.createErrorResponse(error);
    }
  }

  // roleAptitudes 계산 함수 제거 - 팀 분석에서 처리

  /**
   * 멤버 프로필 저장
   */
  private static async saveMemberProfile(memberId: string, memberProfile: any): Promise<void> {
    console.log('💾 saveMemberProfile 호출:', {
      memberId,
      memberProfile,
      profileKeys: Object.keys(memberProfile)
    });
    
    try {
      // 현재 멤버 정보 조회 (프로젝트 정보 포함)
      const currentMember = await db.projectMember.findUnique({
        where: { id: memberId },
        include: {
          project: {
            select: { techStack: true }
          }
        }
      });
      
      console.log('현재 멤버 상태:', {
        interviewStatus: currentMember?.interviewStatus,
        hasMemberProfile: !!currentMember?.memberProfile
      });
      
      // 프로필 Deep merge (기존 데이터 + 새 데이터)
      const existingProfile = currentMember?.memberProfile as any || {};
      
      // workStyle 필드 처리 (단수 -> 복수 변환)
      if (memberProfile.workStyle) {
        memberProfile.workStyles = [memberProfile.workStyle];
        delete memberProfile.workStyle;
      }
      
      const mergedProfile = {
        ...existingProfile,
        ...memberProfile,
        // skillScores는 누적되어야 함
        skillScores: {
          ...(existingProfile.skillScores || {}),
          ...(memberProfile.skillScores || {})
        },
        // workStyles는 새 값이 있으면 교체
        workStyles: memberProfile.workStyles || existingProfile.workStyles || []
      };
        
      console.log('병합된 프로필:', mergedProfile);
      
      // DB 업데이트
      const updated = await db.projectMember.update({
        where: { id: memberId },
        data: {
          memberProfile: mergedProfile,
          interviewStatus: 'COMPLETED'
        }
      });
      
      console.log('✅ DB 업데이트 완료:', {
        id: updated.id,
        interviewStatus: updated.interviewStatus,
        memberProfileKeys: updated.memberProfile ? Object.keys(updated.memberProfile as any) : []
      });
      
    } catch (error) {
      console.error('❌ saveMemberProfile 오류:', error);
      throw error;
    }
  }

  /**
   * 권한 확인 메서드
   */
  static async verifyMemberAccess(memberId: string, userId: string): Promise<boolean> {
    const member = await db.projectMember.findUnique({
      where: { id: memberId },
      select: { userId: true }
    });

    return member?.userId === userId;
  }

  /**
   * 프로젝트의 모든 멤버 면담 상태 및 데이터 초기화
   * @param projectId - 초기화할 프로젝트의 ID
   * @returns 초기화된 멤버 수
   */
  static async resetInterviewsForProject(projectId: string): Promise<number> {
    try {
      console.log(`🔄 프로젝트 ${projectId}의 면담 초기화 시작...`);
      
      const result = await db.projectMember.updateMany({
        where: {
          projectId: projectId,
        },
        data: {
          // 면담 상태를 '대기중'으로 변경
          interviewStatus: 'PENDING',
          // 기존 면담 데이터를 깨끗하게 초기화
          memberProfile: {
            skillScores: {},
            workStyles: [],
          },
        },
      });
      
      console.log(`✅ [${projectId}] 프로젝트의 ${result.count}명 멤버 면담이 초기화되었습니다.`);
      return result.count;
    } catch (error) {
      console.error('면담 초기화 중 오류 발생:', error);
      throw new Error('면담 초기화에 실패했습니다.');
    }
  }
}