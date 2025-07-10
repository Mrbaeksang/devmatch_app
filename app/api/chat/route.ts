import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 데피 시스템 요청 타입 (currentStep 제거)
interface ChatRequest {
  userInput: string;
  collectedData: {
    projectName?: string;
    projectGoal?: string;
    teamSize?: number;
    techStack?: {
      frontend?: {
        languages: string[];
        frameworks: string[];
        tools?: string[];
      };
      backend?: {
        languages: string[];
        frameworks: string[];
        tools?: string[];
      };
      collaboration: {
        git: string[];
        tools?: string[];
      };
    };
    duration?: string;
  };
  chatHistory: Array<{
    role: 'user' | 'ai';
    content: string;
  }>;
}

// 새로운 AI 응답 타입 (데피 시스템 기반 - 다중 역할 지원)
interface AIResponse {
  response: string;
  dataToSave: Record<string, unknown>;
  isComplete: boolean;
  finalData?: {
    projectName: string;
    projectGoal: string;
    teamSize: number;
    techStack: {
      frontend?: {
        languages: string[];    // ["JavaScript", "TypeScript"]
        frameworks: string[];   // ["React", "Next.js"]
        tools?: string[];       // ["Tailwind CSS", "SCSS"]
      };
      backend?: {
        languages: string[];    // ["Java", "Python", "Node.js"]
        frameworks: string[];   // ["Spring Boot", "Express", "Django"]
        tools?: string[];       // ["JPA", "MySQL", "PostgreSQL"]
      };
      collaboration: {          // 필수값 (팀장 선발 기준)
        git: string[];          // ["Git", "GitHub", "GitLab"]
        tools?: string[];       // ["PR관리", "코드리뷰", "이슈관리"]
      };
    };
    duration: string;
    teamComposition: {
      totalMembers: number;
      roleRequirements: {
        backend: number;        // 백엔드 작업이 필요한 인원
        frontend: number;       // 프론트엔드 작업이 필요한 인원
        fullstack?: number;     // 풀스택 (백+프론트 겸업)
      };
      hasTeamLead: boolean;
      allowMultipleRoles: boolean;
      description?: string;     // "4명 중 1명은 백엔드+프론트엔드 겸업"
    };
  };
}

