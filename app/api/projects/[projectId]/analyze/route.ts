import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// AI 분석 응답 타입
interface AIAnalysisResponse {
  teamAnalysis: {
    teamStrengths: string[];           // 팀 강점 3개
    aiAdvice: string[];                // AI 조언 2개  
    operationRecommendations: string[];// 운영 권장 2개
    leadershipDistribution: Record<string, number>; // 팀장적합도% 분배
  };
  memberAnalysis: Array<{
    userId: string;
    role: string;                      // 역할 (겸직 가능)
    strengths: string[];               // 개인 강점
    leadershipScore: number;           // 팀장적합도%
  }>;
}

/**
 * DevMatch 팀 분석 AI 프롬프트
 */
const createAnalysisPrompt = (projectInfo: any, memberProfiles: any[]): string => {
  return `**DevMatch 팀 분석 AI**

당신은 **DevMatch**의 팀 분석 전문 AI입니다. DevMatch는 개발자들이 모여 실제 프로젝트를 함께 만드는 팀 빌딩 플랫폼입니다.

**당신의 임무:**
모든 팀원이 면담을 완료한 후, 이 팀이 성공적으로 프로젝트를 완성할 수 있도록 최적의 팀 구성을 분석하는 것입니다.

**프로젝트 정보:**
- 프로젝트: ${projectInfo.name}
- 목표: ${projectInfo.description}
- 팀 크기: ${projectInfo.teamSize}명
- 기술스택: ${JSON.stringify(projectInfo.techStack)}

**팀원 면담 결과:**
${memberProfiles.map((profile, index) => `
팀원 ${index + 1}: ${profile.memberName} (ID: ${profile.memberId})
- 기술 점수 (1~5점): ${JSON.stringify(profile.skillScores)}
- 워크스타일: ${profile.workStyles?.join(', ') || '없음'}
`).join('\n')}

**정확히 필요한 분석 결과:**

1. **팀장 추천도 분석**
   - 각 팀원의 팀장 추천도를 0-100% 범위로 분석
   - Git/GitHub 기술, 워크스타일, 리더십 성향 등을 종합적으로 고려
   - 팀원 전체 합계 100%가 되도록 상대적 분배
   - **중요: 팀장 추천도는 중복 계산하지 말고 한 번만 계산해서 넘겨주세요**

2. **역할 배정**
   - Frontend Developer: 프론트엔드 기술 점수 기반
   - Backend Developer: 백엔드 기술 점수 기반  
   - Frontend/Backend Developer: 양쪽 모두 가능한 경우 (겸직)

3. **팀 운영 가이드**
   - 팀 강점 3개: 이 팀만의 기술적/협업적 장점
   - AI 조언 2개: 프로젝트 성공을 위한 구체적 조언
   - 운영 권장사항 2개: 팀 관리/협업 방법 제안

**응답 형식 (JSON만):**
{
  "teamAnalysis": {
    "teamStrengths": ["구체적 강점1", "구체적 강점2", "구체적 강점3"],
    "aiAdvice": ["실용적 조언1", "실용적 조언2"], 
    "operationRecommendations": ["운영 방법1", "운영 방법2"],
    "leadershipDistribution": {
      "${memberProfiles[0]?.memberId}": 숫자,
      "${memberProfiles[1]?.memberId}": 숫자,
      "${memberProfiles[2]?.memberId}": 숫자,
      "${memberProfiles[3]?.memberId}": 숫자
    }
  },
  "memberAnalysis": [
    {
      "userId": "실제 memberId",
      "role": "Frontend Developer | Backend Developer | Frontend/Backend Developer",
      "strengths": ["개인 강점1", "개인 강점2"],
      "leadershipScore": 숫자
    }
  ]
}

**필수 규칙:**
- leadershipDistribution 합계 = 정확히 100
- 모든 userId는 실제 제공된 memberId 사용
- JSON 외 다른 텍스트 절대 금지`;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // 내부 요청 확인
    const isInternalRequest = req.headers.get('X-Internal-Request') === 'true';
    
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
          include: { user: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 모든 면담 완료 확인
    const allInterviewsCompleted = project.members.every(
      member => member.interviewStatus === 'COMPLETED' && member.memberProfile
    );

    if (!allInterviewsCompleted) {
      return NextResponse.json({ 
        message: '모든 팀원의 면담이 완료되어야 분석을 시작할 수 있습니다.' 
      }, { status: 400 });
    }

    // 팀원 프로필 데이터 준비
    const memberProfiles = project.members.map(member => ({
      memberId: member.user.id,
      memberName: member.user.name || member.user.nickname || '익명',
      ...member.memberProfile as any
    }));

    // AI 분석 실행
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
      headers: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "DevMatch Team Analysis",
      },
    });

    const prompt = createAnalysisPrompt(project, memberProfiles);
    
    let analysisResult: AIAnalysisResponse;
    
    try {
      const result = await generateText({
        model: openrouter('meta-llama/llama-3.3-70b-instruct'),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        maxTokens: 2000,
      });

      analysisResult = JSON.parse(result.text.trim());
    } catch (error) {
      console.error('AI 분석 실패:', error);
      
      // 백업 기본 분석 (간단한 로직)
      const totalMembers = project.members.length;
      const baseScore = Math.floor(100 / totalMembers);
      const remainder = 100 % totalMembers;
      
      analysisResult = {
        teamAnalysis: {
          teamStrengths: ["팀원들의 기술 역량", "다양한 경험 보유", "균형잡힌 팀 구성"],
          aiAdvice: ["정기적인 팀 미팅 진행", "코드 리뷰 프로세스 구축"], 
          operationRecommendations: ["애자일 개발 방법론 적용", "명확한 역할 분담"],
          leadershipDistribution: Object.fromEntries(
            project.members.map((member, index) => [
              member.user.id, 
              baseScore + (index < remainder ? 1 : 0)
            ])
          )
        },
        memberAnalysis: project.members.map((member, index) => ({
          userId: member.user.id,
          role: index % 2 === 0 ? "Frontend Developer" : "Backend Developer",
          strengths: ["기술적 역량", "팀 협업 능력"],
          leadershipScore: baseScore + (index < remainder ? 1 : 0)
        }))
      };
    }

    // 데이터베이스 업데이트
    await db.project.update({
      where: { id: projectId },
      data: {
        teamAnalysis: analysisResult.teamAnalysis,
        status: 'ACTIVE'
      }
    });

    // 각 멤버에게 개인 분석 결과 저장
    await Promise.all(
      analysisResult.memberAnalysis.map(async (memberAnalysis) => {
        const member = project.members.find(m => m.user.id === memberAnalysis.userId);
        if (member) {
          await db.projectMember.update({
            where: { id: member.id },
            data: {
              role: memberAnalysis.role,
              memberProfile: {
                ...member.memberProfile as any,
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
    const leaderMember = project.members.find(m => m.user.id === topLeader.userId);
    const leaderName = leaderMember?.user?.nickname || leaderMember?.user?.name || '팀장';
    
    await db.chatMessage.create({
      data: {
        projectId,
        content: `🚀 프로젝트가 시작되었습니다! ${leaderName}님이 팀장으로 추천되었습니다.`,
        type: 'SYSTEM'
      }
    });

    console.log(`팀 분석 완료: ${projectId}, 팀장: ${leaderName}`);

    return NextResponse.json({
      success: true,
      teamAnalysis: analysisResult.teamAnalysis,
      memberAnalysis: analysisResult.memberAnalysis,
      message: '팀 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('팀 분석 오류:', error);
    return NextResponse.json(
      { 
        message: '팀 분석 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}