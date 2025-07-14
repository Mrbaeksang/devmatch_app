// lib/services/consultation.service.ts
// AI 상담 비즈니스 로직 모듈 (데피 시스템 핵심 서비스)

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { db } from '@/lib/db';
import { 
  ConsultationRequest, 
  ConsultationResponse, 
  ConsultationContext,
  ProjectBlueprint 
} from '@/lib/types/consultation.types';
import { ConsultationPromptGenerator } from '@/lib/ai/prompts/consultation.prompt';

/**
 * AI 상담 서비스 클래스 (데피 시스템)
 * 프로젝트 청사진 생성을 위한 AI 상담 모든 비즈니스 로직 담당
 */
export class ConsultationService {
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
          "X-Title": "DevMatch Consultation System (Deffy)",
        },
      });
    }
    return this.openrouter;
  }

  /**
   * AI 상담 진행 메인 메서드
   * 사용자 입력을 받아 데피 AI와 대화하여 상담 진행
   */
  static async conductConsultation(request: ConsultationRequest, userId?: string): Promise<ConsultationResponse> {
    // 1. 상담 컨텍스트 구성
    const context = this.buildConsultationContext(request);
    
    // 2. AI 응답 생성 (데피 호출)
    const aiResponse = await this.generateAIResponse(context);
    
    // 3. 상담 완료 시 프로젝트 생성
    if (aiResponse.isComplete && aiResponse.finalData) {
      const projectId = await this.createProject(aiResponse.finalData, userId);
      return {
        ...aiResponse,
        projectId // 생성된 프로젝트 ID 추가
      };
    }
    
    return aiResponse;
  }

  /**
   * 상담 컨텍스트 구성
   * AI 프롬프트 생성에 필요한 모든 정보를 정리
   */
  private static buildConsultationContext(request: ConsultationRequest): ConsultationContext {
    const { userInput, collectedData, chatHistory } = request;
    const isFirstTurn = !chatHistory || chatHistory.length === 0;
    
    return {
      userInput,
      collectedData: collectedData || {},
      conversationHistory: chatHistory || [],
      isFirstTurn
    };
  }

  /**
   * AI 응답 생성 (데피 호출)
   * 데피 AI와 대화하여 상담 응답 생성
   */
  private static async generateAIResponse(context: ConsultationContext): Promise<ConsultationResponse> {
    try {
      const openrouter = this.initializeOpenRouter();
      
      // 데피 전용 프롬프트 생성
      const prompt = ConsultationPromptGenerator.generatePrompt(context);
      
      console.log('🤖 데피 AI 호출 시작:', {
        userInput: context.userInput,
        collectedDataKeys: Object.keys(context.collectedData),
        isFirstTurn: context.isFirstTurn
      });
      
      // AI 호출 (Gemini 2.5 Flash)
      const result = await generateText({
        model: openrouter('google/gemini-2.5-flash-preview-05-20'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        maxTokens: 1500,  // 상담 응답은 더 길 수 있음
      });

      console.log('🤖 데피 AI 원본 응답:', result.text);
      
      // JSON 응답 파싱 (ResponseParser 재사용)
      return this.parseConsultationResponse(result.text);
      
    } catch (error) {
      console.error('데피 AI 호출 오류:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * 상담 응답 파싱
   * ResponseParser를 상담용으로 확장하여 사용
   */
  private static parseConsultationResponse(rawText: string): ConsultationResponse {
    try {
      // JSON 직접 파싱 (상담 전용)
      const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      
      // 상담 응답으로 변환
      return {
        response: parsed.response || "죄송합니다. 다시 말씀해주시겠어요?",
        dataToSave: (parsed.dataToSave || {}) as Record<string, unknown>,
        isComplete: Boolean(parsed.isComplete),
        finalData: parsed.finalData as ProjectBlueprint
      };
      
    } catch (error) {
      console.error('상담 응답 파싱 오류:', error);
      return this.createErrorResponse(error);
    }
  }

  /**
   * 프로젝트 생성
   * 상담 완료 시 최종 청사진으로 프로젝트 DB 생성
   */
  private static async createProject(blueprint: ProjectBlueprint, userId?: string): Promise<string> {
    try {
      console.log('📋 프로젝트 생성 시작:', blueprint.projectName);
      
      const project = await db.project.create({
        data: {
          name: blueprint.projectName,
          description: blueprint.projectGoal,
          teamSize: blueprint.teamSize,
          blueprint: JSON.parse(JSON.stringify(blueprint)),  // 전체 청사진 저장
          techStack: JSON.parse(JSON.stringify(blueprint.techStack)),
          status: 'RECRUITING',  // 팀원 모집 상태로 시작
          // 로그인한 사용자가 있으면 팀장으로 추가
          ...(userId && {
            members: {
              create: {
                userId,
                role: 'TEAMLEAD',
                interviewStatus: 'PENDING',
                agreedToAnalysis: false
              }
            }
          })
        }
      });

      console.log('✅ 프로젝트 생성 완료:', {
        id: project.id,
        name: project.name,
        inviteCode: project.inviteCode,
        hasCreator: !!userId
      });

      return project.id;
      
    } catch (error) {
      console.error('프로젝트 생성 오류:', error);
      throw new Error('프로젝트 생성에 실패했습니다.');
    }
  }

  /**
   * 에러 응답 생성
   * 상담 중 오류 발생 시 안전한 응답 반환
   */
  private static createErrorResponse(error: unknown): ConsultationResponse {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('❌ 상담 서비스 오류:', {
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
    
    return {
      response: "죄송합니다. 시스템 오류가 발생했습니다. 다시 시도해주시거나 처음부터 말씀해주시겠어요?",
      dataToSave: {},
      isComplete: false
    };
  }

  /**
   * 프로젝트 조회
   * 생성된 프로젝트 정보 확인용
   */
  static async getProject(projectId: string) {
    return await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, nickname: true }
            }
          }
        }
      }
    });
  }
}