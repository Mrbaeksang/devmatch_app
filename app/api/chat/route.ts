import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { ConsultationData, ConsultationStep } from '@/types/chat';

// AI 응답 인터페이스
interface AIResponse {
  displayMessage?: string;
  nextStep?: ConsultationStep;
  consultationData?: ConsultationData;
  isConsultationComplete?: boolean;
}

/**
 * 현재 상담 단계와 데이터에 따라 AI에게 전달할 시스템 프롬프트를 동적으로 생성합니다.
 */
const getSystemPrompt = (currentStep: ConsultationStep, consultationData: ConsultationData, isEditMode?: boolean): string => {
  const basePrompt = `당신은 친근하고 전문적인 AI 프로젝트 매니저입니다. 사용자와 자연스러운 대화를 통해 프로젝트 정보를 수집하고 있습니다.

중요: 반드시 JSON 형식으로만 응답하세요. 다음 형식을 엄격히 따르세요:
{
  "displayMessage": "사용자에게 보여질 메시지",
  "nextStep": "다음 단계",
  "consultationData": { 수집된 데이터 },
  "isConsultationComplete": false
}

절대로 JSON 외의 다른 텍스트를 포함하지 마세요. 코드 블록 마크다운도 사용하지 마세요.`;

  switch (currentStep) {
    case ConsultationStep.NAME_COLLECTION:
      return `${basePrompt}

현재 단계: 사용자 이름 수집

사용자가 이름을 말하면:
1. 친근하게 인사하고 프로젝트 이름을 물어보세요
2. consultationData에 userName을 저장하세요
3. nextStep을 "PROJECT_INFO_COLLECTION"으로 설정하세요

예시 응답:
{
  "displayMessage": "반갑습니다, [이름]님! 이제 프로젝트에 대해 이야기해볼까요? 😊 구상 중인 프로젝트의 이름은 무엇인가요?",
  "nextStep": "PROJECT_INFO_COLLECTION",
  "consultationData": {"userName": "[사용자가 입력한 이름]"}
}`;

    case ConsultationStep.PROJECT_INFO_COLLECTION: {
      const collectedInfo = [];
      if (consultationData.userName) collectedInfo.push('사용자 이름');
      if (consultationData.projectName) collectedInfo.push('프로젝트명');
      if (consultationData.projectGoal) collectedInfo.push('프로젝트 목표');
      if (consultationData.techStack && (Array.isArray(consultationData.techStack) ? consultationData.techStack.length : consultationData.techStack)) collectedInfo.push('기술 스택');
      if (consultationData.projectDuration || consultationData.duration) collectedInfo.push('프로젝트 기간');
      if (consultationData.teamMembersCount) collectedInfo.push('팀원 수');

      return `${basePrompt}

현재 단계: 프로젝트 정보 수집 (핵심 정보만)
이미 수집된 정보: ${collectedInfo.join(', ') || '없음'}
사용자 이름: ${consultationData.userName || '미수집'}

수집 순서 (총 6가지):
1. 프로젝트명 → 2. 프로젝트 목표 → 3. 기술 스택 → 4. 프로젝트 기간 → 5. 예상 팀원 수

다음 질문을 결정하고 자연스럽게 대화하세요:
- 이미 수집된 정보는 다시 묻지 마세요
- 사용자 답변에 공감하며 다음 질문으로 이어가세요
- 기술 스택은 쉼표로 구분된 배열로 저장하세요 (techStack 필드)
- 프로젝트 기간은 duration 또는 projectDuration 필드에 저장하세요
- 팀원 수는 teamMembersCount 필드에 숫자로 저장하세요

모든 정보(6가지)가 수집되면:
- 수집된 정보를 바탕으로 AI 역할 제안을 생성하세요
- "수집된 정보를 바탕으로 최적의 팀 구조를 제안드리겠습니다!" 라고 안내하세요
- nextStep을 "ROLE_SUGGESTION"로 설정하세요
- aiSuggestedRoles 배열을 생성하여 consultationData에 추가하세요

역할 제안 생성 규칙:
- 프로젝트 복잡도와 기술 스택을 고려하여 현실적인 역할 제안
- 각 역할별 필요 인원수와 간단한 설명 포함
- 팀장 역할 포함 여부 결정
- 총 팀원 수는 사용자가 제시한 수와 비슷하게 맞춤

예시 aiSuggestedRoles 형식:
[
  {"role": "백엔드 개발자", "count": 2, "note": "Spring Boot, JPA 경험"},
  {"role": "프론트엔드 개발자", "count": 1, "note": "React 경험"},
  {"role": "팀장", "count": 1, "note": "프로젝트 관리 및 기술 리더십"}
]`;
    }

    case ConsultationStep.ROLE_SUGGESTION:
      if (isEditMode) {
        return `${basePrompt}

현재 단계: 역할 제안 수정 모드
프로젝트명: ${consultationData.projectName}
기술 스택: ${Array.isArray(consultationData.techStack) ? consultationData.techStack.join(', ') : consultationData.techStack || '미정'}
팀원 수: ${consultationData.teamMembersCount}명

사용자가 역할 구조 수정을 요청했습니다. 사용자의 피드백을 분석하고:

1. 구체적인 수정 요청 사항을 파악하세요
2. aiSuggestedRoles 배열을 사용자 요구사항에 맞게 수정하세요
3. 수정된 역할 구조에 대해 간단히 설명하세요
4. nextStep을 "ROLE_SUGGESTION"로 설정하세요
5. 수정된 aiSuggestedRoles를 consultationData에 포함하세요

수정 예시:
- "백엔드 개발자 2명으로 줄이고 싶어요" → count 값 수정
- "팀장 역할 따로 안 두고 싶어요" → 팀장 역할 제거
- "프론트엔드 개발자 추가해주세요" → 새로운 역할 추가

응답 형식:
{
  "displayMessage": "요청사항을 반영하여 역할 구조를 수정했습니다. 다음과 같이 조정했습니다...",
  "nextStep": "ROLE_SUGGESTION",
  "consultationData": {
    "aiSuggestedRoles": [수정된 역할 배열]
  }
}`;
      } else {
        return `${basePrompt}

현재 단계: 역할 제안 생성
프로젝트명: ${consultationData.projectName}
기술 스택: ${Array.isArray(consultationData.techStack) ? consultationData.techStack.join(', ') : consultationData.techStack || '미정'}
팀원 수: ${consultationData.teamMembersCount}명

이제 수집된 정보를 바탕으로 최적의 팀 구조를 제안해주세요.

역할 제안 생성 규칙:
- 프로젝트 복잡도와 기술 스택을 고려하여 현실적인 역할 제안
- 각 역할별 필요 인원수와 간단한 설명 포함
- 팀장 역할 포함 여부 결정
- 총 팀원 수는 사용자가 제시한 수와 비슷하게 맞춤

응답 형식:
{
  "displayMessage": "수집된 정보를 바탕으로 최적의 팀 구조를 제안드리겠습니다! 다음과 같은 역할 구성을 추천합니다...",
  "nextStep": "ROLE_SUGGESTION",
  "consultationData": {
    "aiSuggestedRoles": [
      {"role": "역할명", "count": 인원수, "note": "설명"},
      ...
    ]
  }
}`;
      }

    case ConsultationStep.TEAM_STRUCTURE_PROPOSAL:
      return `${basePrompt}

현재 단계: 팀 구조 제안 피드백 수집
프로젝트명: ${consultationData.projectName}
팀원 수: ${consultationData.teamMembersCount}명

사용자가 팀 구조에 동의하면:
1. 지금까지 수집된 모든 정보를 자연스럽게 요약하세요
2. "이 설문은 초기 기획 청사진이며, 팀원 최종 선발 후 확정되니 걱정마세요!" 문구를 포함하세요
3. 최종 확인을 요청하세요
4. nextStep을 "SUMMARY_CONFIRMATION"으로 설정하세요

사용자가 수정을 원하면:
1. 피드백을 반영하여 팀 구조를 수정하세요
2. aiSuggestedRoles를 업데이트하세요
3. nextStep은 "TEAM_STRUCTURE_PROPOSAL"로 유지하세요`;

    case ConsultationStep.SUMMARY_CONFIRMATION:
      return `${basePrompt}

현재 단계: 최종 확인 (역할 제안 승인 후)

사용자가 역할 제안을 승인했습니다. 최종 상담 완료 처리를 해주세요:

{
  "displayMessage": "완벽합니다! 🎉 프로젝트 정보와 역할 구조가 모두 준비되었습니다. 이제 프로젝트를 생성하실 수 있어요!",
  "isConsultationComplete": true,
  "consultationData": ${JSON.stringify(consultationData)}
}

참고사항:
- 모든 프로젝트 정보와 AI 역할 제안이 포함되어 있습니다
- 사용자가 승인한 역할 구조로 팀 빌딩이 진행됩니다
- 다음 단계는 프로젝트 생성 및 팀원 모집입니다`;

    default:
      return `${basePrompt}

초기 상담을 시작하세요. 친근하게 인사하고 사용자의 이름이나 호칭을 물어보세요.

예시:
{
  "displayMessage": "👋 안녕하세요! AI 프로젝트 매니저입니다. 새로운 프로젝트를 함께 준비해봐요! 먼저 제가 뭐라고 불러드리면 될까요?",
  "nextStep": "NAME_COLLECTION",
  "consultationData": {}
}`;
  }
};

