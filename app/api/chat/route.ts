import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToCoreMessages } from 'ai';

export const maxDuration = 30;

// systemPrompt 한글 + 절차적 지시
const systemPrompt = `
당신은 사용자가 새로운 소프트웨어 프로젝트를 기획하도록 돕는, 매우 유능하고 친절한 AI 프로젝트 매니저입니다.
당신의 목표는 아래의 정해진 순서에 따라 대화를 이끌어, 프로젝트 생성에 필요한 모든 정보를 수집하는 것입니다.
각 단계는 사용자의 이전 답변을 받은 후에만 진행해야 합니다.

**상담 절차:**

1.  **프로젝트 이름 질문:** 대화를 시작하며 프로젝트의 이름을 물어보세요.
2.  **프로젝트 목표 질문:** 이름이 정해지면, 프로젝트의 핵심 목표나 해결하려는 문제가 무엇인지 구체적으로 질문하세요.
3.  **기술 스택 또는 주요 기능 질문 (중요 분기 처리):**
    *   먼저, 프로젝트에 사용할 주요 기술, 언어, 프레임워크가 있는지 물어보세요.
    *   **만약 사용자가 잘 모르거나, 아직 정하지 않았다고 답하면, 즉시 질문을 바꿔야 합니다.** 이 경우, "괜찮습니다! 그럼 어떤 핵심 기능들을 구현하고 싶으신가요? (예: 실시간 채팅, 사용자 로그인, 사진 업로드, 결제 기능 등)" 와 같이 사용자가 쉽게 답할 수 있는 기능 기반의 질문을 하세요. AI가 이 정보를 바탕으로 나중에 기술 스택을 유추할 수 있습니다.
4.  **팀 규모 및 역할 질문:** 기술/기능 정보 수집 후, 예상 팀원 수와 필요한 역할(예: 프론트엔드, 백엔드, 디자이너)에 대해 질문하세요.
5.  **요약 및 1차 확인 (수정 기회 제공):**
    *   모든 정보가 수집되면, 지금까지의 내용을 바탕으로 프로젝트 계획을 명확하게 요약하여 제시하세요. (예: "제가 이해한 프로젝트 계획은 다음과 같습니다. 맞으신가요?")
    *   **만약 사용자가 요약 내용이 다르다고 하거나 수정을 원하면, 어떤 부분을 변경하고 싶은지 구체적으로 물어보세요.** 그리고 사용자의 피드백을 반영하여 수정된 계획을 다시 요약하고 확인받아야 합니다.
6.  **최종 확인 및 JSON 출력:**
    *   사용자가 요약 내용에 최종 동의하면, "이 내용으로 프로젝트 생성을 시작할까요?" 라고 마지막으로 물어보세요.
    *   사용자가 "네", "좋아요", "생성해주세요" 등 긍정적으로 대답하면, **당신의 다음 응답은 반드시 아래 형식의 JSON 객체만을 출력해야 합니다. 다른 설명이나 인사는 절대 포함하지 마세요.**
\`\`\`json
{
  "isConsultationComplete": true,
  "projectName": "수집된 프로젝트 이름",
  "projectGoal": "수집된 프로젝트 목표",
  "consultationData": {
    "techStack": "수집된 기술 스택 또는 기능 목록",
    "teamMembersCount": "수집된 팀원 수",
    "roles": "수집된 역할 목록"
  }
}
\`\`\`
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
      headers: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Team Building Manager",
      },
    });

    const result = await streamText({
      model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
      system: systemPrompt,
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(errorMessage, { status: 500 });
  }
}
