// lib/services/team-analysis.service.ts
// 팀 분석 비즈니스 로직 모듈

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { db } from '@/lib/db';
import { 
  TeamAnalysisRequest, 
  ProjectAnalysisInfo, 
  MemberAnalysisProfile,
  AIAnalysisResponse,
  TeamAnalysisContext 
} from '@/lib/types/analysis.types';
import { TeamAnalysisPromptGenerator } from '@/lib/ai/prompts/team-analysis.prompt';

/**
 * 팀 분석 서비스 클래스
 */
export class TeamAnalysisService {
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
          "X-Title": "DevMatch Team Analysis",
        },
      });
    }
    return this.openrouter;
  }

  /**
   * 팀 분석 실행 메인 메서드
   */
  static async analyzeTeam(request: TeamAnalysisRequest): Promise<AIAnalysisResponse> {
    console.log('🚀 팀 분석 시작:', { projectId: request.projectId });
    
    // 1. 프로젝트 정보 조회
    const projectInfo = await this.getProjectInfo(request.projectId);
    
    // 2. 멤버 프로필 조회
    const memberProfiles = await this.getMemberProfiles(request.projectId);
    
    // 3. 모든 면담 완료 확인
    if (!this.validateAllInterviewsComplete(memberProfiles)) {
      throw new Error('모든 팀원의 면담이 완료되어야 분석을 시작할 수 있습니다.');
    }
    
    // 4. 분석 컨텍스트 구성
    const context: TeamAnalysisContext = {
      project: projectInfo,
      members: memberProfiles
    };
    
    // 5. AI 분석 실행
    const analysisResult = await this.generateAIAnalysis(context);
    
    // 6. 결과 저장
    await this.saveAnalysisResults(request.projectId, analysisResult);
    
    console.log('✅ 팀 분석 완료');
    return analysisResult;
  }

  /**
   * 프로젝트 정보 조회
   */
  private static async getProjectInfo(projectId: string): Promise<ProjectAnalysisInfo> {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        techStack: true,
        blueprint: true,
        teamSize: true
      }
    });

    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    // blueprint에서 roleDistribution 추출
    const blueprint = project.blueprint as any;
    const roleDistribution = blueprint?.teamComposition?.roleDistribution || {
      frontend: 0,
      backend: 0,
      fullstack: 0
    };

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      techStack: project.techStack as any,
      roleDistribution,
      maxMembers: project.teamSize
    };
  }

  /**
   * 멤버 프로필 조회
   */
  private static async getMemberProfiles(projectId: string): Promise<MemberAnalysisProfile[]> {
    const members = await db.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    return members.map(member => {
      const profile = member.memberProfile as any || {};
      
      return {
        userId: member.user.id,
        userName: member.user.nickname || member.user.name || '팀원',
        skillScores: profile.skillScores || {},
        workStyles: profile.workStyles || []
      };
    });
  }

  /**
   * 모든 면담 완료 확인
   */
  private static validateAllInterviewsComplete(members: MemberAnalysisProfile[]): boolean {
    return members.every(member => 
      Object.keys(member.skillScores).length > 0 && 
      member.workStyles.length > 0
    );
  }

  /**
   * AI 분석 생성
   */
  private static async generateAIAnalysis(context: TeamAnalysisContext): Promise<AIAnalysisResponse> {
    try {
      const openrouter = this.initializeOpenRouter();
      
      // 프롬프트 생성
      const prompt = TeamAnalysisPromptGenerator.generatePrompt(context);
      
      console.log('📝 분석 프롬프트 생성 완료');
      
      // AI 호출
      const result = await generateText({
        model: openrouter('meta-llama/llama-3.3-70b-instruct'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 2000,
      });

      console.log('🤖 AI 분석 완료');

      // 응답 파싱
      const parsedResponse = JSON.parse(result.text.trim()) as AIAnalysisResponse;
      
      // 응답 검증
      this.validateAnalysisResponse(parsedResponse, context.members);
      
      return parsedResponse;
      
    } catch (error) {
      console.error('AI 분석 실패:', error);
      
      // 백업 분석 결과 생성
      return this.createFallbackAnalysis(context);
    }
  }

  /**
   * 분석 응답 검증
   */
  private static validateAnalysisResponse(response: AIAnalysisResponse, members: MemberAnalysisProfile[]): void {
    // 팀장 추천도 합계 확인
    const totalLeadership = Object.values(response.teamAnalysis.leadershipDistribution)
      .reduce((sum, score) => sum + score, 0);
    
    if (Math.abs(totalLeadership - 100) > 1) {
      throw new Error('팀장 추천도 합계가 100이 아닙니다.');
    }
    
    // 모든 멤버가 분석되었는지 확인
    if (response.memberAnalysis.length !== members.length) {
      throw new Error('모든 멤버가 분석되지 않았습니다.');
    }
  }

  /**
   * 백업 분석 결과 생성 (AI 실패 시)
   */
  private static createFallbackAnalysis(context: TeamAnalysisContext): AIAnalysisResponse {
    const { members } = context;
    
    // 간단한 팀장 추천도 계산
    const leadershipScores = members.map(member => {
      const gitScore = (member.skillScores['Git'] || 0) + (member.skillScores['GitHub'] || 0);
      const avgScore = Object.values(member.skillScores).reduce((sum, score) => sum + score, 0) / 
                      Object.keys(member.skillScores).length;
      
      return {
        userId: member.userId,
        score: (gitScore / 16 * 70) + (avgScore / 8 * 30)
      };
    });
    
    // 정규화하여 합계 100 만들기
    const totalScore = leadershipScores.reduce((sum, m) => sum + m.score, 0);
    const normalizedScores = leadershipScores.map(m => ({
      userId: m.userId,
      percentage: Math.round(m.score / totalScore * 100)
    }));
    
    // 역할 판단
    const memberAnalysis = members.map(member => {
      const frontendScore = ['JavaScript', 'TypeScript', 'React', 'Next.js']
        .map(skill => member.skillScores[skill] || 0)
        .reduce((sum, score) => sum + score, 0) / 4;
        
      const backendScore = ['Java', 'Python', 'Spring', 'Django']
        .map(skill => member.skillScores[skill] || 0)
        .reduce((sum, score) => sum + score, 0) / 4;
      
      let role: 'Frontend Developer' | 'Backend Developer' | 'Fullstack Developer';
      if (frontendScore >= 4 && backendScore >= 4) {
        role = 'Fullstack Developer';
      } else if (frontendScore > backendScore) {
        role = 'Frontend Developer';
      } else {
        role = 'Backend Developer';
      }
      
      return {
        userId: member.userId,
        role,
        strengths: ['기술적 역량', '팀 협업 능력'],
        leadershipScore: normalizedScores.find(s => s.userId === member.userId)?.percentage || 25
      };
    });
    
    return {
      teamAnalysis: {
        teamStrengths: [
          '다양한 기술 스택 보유',
          '균형잡힌 팀 구성',
          '협업 가능한 워크스타일'
        ],
        aiAdvice: [
          '정기적인 코드 리뷰 진행 권장',
          '기술 공유 세션 운영 추천'
        ],
        operationRecommendations: [
          '애자일 방법론 적용',
          '주 2회 정기 미팅 진행'
        ],
        leadershipDistribution: Object.fromEntries(
          normalizedScores.map(s => [s.userId, s.percentage])
        )
      },
      memberAnalysis
    };
  }

  /**
   * 분석 결과 저장
   */
  private static async saveAnalysisResults(
    projectId: string, 
    analysisResult: AIAnalysisResponse
  ): Promise<void> {
    // 프로젝트 업데이트
    await db.project.update({
      where: { id: projectId },
      data: {
        teamAnalysis: analysisResult.teamAnalysis as any,
        status: 'ACTIVE'
      }
    });

    // 각 멤버 업데이트
    await Promise.all(
      analysisResult.memberAnalysis.map(async (memberAnalysis) => {
        const member = await db.projectMember.findFirst({
          where: {
            projectId,
            userId: memberAnalysis.userId
          }
        });

        if (member) {
          await db.projectMember.update({
            where: { id: member.id },
            data: {
              role: memberAnalysis.role,
              memberProfile: {
                ...(member.memberProfile as any),
                strengths: memberAnalysis.strengths,
                leadershipScore: memberAnalysis.leadershipScore
              }
            }
          });
        }
      })
    );

    // 시스템 메시지 추가
    const topLeader = analysisResult.memberAnalysis.reduce((prev, current) => 
      prev.leadershipScore > current.leadershipScore ? prev : current
    );
    
    const leaderMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: topLeader.userId
      },
      include: { user: true }
    });
    
    const leaderName = leaderMember?.user?.nickname || leaderMember?.user?.name || '팀장';
    
    await db.chatMessage.create({
      data: {
        projectId,
        content: `🚀 프로젝트가 시작되었습니다! ${leaderName}님이 팀장으로 추천되었습니다.`,
        type: 'SYSTEM'
      }
    });
  }

  /**
   * 프로젝트 멤버 확인
   */
  static async verifyProjectMember(projectId: string, userId: string): Promise<boolean> {
    const member = await db.projectMember.findFirst({
      where: {
        projectId,
        userId
      }
    });
    
    return !!member;
  }
}