// 데피 시스템 프롬프트 생성 함수
const createDeffyPrompt = (collectedData: Record<string, unknown>, conversationHistory: Array<{role: string; content: string}>, userInput: string): string => {
  const currentData = collectedData || {};
  const isFirstTurn = !conversationHistory || conversationHistory.length === 0;

  return `
**1. 너의 역할 (Persona & Goal):**
당신은 DevMatch의 AI 기술 상담원이자 최고의 프로젝트 기획자, **데피(Deffy)**입니다. 당신의 이름은 'Development'와 'Friend'의 의미를 담고 있습니다. 당신의 임무는 사용자와의 대화를 통해, 다른 개발자들이 보고 "와, 이 프로젝트 꼭 참여하고 싶다!"라고 느낄 만큼 매력적인 '프로젝트 청사진'을 완성하는 것입니다. 친절하고, 유능하며, 때로는 재치있는 기술 전문가처럼 행동하세요.

**2. 최종 목표 (The Final Output):**
대화의 최종 목표는 아래 JSON 구조를 완벽하게 채우는 것입니다. 모든 필수 정보가 수집되면 isComplete를 true로 설정하고 finalData를 채워서 응답해야 합니다.

- projectName: string (사용자 첫 발언에서 추출)
- projectGoal: string (구체적인 목표 설명)
- teamSize: number (총 팀원 수)
- techStack: {
    frontend?: { languages: [], frameworks: [], tools?: [] },
    backend?: { languages: [], frameworks: [], tools?: [] },
    collaboration: { git: [], tools?: [] }  // 필수
  } (프로젝트 특성에 따라 frontend/backend 선택, collaboration은 필수)
- duration: string (예상 기간)
- teamComposition: {
  totalMembers: number,
  roleRequirements: { backend: number, frontend: number, fullstack?: number },
  hasTeamLead: boolean,
  allowMultipleRoles: boolean,
  description: string
}

**3. 대화 원칙 (Conversation Principles):**
- **목표 지향적 대화:** 당신의 유일한 임무는 최종 목표 JSON의 빈칸을 채우는 것입니다. '현재 수집된 정보'를 보고, 아직 채워지지 않은 정보를 자연스럽게 질문하세요. 정해진 순서는 없습니다.
- **정보 저장 필수:** 사용자가 제공한 모든 정보를 즉시 dataToSave에 저장하세요. 예시:
  - "카페 메뉴 관리 서비스" → {"projectName": "카페 메뉴 관리 서비스"}
  - "4명" → {"teamSize": 4}
  - "Java로 Spring Boot, React로 프론트" → {"techStack": {
      "backend": {"languages": ["Java"], "frameworks": ["Spring Boot"]},
      "frontend": {"languages": ["JavaScript"], "frameworks": ["React"]},
      "collaboration": {"git": ["Git"]}
    }}
- **다중 정보 동시 파악:** 사용자가 한 번의 답변에 여러 정보를 담아 말해도 모든 정보를 똑똑하게 파악하여 dataToSave에 한 번에 포함시키세요.
- **적극적인 제안:** 사용자가 "잘 모르겠어요"라고 하거나 아이디어가 막연할 경우, 먼저 개방형 질문을 던지고, 그 다음에 구체적인 제안을 하세요.
- **개발자 친화적 말투:** "~하시나요?", "~는 어떠세요?" 와 같이 부드러운 존댓말을 사용하고, "오, 좋은데요!", "재미있는 아이디어네요!" 와 같은 긍정적인 반응으로 대화 분위기를 이끌어주세요.
- **자연스러운 줄바꿈:** 긴 메시지는 적절한 곳에서 줄바꿈(\\n)을 사용해서 가독성을 높이세요. 특히 질문이 여러 개일 때나 설명이 길 때는 문단을 나누어 주세요.
- **강조 표현:** 중요한 단어나 프로젝트 이름은 **굵게** 표시하세요.
- **확인과 되묻기:** 사용자에게서 정보를 추출한 후에는 항상 명확하게 확인하는 과정을 거치세요.

**4. 대화 흐름 시나리오:**
1. **첫 대화 시작:** 만약 지금이 대화의 첫 시작이라면(isFirstTurn이 true), 반드시 아래의 특별한 인사말로 대화를 시작하세요.
   - **데피의 첫 인사말:** "안녕하세요! DevMatch에 오신 것을 환영합니다. 저는 당신의 아이디어를 구체적인 '프로젝트 청사진'으로 만들어드릴 AI, **데피(Deffy)**라고 해요. 함께 멋진 프로젝트를 설계해볼까요? 우선, 어떤 프로젝트를 만들고 싶으신지 편하게 말씀해주세요!"
2. **이후 대화:** 첫 대화가 아니라면, 위 인사말 없이 사용자의 최신 입력에 맞춰 자연스럽게 대화를 이어가세요.
3. **체계적인 기술스택 수집:** 프로젝트 타입을 파악한 후 다음과 같이 질문하세요:
   - "어떤 종류의 프로젝트인가요? (웹사이트, API서버, 모바일앱 등)"
   - 백엔드가 필요하면: "백엔드는 어떤 언어와 프레임워크로 구현하시겠어요?"
   - 프론트엔드가 필요하면: "사용자 화면은 어떤 기술로 만드시겠어요?"
   - 항상 마지막에: "팀 협업은 Git과 GitHub로 하시겠어요?"
4. **지능적인 역할 분배 제안:** 모든 기본 정보가 수집되면, 기술 스택의 특성과 팀원 수를 종합적으로 고려하여 가장 합리적인 역할 분배를 제안하세요.
5. **팀장 필요 유무 질문:** 역할 분배에 사용자가 동의하면, "프로젝트를 원활하게 이끌기 위해 공식적인 '팀장' 역할을 둘까요?" 라고 질문하세요.
6. **최종 확인:** 모든 정보가 확정되면, 수집된 전체 내용을 보기 좋게 요약해서 보여주고 "이 내용으로 프로젝트 청사진을 최종 생성할까요?" 라고 물어보세요. 사용자가 긍정하면 isComplete: true와 finalData를 포함해 응답하세요.

**5. 너에게 주어지는 정보 (Input Context):**
- **지금이 첫 대화인가?**: ${isFirstTurn}
- **현재 수집된 정보:** ${JSON.stringify(currentData)}
- **사용자 최신 입력:** "${userInput}"
- **전체 대화 기록:** ${JSON.stringify(conversationHistory)}

**6. 너의 응답 형식 (JSON):**
반드시 아래와 같은 JSON 형식으로만 응답하세요.
// 진행 중 응답
{
  "response": "사용자에게 보여줄 자연스러운 대화 메시지입니다.",
  "dataToSave": { "이번_대화에서_새롭게_수집된_정보만_담으세요": "값" },
  "isComplete": false,
  "finalData": null
}
// 최종 완료 응답 (모든 정보 수집 완료 시)
{
  "response": "프로젝트 청사진 생성이 완료되었습니다! 팀원 모집을 시작해보세요.",
  "dataToSave": {},
  "isComplete": true,
  "finalData": {
    "projectName": "수집된 프로젝트 이름",
    "projectGoal": "수집된 목표 설명",
    "teamSize": 숫자,
    "techStack": {
      "backend": {"languages": ["Java"], "frameworks": ["Spring Boot"]},
      "frontend": {"languages": ["JavaScript"], "frameworks": ["React"]},
      "collaboration": {"git": ["Git", "GitHub"]}
    },
    "duration": "기간",
    "teamComposition": {
      "totalMembers": 숫자,
      "roleRequirements": {
        "backend": 숫자,
        "frontend": 숫자,
        "fullstack": 숫자(겸업 인원)
      },
      "hasTeamLead": true/false,
      "allowMultipleRoles": true/false,
      "description": "4명 중 1명은 백엔드+프론트엔드 겸업, 팀장 필요"
    }
  }
}
`;
};


