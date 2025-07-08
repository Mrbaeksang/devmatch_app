import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// 상담 단계 Enum
enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION',
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

// 상담 데이터 인터페이스
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
const getSystemPrompt = (currentStep: ConsultationStep, consultationData: ConsultationData): string => {
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
      if (consultationData.techStack?.length) collectedInfo.push('기술 스택');
      if (consultationData.mainFeatures?.length) collectedInfo.push('핵심 기능');
      if (consultationData.teamMembersCount) collectedInfo.push('팀원 수');

      return `${basePrompt}

현재 단계: 프로젝트 정보 수집
이미 수집된 정보: ${collectedInfo.join(', ') || '없음'}
사용자 이름: ${consultationData.userName || '미수집'}

수집 순서:
1. 프로젝트명 → 2. 프로젝트 목표 → 3. 기술 스택 → 4. 핵심 기능 → 5. 예상 팀원 수

다음 질문을 결정하고 자연스럽게 대화하세요:
- 이미 수집된 정보는 다시 묻지 마세요
- 사용자 답변에 공감하며 다음 질문으로 이어가세요
- 기술 스택이나 기능은 쉼표로 구분된 배열로 저장하세요

모든 정보가 수집되면:
- 수집된 정보를 바탕으로 현실적인 팀 구조를 제안하세요
- aiSuggestedRoles에 역할별 인원을 제안하세요
- nextStep을 "TEAM_STRUCTURE_PROPOSAL"로 설정하세요`;
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

현재 단계: 최종 확인

사용자가 긍정적으로 응답하면 (네, 좋아요, 확인, 맞아요, ㅇㅇ, 시작하기 등):
{
  "displayMessage": "완벽합니다! 🎉 프로젝트 정보가 모두 준비되었습니다. 이제 프로젝트를 생성하실 수 있어요!",
  "isConsultationComplete": true,
  "consultationData": ${JSON.stringify(consultationData)}
}

사용자가 수정을 원하면:
1. 수정하고 싶은 부분을 구체적으로 물어보세요
2. 해당 정보만 업데이트하세요
3. 수정된 요약을 다시 보여주세요
4. nextStep은 "SUMMARY_CONFIRMATION"으로 유지하세요`;

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
    const { messages, currentStep, consultationData } = await req.json();

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
    const systemPrompt = getSystemPrompt(currentStep, consultationData);

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
    } catch (error: any) {
      if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
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
        } catch (fallbackError: any) {
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