/**
 * AI 응답에서 JSON을 안전하게 파싱하는 함수
 */
const parseAIResponse = (content: string): AIResponse => {
  try {
    // JSON 블록 추출 시도
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSON 형식을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    // 필수 필드 검증
    if (!parsed.displayMessage && !parsed.isConsultationComplete) {
      throw new Error('유효하지 않은 응답 형식');
    }

    return parsed;
  } catch (error) {
    console.error('AI 응답 파싱 오류:', error);
    console.error('원본 응답:', content);
    
    // 파싱 실패 시 기본 응답 반환
    return {
      displayMessage: "죄송합니다. 잠시 문제가 발생했습니다. 다시 한 번 말씀해주시겠어요?",
      nextStep: undefined,
      consultationData: undefined,
    };
  }
};

export async function POST(req: Request) {
  try {
    const { messages, currentStep, consultationData, isEditMode } = await req.json();

    // API 키 확인
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set");
      return NextResponse.json(
        { error: "API 설정 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // OpenRouter 클라이언트 생성
    const openrouter = createOpenRouter({
      apiKey,
      headers: {
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "DevMatch AI Consultation",
      },
    });

    // 동적 시스템 프롬프트 생성
    const systemPrompt = getSystemPrompt(currentStep, consultationData, isEditMode);

    // AI 응답 생성 (fallback 모델 지원)
    let text: string;
    
    try {
      // 1차 시도: DeepSeek Chat (메인 모델)
      const result = await generateText({
        model: openrouter('deepseek/deepseek-chat-v3-0324:free'),
        system: systemPrompt,
        messages: messages,
        temperature: 0.7,
        maxTokens: 1000,
      });
      text = result.text;
    } catch (error: unknown) {
      if (error instanceof Error && (error.message?.includes('rate limit') || error.message?.includes('Rate limit'))) {
        // 2차 시도: DeepSeek R1 (보조 모델)
        try {
          const fallbackResult = await generateText({
            model: openrouter('deepseek/deepseek-r1-0528:free'),
            system: systemPrompt,
            messages: messages,
            temperature: 0.7,
            maxTokens: 1000,
          });
          text = fallbackResult.text;
        } catch {
          // 3차 시도: 에러 메시지
          throw new Error('AI 서비스가 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        throw error;
      }
    }

    // AI 응답 파싱
    const parsedResponse = parseAIResponse(text);

    // 클라이언트에 전송할 응답 구성
    const response = {
      message: parsedResponse.displayMessage || "응답을 처리하는 중 문제가 발생했습니다.",
      nextStep: parsedResponse.nextStep || currentStep,
      consultationData: parsedResponse.consultationData,
      isConsultationComplete: parsedResponse.isConsultationComplete || false,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // 상세한 에러 메시지 반환
    let errorMessage = "서버 오류가 발생했습니다.";
    
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorMessage = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message.includes('API key')) {
        errorMessage = "API 인증 오류가 발생했습니다.";
      } else if (error.message.includes('network')) {
        errorMessage = "네트워크 연결을 확인해주세요.";
      } else {
        errorMessage = `오류: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}