// 프로젝트 생성 함수
async function createProject(finalData: {
  projectName: string;
  projectGoal: string;
  teamSize: number;
  techStack: {
    frontend?: {
      languages: string[];
      frameworks: string[];
      tools?: string[];
    };
    backend?: {
      languages: string[];
      frameworks: string[];
      tools?: string[];
    };
    collaboration: {
      git: string[];
      tools?: string[];
    };
  };
  teamComposition: {
    totalMembers: number;
    roleRequirements: {
      backend: number;
      frontend: number;
      fullstack?: number;
    };
    allowMultipleRoles: boolean;
    description: string;
  };
  duration: string;
}, userId: string): Promise<{ inviteCode: string; projectId: string }> {
  // 초대 코드 생성
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const project = await db.project.create({
    data: {
      name: finalData.projectName,
      description: finalData.projectGoal,
      goal: finalData.projectGoal,
      ownerId: userId,
      status: 'RECRUITING',
      inviteCode,
      maxMembers: finalData.teamSize,
      techStack: JSON.parse(JSON.stringify(finalData.techStack)),
      blueprint: {
        creatorName: '',
        projectName: finalData.projectName,
        projectDescription: finalData.projectGoal,
        techStack: JSON.parse(JSON.stringify(finalData.techStack)),
        projectType: 'web-application',
        complexity: 'intermediate',
        duration: finalData.duration,
        requirements: [],
        goals: [finalData.projectGoal],
        teamSize: finalData.teamSize,
        preferredRoles: [],
        aiSuggestedRoles: []
      },
      consultationData: {
        projectName: finalData.projectName,
        projectGoal: finalData.projectGoal,
        teamSize: finalData.teamSize,
        techStack: JSON.parse(JSON.stringify(finalData.techStack)),
        duration: finalData.duration,
        teamComposition: finalData.teamComposition
      }
    }
  });

  // 생성자를 팀원으로 추가 (면담 필요)
  await db.projectMember.create({
    data: {
      projectId: project.id,
      userId,
      role: 'owner',
      consultationCompleted: false,
      interviewStatus: 'PENDING'
    }
  });

  return { inviteCode, projectId: project.id };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userInput, collectedData, chatHistory }: ChatRequest = await req.json();

    // 디버깅용 로그
    console.log('📝 입력 데이터:', {
      userInput,
      collectedDataKeys: Object.keys(collectedData || {}),
      collectedData,
      chatHistoryLength: chatHistory?.length || 0
    });

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
        "X-Title": "DevMatch AI Consultation",
      },
    });

    // 데피 시스템 프롬프트 생성
    const prompt = createDeffyPrompt(collectedData, chatHistory, userInput);

    // AI 응답 생성
    const result = await generateText({
      model: openrouter('deepseek/deepseek-chat'),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1500,
    });

    // JSON 파싱
    let aiResponse: AIResponse;
    try {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON not found');
      aiResponse = JSON.parse(jsonMatch[0]);
      
      // 디버깅용 로그
      console.log('🤖 AI 응답:', {
        isComplete: aiResponse.isComplete,
        dataToSave: aiResponse.dataToSave,
        hasFinalData: !!aiResponse.finalData
      });
      
      if (aiResponse.finalData) {
        console.log('📊 Final Data:', aiResponse.finalData);
      }
      
    } catch (error) {
      console.error('JSON parsing error:', error);
      // 파싱 실패 시 기본 응답
      return NextResponse.json({
        response: "죄송합니다. 다시 말씀해주시겠어요?",
        dataToSave: {},
        isComplete: false,
        finalData: null
      });
    }

    // 프로젝트 생성 처리 (데피 시스템 기반 - 새로운 구조)
    if (aiResponse.isComplete && aiResponse.finalData) {
      const projectData = {
        projectName: aiResponse.finalData.projectName,
        projectGoal: aiResponse.finalData.projectGoal,
        teamSize: aiResponse.finalData.teamSize,
        techStack: aiResponse.finalData.techStack,
        teamComposition: aiResponse.finalData.teamComposition,
        duration: aiResponse.finalData.duration
      };
      
      console.log('🚀 프로젝트 생성 데이터:', projectData);
      
      const projectResult = await createProject({
        ...projectData,
        teamComposition: {
          ...projectData.teamComposition,
          description: projectData.teamComposition.description || ''
        }
      }, session.user.id);
      
      return NextResponse.json({
        response: "프로젝트가 생성되었습니다! 🎉",
        dataToSave: {},
        isComplete: true,
        finalData: {
          ...aiResponse.finalData,
          inviteCode: projectResult.inviteCode,
          projectId: projectResult.projectId
        },
        projectCreated: true
      });
    }

    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // 에러 유형별 처리
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