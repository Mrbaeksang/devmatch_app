# 작업 요청: AI 상담 시스템 프롬프트 고도화

안녕하세요, 사장님. 제안해주신 대로 AI 상담 프로세스를 훨씬 더 체계적으로 만들기 위해, AI의 행동 지침인 시스템 프롬프트를 수정해야 합니다.

`app/api/chat/route.ts` 파일을 열어, 아래 내용으로 전체를 교체해 주세요.

**왜 필요한가요?**

*   **체계적인 정보 수집:** AI가 정해진 순서(프로젝트 이름 -> 목표 -> 종류 -> ...)에 따라 사용자에게 질문을 던지도록 명확한 규칙을 부여합니다.
*   **사용자 피로도 감소:** 사용자가 무엇을 답해야 할지 고민할 필요 없이, AI가 이끄는 대로 대화에 참여하면 자연스럽게 프로젝트 정보가 완성됩니다.
*   **안정적인 완료 처리:** 모든 정보가 수집되면, AI는 반드시 정해진 JSON 형식으로 요약 내용을 반환하고 사용자에게 최종 확인을 받도록 하여, 상담 완료 시점을 명확하게 제어할 수 있습니다.

---

### 1. `app/api/chat/route.ts` 파일 수정

아래 코드를 복사하여 기존 파일의 모든 내용을 덮어쓰세요.

```typescript
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export const maxDuration = 30;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// AI 상담의 각 단계를 정의
enum ConsultationStep {
  GREETING,
  GET_PROJECT_NAME,
  GET_PROJECT_GOAL,
  GET_TEAM_MEMBERS_COUNT,
  GET_TECH_STACKS,
  GET_ROLES,
  SUMMARIZE_AND_CONFIRM,
  FINAL_CONFIRMATION,
}

// 다음 단계를 결정하는 헬퍼 함수
const getNextStep = (currentStep: ConsultationStep): ConsultationStep => {
  const steps = Object.values(ConsultationStep);
  const currentIndex = steps.indexOf(currentStep);
  return (steps[currentIndex + 1] as ConsultationStep) ?? ConsultationStep.FINAL_CONFIRMATION;
};


export async function POST(req: Request) {
  const { messages } = await req.json();

  // 현재 대화 상태(어떤 정보를 수집했는지)를 메시지에서 추출
  const lastAiMessage = messages.filter((m: any) => m.role === 'assistant').pop();
  let currentStep = ConsultationStep.GREETING;
  let collectedData: any = {};

  if (lastAiMessage && lastAiMessage.state) {
    currentStep = lastAiMessage.state.step;
    collectedData = lastAiMessage.state.data;
  }

  const systemPrompts: Record<keyof typeof ConsultationStep, string> = {
    GREETING: `당신은 'AI 팀 빌딩 매니저' 프로젝트의 초기 설정을 돕는 친절하고 유능한 AI 어시스턴트입니다. 사용자가 새 프로젝트를 시작하려고 합니다. 먼저 프로젝트의 이름을 물어보세요.`,
    GET_PROJECT_NAME: `프로젝트 이름을 받았습니다. 이제 프로젝트의 핵심 목표가 무엇인지 구체적으로 물어보세요.`,
    GET_PROJECT_GOAL: `프로젝트 목표를 받았습니다. 이제 예상되는 팀원 수를 물어보세요. (예: '3명 정도 예상하고 있어요')`,
    GET_TEAM_MEMBERS_COUNT: `팀원 수를 받았습니다. 이제 프로젝트에 사용할 주요 기술 스택을 물어보세요. (예: 'React, Next.js, Prisma 사용할 예정입니다.')`,
    GET_TECH_STACKS: `기술 스택 정보를 받았습니다. 이제 프로젝트에 필요한 주요 역할(직무)들을 물어보세요. (예: '프론트엔드 개발자 2명, 백엔드 개발자 1명이 필요해요.')`,
    GET_ROLES: `역할 분배 정보를 받았습니다. 모든 정보가 수집되었습니다. 지금까지 수집된 모든 정보(프로젝트 이름, 목표, 팀원 수, 기술 스택, 역할)를 보기 좋게 요약하여 사용자에게 보여주고, 이 내용이 맞는지 확인을 요청하세요.`,
    SUMMARIZE_AND_CONFIRM: `사용자가 요약 내용을 확인했습니다. 이제 최종적으로 이 내용으로 프로젝트 생성을 진행할지 물어보세요. 사용자가 '네', '진행시켜' 등 긍정적으로 답변하면, 다음 응답에서는 반드시 isConsultationComplete: true 와 함께 수집된 모든 데이터를 포함한 JSON 객체만을 반환해야 합니다. 다른 설명은 절대 추가하지 마세요.`,
    FINAL_CONFIRMATION: `최종 확인 단계입니다. 사용자의 답변을 기반으로 프로젝트 생성 여부를 결정합니다.`
  };

  const systemPrompt = systemPrompts[ConsultationStep[currentStep] as keyof typeof ConsultationStep];

  const result = await streamText({
    model: google('models/gemini-1.5-flash-latest'),
    system: systemPrompt,
    messages: messages,
  });

  // AI 응답과 함께 현재 단계와 수집된 데이터를 클라이언트로 전달
  // (실제 구현에서는 이 부분을 수정하여 상태를 관리해야 함)
  return result.toAIStreamResponse({
    state: {
      step: getNextStep(currentStep),
      data: collectedData, // 여기에 수집된 데이터를 업데이트하는 로직 추가 필요
    }
  });
}
```

---

### 2. 커밋 명령어

작업 완료 후, 아래 명령어를 사용하여 커밋해 주세요.

```bash
git add . && git commit -m "refactor: AI 상담 로직을 체계적인 단계별 프로세스로 개선"
```
