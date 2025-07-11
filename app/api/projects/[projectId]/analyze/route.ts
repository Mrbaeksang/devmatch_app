import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { MemberProfile, TeamAnalysis, RoleAssignment } from '@/types/project';

// AI 응답 인터페이스
interface AIAnalysisResponse {
  teamAnalysis: TeamAnalysis;
  roleAssignments: RoleAssignment[];
}

/**
 * AI 분석을 위한 시스템 프롬프트 생성
 */
const getAnalysisPrompt = (projectInfo: { name: string; goal: string; techStack?: string[]; maxMembers: number; blueprint?: { aiSuggestedRoles?: Array<{ roleName: string; count: number; description: string }> } }, memberProfiles: MemberProfile[]): string => {
  return `당신은 전문적인 AI 팀 분석가입니다. 프로젝트와 팀원 정보를 바탕으로 최적의 팀 구성을 분석해주세요.

프로젝트 정보:
- 프로젝트명: ${projectInfo.name}
- 목표: ${projectInfo.goal}
- 기술 스택: ${projectInfo.techStack?.join(', ') || '미정'}
- 예상 팀원 수: ${projectInfo.maxMembers}명
- AI 제안 역할: ${JSON.stringify(projectInfo.blueprint?.aiSuggestedRoles || [])}

팀원 정보:
${memberProfiles.map((profile, index) => `
팀원 ${index + 1}: ${profile.name}
- 기술 스택: ${profile.skills?.join(', ') || '없음'}
- 경험: ${profile.experience || '없음'}
- 리더십 레벨: ${profile.leadershipLevel || 'none'}
- 작업 스타일: ${profile.workStyle || '없음'}
- 소통 방식: ${profile.communication || '없음'}
- 참여 동기: ${profile.motivation || '없음'}
- 시간 가용성: ${profile.availability || '없음'}
- 역할 선호: ${profile.rolePreference || '없음'}
- 추가 정보: ${profile.additionalInfo || '없음'}
`).join('\n')}

다음 JSON 형식으로 응답해주세요:
{
  "teamAnalysis": {
    "overallScore": 85,
    "strengths": ["팀의 강점 1", "팀의 강점 2", "팀의 강점 3"],
    "concerns": ["우려사항 1", "우려사항 2"],
    "recommendations": ["권장사항 1", "권장사항 2", "권장사항 3"],
    "leadershipAnalysis": {
      "recommendedLeader": "user1",
      "leadershipScores": [
        {
          "userId": "user1",
          "score": 90,
          "reasoning": "리더십 평가 근거"
        }
      ]
    }
  },
  "roleAssignments": [
    {
      "userId": "user1",
      "assignedRole": "팀장 & 백엔드 개발자",
      "isLeader": true,
      "reasoning": "역할 배정 근거",
      "responsibilities": ["책임 1", "책임 2", "책임 3"],
      "matchScore": 95
    }
  ]
}

분석 기준:
1. 전체 점수 (overallScore): 0-100점, 팀 전체의 매칭 적합도
2. 강점 (strengths): 3-5개, 팀의 주요 강점
3. 우려사항 (concerns): 1-3개, 잠재적 문제점
4. 권장사항 (recommendations): 3-5개, 팀 운영 개선 방안
5. 리더십 분석: 각 팀원의 리더십 적합도 0-100점 평가
6. 역할 배정: 각 팀원에게 최적의 역할 배정 (적합도 0-100점)

리더십 레벨 가중치:
- preferred: 높은 가중치, 리더 역할 우선 고려
- experienced: 중간 가중치, 서브 리더 또는 멘토 역할
- interested: 낮은 가중치, 학습 기회 제공
- none: 개인 기여자 역할에 집중

역할 배정 시 고려사항:
- 기술 스택 매칭도
- 경험 수준 적합성
- 작업 스타일 조화
- 시간 가용성 호환성
- 개인 선호도 반영
- 팀 전체 밸런스

절대로 JSON 외의 다른 텍스트를 포함하지 마세요.`;
};

/**
 * AI 응답을 안전하게 파싱하는 함수
 */
