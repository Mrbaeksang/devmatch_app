# 🔧 AI 상담 백엔드 수정

## 📁 수정할 파일: `app/api/chat/route.ts`

아래 코드를 **전체 복사해서** 기존 파일에 **완전히 덮어쓰기** 하세요:

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { convertToCoreMessages, streamText } from 'ai';

export const maxDuration = 30;

// 클라이언트와 동일한 상담 단계 Enum
enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION',
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

// 클라이언트와 동일한 상담 데이터 인터페이스
interface ConsultationData {
  userName?: string;
  projectName?: string;
  projectGoal?: string;
  techStack?: string[];
  mainFeatures?: string[];
  communicationSkills?: string[];
  teamMembersCount?: number;
  aiSuggestedRoles?: Array<{ role: string; count: number; note?: string }>;
}

/**
 * 현재 상담 단계와 데이터에 따라 AI에게 전달할 시스템 프롬프트를 동적으로 생성합니다.
 */
const getSystemPrompt = (currentStep: ConsultationStep, consultationData: ConsultationData): string => {
  const basePrompt = `당신은 사용자의 프로젝트 기획을 돕는 AI 프로젝트 매니저입니다. 당신의 유일한 임무는 다음 지시에 따라 엄격한 JSON 형식으로만 응답하는 것입니다. 절대로, 어떤 상황에서도 JSON 객체 외의 설명, 인사, 사과, 줄바꿈, 코드 블록 마크다운(\`\`\`json) 등을 포함해서는 안 됩니다. 오직 순수한 JSON 객체만 출력해야 합니다.`;

  switch (currentStep) {
    case ConsultationStep.NAME_COLLECTION: {
      return `${basePrompt}
      사용자의 이름이나 호칭을 물어보는 질문을 'displayMessage'에 담고, 다음 단계를 'PROJECT_INFO_COLLECTION'으로 설정하여 JSON으로 응답하세요. 사용자가 이름을 알려주면, 그 이름을 'userName'으로 저장하고 다음 질문(프로젝트 이름)을 던지세요.
      - 예시: {"displayMessage": "반갑습니다, [사용자 이름]님! 이제 프로젝트에 대해 이야기해볼까요? 구상 중인 프로젝트 이름이 무엇인가요?", "nextStep": "PROJECT_INFO_COLLECTION", "consultationData": {"userName": "[사용자 이름]"}}`;
    }

    case ConsultationStep.PROJECT_INFO_COLLECTION: {
      let nextQuestion = '';
      if (!consultationData.projectName) {
        nextQuestion = '구상 중인 프로젝트 이름이 무엇인가요?';
      } else if (!consultationData.projectGoal) {
        nextQuestion = `좋은 이름이네요! '${consultationData.projectName}' 프로젝트의 핵심 목표는 무엇인가요?`;
      } else if (!consultationData.techStack || consultationData.techStack.length === 0) {
        nextQuestion = '프로젝트에 사용할 주요 기술 스택은 무엇인가요? (예: React, Next.js, Python, Django)';
      } else if (!consultationData.mainFeatures || consultationData.mainFeatures.length === 0) {
        nextQuestion = '해당 프로젝트의 핵심 기능들은 무엇이 있을까요? 2~3가지 정도 알려주세요.';
      } else if (!consultationData.teamMembersCount) {
        nextQuestion = '예상되는 팀원 수는 몇 명인가요?';
      } else {
        // 모든 정보 수집 완료, 다음 단계로 전환
        return `${basePrompt}
        모든 프로젝트 정보 수집이 완료되었습니다. 수집된 정보를 바탕으로 현실적인 팀 역할 구조를 제안하는 메시지를 'displayMessage'에 담아주세요. 역할, 인원수, 겸직 여부 등을 구체적으로 제안하세요. 다음 단계를 'TEAM_STRUCTURE_PROPOSAL'로 설정하고, AI가 제안한 역할 구조('aiSuggestedRoles')를 'consultationData'에 추가하여 JSON으로 응답하세요.`;
      }
      return `${basePrompt}
      현재 프로젝트 정보를 수집하는 중입니다. 사용자에게 다음 질문("${nextQuestion}")을 던지고, 사용자의 답변을 바탕으로 'consultationData'를 업데이트하여 JSON으로 응답하세요. 'nextStep'은 'PROJECT_INFO_COLLECTION'으로 유지하세요.`;
    }

    case ConsultationStep.TEAM_STRUCTURE_PROPOSAL: {
      return `${basePrompt}
      팀 구조 제안에 대한 사용자의 피드백을 반영하세요. 사용자가 동의하면, 지금까지 수집된 모든 정보를 자연스러운 문장으로 요약하여 최종 확인을 요청하는 메시지를 'displayMessage'에 담으세요. "이 설문은 초기 기획 청사진이며, 팀원 최종 선발 후 확정되니 걱정마세요!" 라는 문구를 반드시 포함하세요. 다음 단계를 'SUMMARY_CONFIRMATION'으로 설정하여 JSON으로 응답하세요.`;
    }

    case ConsultationStep.SUMMARY_CONFIRMATION: {
      return `${basePrompt}
      사용자의 응답을 분석하세요.
      - 만약 사용자가 "네", "좋아요", "확인", "맞아요", "ㅇㅇ", "시작하기" 등 긍정적인 답변을 하면, 'isConsultationComplete'를 true로 설정하고, 현재까지 수집된 모든 데이터를 포함하는 최종 JSON 객체를 생성하세요. 이 JSON에는 'displayMessage'를 포함하지 마세요.
      - 만약 사용자가 수정/보완을 원하면, 해당 부분을 재질문하고 반영하여 수정된 요약본을 'displayMessage'에 담아 다시 확인을 요청하세요. 'nextStep'은 'SUMMARY_CONFIRMATION'으로 유지하세요.`;
    }

    default: {
      return `${basePrompt}
      상담을 시작하는 단계입니다. 사용자에게 이름이나 호칭을 물어보는 질문을 'displayMessage'에 담고, 다음 단계를 'NAME_COLLECTION'으로 설정하여 JSON으로 응답하세요.
      - 예시: {"displayMessage": "안녕하세요! 새로운 프로젝트 기획을 도와드릴 AI 매니저입니다. 시작하기에 앞서, 제가 뭐라고 불러드리면 될까요?", "nextStep": "NAME_COLLECTION", "consultationData": {}}`;
    }
  }
};

export async function POST(req: Request) {
  try {
    // 클라이언트로부터 현재 단계와 데이터를 받음
    const { messages, currentStep, consultationData } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not set in environment variables");
    }

    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Team Building Manager",
      },
    });

    // 동적으로 생성된 시스템 프롬프트를 사용
    const dynamicSystemPrompt = getSystemPrompt(currentStep, consultationData);

    const result = await streamText({
      model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
      system: dynamicSystemPrompt,
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## 🎯 이 수정으로 얻는 효과:

1. **상담 완료 조건 개선**: "ㅇㅇ", "시작하기" 등 다양한 긍정 표현 인식
2. **단계별 진행 강화**: 각 단계에서 필요한 정보만 수집하도록 명확히 제어
3. **JSON 형식 엄격 제어**: AI가 순수 JSON만 출력하도록 강력히 지시
4. **상담 완료 시점 명확화**: 모든 정보 수집 후 사용자 확인 시 완료 처리
5. **에러 처리 개선**: 더 명확한 에러 메시지와 응답 처리

## 📝 Git 명령어:
```bash
git add . && git commit -m "AI 상담 백엔드 로직 개선 및 상담 완료 조건 수정" && git push
```