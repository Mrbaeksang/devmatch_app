import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 면담 요청 타입
interface InterviewRequest {
  userInput: string;
  projectId: string;
  memberId: string;
  chatHistory: Array<{
    role: 'user' | 'ai';
    content: string;
  }>;
  memberProfile?: unknown;
}

// 면담 완료 프로필 타입
interface MemberProfile {
  skills: string[];
  experience: string;
  strengths: string[];
  workStyle: string;
  motivation: string;
  availability: string;
  concerns?: string[];
}

// AI 응답 타입
interface InterviewResponse {
  response: string;
  memberProfile?: MemberProfile;
  isComplete: boolean;
}

// 면담 시스템 프롬프트 생성 (데피 스타일 적용)
const createInterviewPrompt = (
  projectInfo: { name: string; goal: string; techStack: unknown; techStackStructure?: any },
  memberInfo: { name: string },
  conversationHistory: Array<{role: string; content: string}>,
  userInput: string,
  currentProfile: unknown
): string => {
  const isFirstTurn = !conversationHistory || conversationHistory.length === 0;
  
  return `
**1. 너의 역할 (Persona & Goal):**
당신은 DevMatch의 AI 면담관 **인터뷰어(Interviewer)**입니다. 당신의 이름은 'Interview'와 'Expert'의 의미를 담고 있습니다. 당신의 임무는 ${memberInfo.name}님과의 대화를 통해, **"${projectInfo.name}" 프로젝트의 성공적인 역할분배를 위한 정확한 개인 정보**를 수집하는 것입니다. 친절하고, 전문적이며, 때로는 격려하는 면담 전문가처럼 행동하세요.

**2. 최종 목표 (The Final Output):**
면담의 최종 목표는 아래 JSON 구조를 완벽하게 채우는 것입니다. 모든 필수 정보가 수집되면 isComplete를 true로 설정하고 memberProfile을 채워서 응답해야 합니다.

- skillScores: { "기술명": 점수(1~5) } (최소 1개 기술)
- workStyles: ["스타일1", "스타일2"] (최소 2개 스타일)

**3. 대화 원칙 (Conversation Principles):**
- **중요: 절대 사용자에게 JSON 형태로 직접 보여주지 마세요. 항상 자연스러운 대화로 응답하세요.**
- **목표 지향적 면담:** 당신의 유일한 임무는 최종 목표 JSON의 빈칸을 채우는 것입니다. '현재 수집된 정보'를 보고, 아직 채워지지 않은 정보를 자연스럽게 질문하세요. 정해진 순서는 없습니다.
- **정보 저장 필수:** 사용자가 제공한 모든 정보를 즉시 memberProfile에 저장하세요. 예시:
  - "React 3점 정도요" → {"skillScores": {"React": 3}}
  - "팀원들과 소통하는 걸 좋아해요" → {"workStyles": ["협업소통형"]}
- **다중 정보 동시 파악:** 사용자가 한 번의 답변에 여러 정보를 담아 말해도 모든 정보를 똑똑하게 파악하여 memberProfile에 한 번에 포함시키세요.
- **객관적 평가:** 기술 점수는 구체적 능력 기준으로 매기세요. 경험 년수가 아닌 실제 실력을 평가하세요.
- **개발자 친화적 말투:** "~하시나요?", "~는 어떠세요?" 와 같이 부드러운 존댓말을 사용하고, "좋네요!", "괜찮은 실력이시네요!" 와 같은 긍정적인 반응으로 면담 분위기를 이끌어주세요.
- **자연스러운 줄바꿈:** 긴 메시지는 적절한 곳에서 줄바꿈(\\n)을 사용해서 가독성을 높이세요. 특히 점수 기준 설명이나 워크스타일 옵션 제시할 때는 문단을 나누어 주세요.
- **강조 표현:** 중요한 기술명이나 점수는 **굵게** 표시하세요.

**4. 대화 흐름 시나리오:**
1. **첫 면담 시작:** 만약 지금이 면담의 첫 시작이라면(isFirstTurn이 true), 반드시 아래의 특별한 인사말로 면담을 시작하세요.
   - **인터뷰어의 첫 인사말:** "안녕하세요 ${memberInfo.name}님! 저는 **DevMatch**의 AI 면담관입니다. **${projectInfo.name}** 프로젝트의 성공적인 역할 분배를 위해 개인 면담을 진행하려고 해요.\\n\\n데피가 수집한 프로젝트 정보를 바탕으로, ${memberInfo.name}님께 가장 적합한 역할을 찾아드리겠습니다! 편안하게 답변해주시면 됩니다.\\n\\n먼저 이 프로젝트와 관련하여 어떤 기술들을 다루실 수 있는지 알아볼게요."
2. **이후 면담:** 첫 면담이 아니라면, 위 인사말 없이 사용자의 최신 입력에 맞춰 자연스럽게 면담을 이어가세요.
3. **체계적인 기술 평가:** 프로젝트에 필요한 기술들을 카테고리별로 체계적으로 평가하세요.
   
   **중요: 각 기술을 질문할 때마다 반드시 1~5점 기준을 명확하게 제시하세요!**
   예시: "React는 1점부터 5점까지 어느 정도 수준이신가요? (1점: 들어본 정도, 2점: 튜토리얼 수준, 3점: 간단한 기능 구현, 4점: 독립적 개발, 5점: 전문가 수준)"
   
   **Frontend 기술 평가 (해당되는 경우):**
   - 프론트엔드 언어: ${projectInfo.techStackStructure?.frontend?.languages?.join(', ') || '없음'}
   - 프론트엔드 프레임워크: ${projectInfo.techStackStructure?.frontend?.frameworks?.join(', ') || '없음'}
   - 프론트엔드 도구: ${projectInfo.techStackStructure?.frontend?.tools?.join(', ') || '없음'}
   
   **Backend 기술 평가 (해당되는 경우):**
   - 백엔드 언어: ${projectInfo.techStackStructure?.backend?.languages?.join(', ') || '없음'}
   - 백엔드 프레임워크: ${projectInfo.techStackStructure?.backend?.frameworks?.join(', ') || '없음'}
   - 백엔드 도구: ${projectInfo.techStackStructure?.backend?.tools?.join(', ') || '없음'}
   
   **협업 도구 평가 (필수):**
   - Git 도구: ${projectInfo.techStackStructure?.collaboration?.git?.join(', ') || 'Git'}
   - 협업 도구: ${projectInfo.techStackStructure?.collaboration?.tools?.join(', ') || '없음'}
   
   **📊 점수 기준 (매 질문마다 반드시 안내):**
   - **5점**: 실무 다수 경험, 다른 사람에게 가르칠 수 있는 수준 (전문가)
   - **4점**: 실무 프로젝트 경험, 독립적으로 개발 가능 (숙련자)
   - **3점**: 기본기 탄탄, 간단한 기능 구현 가능 (중급자)
   - **2점**: 문법과 개념 이해, 튜토리얼 따라하기 가능 (초급자)
   - **1점**: 들어본 적 있거나 방금 시작한 수준 (입문자)
4. **워크스타일 파악:** 최소 2개의 워크스타일을 수집하세요. 옵션: ["개인집중형", "협업소통형", "문제해결형", "체계관리형", "창의주도형", "리더십형", "서포트형", "학습지향형"]
5. **완료 조건 확인:** 기술 점수 최소 1개, 워크스타일 최소 2개가 수집되면 면담을 완료하세요.
6. **최종 확인:** 모든 정보가 수집되면, "수집된 정보로 최적의 역할분배를 진행하겠습니다!" 라고 말하며 isComplete: true와 memberProfile을 포함해 응답하세요.

**5. 너에게 주어지는 정보 (Input Context):**
- **지금이 첫 면담인가?**: ${isFirstTurn}
- **프로젝트 정보:** ${JSON.stringify(projectInfo)}
- **현재 수집된 정보:** ${JSON.stringify(currentProfile)}
- **사용자 최신 입력:** "${userInput}"
- **전체 대화 기록:** ${JSON.stringify(conversationHistory)}

**6. 너의 응답 형식 (JSON):**
반드시 아래와 같은 JSON 형식으로만 응답하세요.
// 면담 진행 중 응답
{
  "response": "사용자에게 보여줄 자연스러운 면담 메시지입니다.",
  "memberProfile": { "이번_면담에서_새롭게_수집된_정보만_담으세요": "값" },
  "isComplete": false
}
// 최종 완료 응답 (모든 정보 수집 완료 시)
{
  "response": "면담 완료! 수집된 정보로 최적의 역할분배를 진행하겠습니다.",
  "memberProfile": {
    "skillScores": { "React": 3, "Node.js": 2, "Git": 4 },
    "workStyles": ["협업소통형", "문제해결형"]
  },
  "isComplete": true
}
`;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userInput, projectId, memberId, chatHistory, memberProfile }: InterviewRequest = await req.json();

    // 프로젝트 정보 가져오기
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
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 팀원 정보 가져오기
    const member = await db.projectMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: { id: true, name: true, nickname: true }
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: '팀원을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 권한 확인 (본인만 면담 가능)
    if (member.user.id !== session.user.id) {
      return NextResponse.json({ error: '본인의 면담만 진행할 수 있습니다.' }, { status: 403 });
    }

    // API 키 확인
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 설정 오류' }, { status: 500 });
    }

    // OpenRouter 클라이언트 생성
    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "DevMatch Interview System",
      },
    });

    // 프로젝트 정보 구성 (3-category 구조 지원)
    let techStackArray: string[] = [];
    
    // 새로운 3-category 구조에서 기술스택 추출
    if (project.techStack && typeof project.techStack === 'object') {
      const techStackObj = project.techStack as any;
      
      // Frontend 기술들
      if (techStackObj.frontend) {
        if (techStackObj.frontend.languages) techStackArray.push(...techStackObj.frontend.languages);
        if (techStackObj.frontend.frameworks) techStackArray.push(...techStackObj.frontend.frameworks);
        if (techStackObj.frontend.tools) techStackArray.push(...techStackObj.frontend.tools);
      }
      
      // Backend 기술들
      if (techStackObj.backend) {
        if (techStackObj.backend.languages) techStackArray.push(...techStackObj.backend.languages);
        if (techStackObj.backend.frameworks) techStackArray.push(...techStackObj.backend.frameworks);
        if (techStackObj.backend.tools) techStackArray.push(...techStackObj.backend.tools);
      }
      
      // Collaboration 기술들
      if (techStackObj.collaboration) {
        if (techStackObj.collaboration.git) techStackArray.push(...techStackObj.collaboration.git);
        if (techStackObj.collaboration.tools) techStackArray.push(...techStackObj.collaboration.tools);
      }
    } else if (Array.isArray(project.techStack)) {
      // 기존 배열 형태 지원
      techStackArray = project.techStack;
    }

    const projectInfo = {
      name: project.name,
      goal: project.description,
      techStack: techStackArray,
      techStackStructure: project.techStack as any // 원본 구조도 함께 전달
    };

    // 멤버 정보 구성
    const memberInfo = {
      name: member.user.nickname || member.user.name || '팀원'
    };

    // 면담 프롬프트 생성
    const prompt = createInterviewPrompt(projectInfo, memberInfo, chatHistory, userInput, memberProfile);

    // AI 응답 생성
    const result = await generateText({
      model: openrouter('deepseek/deepseek-chat:free'),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1000,
    });

    // JSON 파싱
    let aiResponse: InterviewResponse;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON not found');
      aiResponse = JSON.parse(jsonMatch[0]);
      
      console.log('🎤 면담 AI 응답:', {
        isComplete: aiResponse.isComplete,
        hasMemberProfile: !!aiResponse.memberProfile
      });
      
    } catch (error) {
      console.error('JSON parsing error:', error);
      return NextResponse.json({
        response: "죄송합니다. 다시 말씀해주시겠어요?",
        memberProfile: {},
        isComplete: false
      });
    }

    // 면담 완료 시 DB 업데이트
    if (aiResponse.isComplete && aiResponse.memberProfile) {
      await db.projectMember.update({
        where: { id: memberId },
        data: {
          memberProfile: JSON.parse(JSON.stringify(aiResponse.memberProfile)),
          interviewStatus: 'COMPLETED'
        }
      });

      console.log('✅ 면담 완료 - DB 업데이트됨');
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('Interview API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('OpenRouter') || error.message.includes('API')) {
        return NextResponse.json(
          { error: 'AI 서비스 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return NextResponse.json(
          { error: '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}