const parseAnalysisResponse = (content: string): AIAnalysisResponse => {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // 필수 필드 검증
    if (!parsed.teamAnalysis || !parsed.roleAssignments) {
      throw new Error('필수 필드가 누락되었습니다');
    }

    return parsed as AIAnalysisResponse;
  } catch (error) {
    console.error('AI 분석 응답 파싱 오류:', error);
    console.error('원본 응답:', content);
    
    // 파싱 실패 시 기본 응답 반환
    throw new Error('AI 분석 결과 파싱 실패');
  }
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // 내부 요청인지 확인 (선택사항)
    const isInternalRequest = req.headers.get('X-Internal-Request') === 'true';
    
    // 내부 요청이 아닌 경우 세션 확인
    if (!isInternalRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const { projectId } = await params;

    // 프로젝트 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 모든 면담이 완료되었는지 확인
    const allInterviewsCompleted = project.members.every(
      member => member.interviewStatus === 'COMPLETED' && member.memberProfile
    );

    if (!allInterviewsCompleted) {
      return NextResponse.json({ 
        message: '모든 팀원의 면담이 완료되어야 분석을 시작할 수 있습니다.' 
      }, { status: 400 });
    }

    // 멤버 프로필 추출 및 타입 변환
    const memberProfiles: MemberProfile[] = project.members
      .filter(member => member.memberProfile)
      .map(member => {
        const profile = member.memberProfile as Record<string, unknown>;
        return {
          memberId: member.user.id,
          memberName: member.user.name || '익명',
          skillLevel: profile.skillLevel as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
          strongSkills: Array.isArray(profile.strongSkills) ? profile.strongSkills as string[] : [],
          learningGoals: Array.isArray(profile.learningGoals) ? profile.learningGoals as string[] : [],
          preferredRole: profile.preferredRole as 'frontend' | 'backend' | 'fullstack' | 'leader' || 'fullstack',
          leadershipLevel: profile.leadershipLevel as 'none' | 'interested' | 'experienced' | 'preferred' || 'none',
          leadershipExperience: Array.isArray(profile.leadershipExperience) ? profile.leadershipExperience as string[] : [],
          leadershipMotivation: profile.leadershipMotivation as string || '',
          workStyle: profile.workStyle as 'individual' | 'collaborative' | 'mixed' || 'collaborative',
          projectMotivation: profile.projectMotivation as string || '',
          contributions: Array.isArray(profile.contributions) ? profile.contributions as string[] : [],
          // 호환성을 위한 추가 필드들
          skills: Array.isArray(profile.skills) ? profile.skills as string[] : [],
          experience: profile.experience as string || '',
          communication: profile.communication as string || '',
          motivation: profile.motivation as string || '',
          availability: profile.availability as string || '',
          rolePreference: profile.rolePreference as string || '',
          additionalInfo: profile.additionalInfo as string || ''
        } as MemberProfile;
      });

    if (memberProfiles.length === 0) {
      return NextResponse.json({ 
        message: '분석할 팀원 정보가 없습니다.' 
      }, { status: 400 });
    }

    // AI 분석 API 호출
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API 설정 오류가 발생했습니다.' 
      }, { status: 500 });
    }

    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "DevMatch Team Analysis",
      },
    });

    const systemPrompt = getAnalysisPrompt({
      name: project.name,
      goal: project.description,
      techStack: project.techStack as string[] | undefined,
      maxMembers: project.teamSize,
      blueprint: project.blueprint ? {
        aiSuggestedRoles: (project.blueprint as Record<string, unknown>)?.aiSuggestedRoles as Array<{ roleName: string; count: number; description: string }> || []
      } : undefined
    }, memberProfiles);

    console.log('AI 분석 시작:', {
      projectId,
      memberCount: memberProfiles.length,
      promptLength: systemPrompt.length
    });

    // AI 분석 실행
    let analysisText: string;
    try {
      const result = await generateText({
        model: openrouter('deepseek/deepseek-chat:free'),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: '위의 프로젝트와 팀원 정보를 바탕으로 완전한 팀 분석을 수행해주세요. JSON 형식으로 응답해주세요.'
          }
        ],
        temperature: 0.3,
        maxTokens: 2000,
      });
      analysisText = result.text;
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('rate limit')) {
        // 백업 모델 사용
        try {
          const fallbackResult = await generateText({
            model: openrouter('deepseek/deepseek-chat:free'),
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: '팀 분석을 수행해주세요. JSON 형식으로 응답해주세요.'
              }
            ],
            temperature: 0.3,
            maxTokens: 2000,
          });
          analysisText = fallbackResult.text;
        } catch {
          throw new Error('AI 분석 서비스를 일시적으로 사용할 수 없습니다.');
        }
      } else {
        throw error;
      }
    }

    // AI 응답 파싱
    const analysisResult = parseAnalysisResponse(analysisText);

    // 역할 배정 데이터 매핑 (userId 추가)
    const roleAssignmentsWithUserId = analysisResult.roleAssignments.map(assignment => {
      const member = project.members.find(m => m.user?.id === assignment.userId);
      if (!member) {
        throw new Error(`사용자 ID ${assignment.userId}를 찾을 수 없습니다.`);
      }
      return {
        ...assignment,
        userId: member.user!.id
      };
    });

    // 데이터베이스에 분석 결과 저장
    await db.project.update({
      where: { id: projectId },
      data: {
        teamAnalysis: JSON.parse(JSON.stringify(analysisResult.teamAnalysis)),
        status: 'ACTIVE'
      }
    });

    // 각 멤버에게 역할 배정 저장
    await Promise.all(
      roleAssignmentsWithUserId.map(async (assignment) => {
        const member = project.members.find(m => m.user?.id === assignment.userId);
        if (member) {
          await db.projectMember.update({
            where: { id: member.id },
            data: {
              role: assignment.assignedRole,
              memberProfile: JSON.parse(JSON.stringify(assignment))
            }
          });
        }
      })
    );

    // 시스템 메시지 추가 - 프로젝트 시작
    const leaderMember = project.members.find(
      m => m.user?.id === analysisResult.teamAnalysis.leadershipAnalysis?.recommendedLeader
    );
    const leaderName = leaderMember?.user?.nickname || leaderMember?.user?.name || '팀장';
    
    await db.chatMessage.create({
      data: {
        projectId,
        content: `🚀 프로젝트가 시작되었습니다! ${leaderName}님이 팀장으로 선정되었습니다.`,
        type: 'SYSTEM'
      }
    });

    console.log('팀 분석 완료:', {
      projectId,
      overallScore: analysisResult.teamAnalysis.overallScore,
      recommendedLeader: analysisResult.teamAnalysis.leadershipAnalysis?.recommendedLeader,
      roleAssignments: roleAssignmentsWithUserId.length
    });

    return NextResponse.json({
      success: true,
      teamAnalysis: analysisResult.teamAnalysis,
      roleAssignments: roleAssignmentsWithUserId,
      message: '팀 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('팀 분석 오류:', error);
    
    let errorMessage = '팀 분석 중 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'API 인증 오류가 발생했습니다.';
      } else if (error.message.includes('파싱')) {
        errorMessage = 'AI 분석 결과 처리 중 오류가 발생했습니다.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}