import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// 면담 단계 정의
enum InterviewStep {
  WELCOME = 'WELCOME',
  SKILL_ASSESSMENT = 'SKILL_ASSESSMENT',
  LEADERSHIP_ASSESSMENT = 'LEADERSHIP_ASSESSMENT',
  PREFERENCE_COLLECTION = 'PREFERENCE_COLLECTION',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED'
}

// 면담 데이터 타입
interface InterviewData {
  memberName?: string;
  skills?: string[];
  experience?: string;
  leadershipLevel?: 'none' | 'interested' | 'experienced' | 'preferred';
  workStyle?: string;
  communication?: string;
  motivation?: string;
  availability?: string;
  rolePreference?: string;
  additionalInfo?: string;
}

// AI 응답 인터페이스
interface AIResponse {
  displayMessage?: string;
  nextStep?: InterviewStep;
  interviewData?: InterviewData;
  isInterviewComplete?: boolean;
}

/**
 * 현재 면담 단계와 데이터에 따라 AI에게 전달할 시스템 프롬프트를 동적으로 생성합니다.
 */
const getSystemPrompt = (currentStep: InterviewStep, interviewData: InterviewData): string => {
  const basePrompt = `당신은 친근하고 전문적인 AI 면담관입니다. 팀 구성을 위한 개인 면담을 진행하고 있습니다.

중요: 반드시 JSON 형식으로만 응답하세요. 다음 형식을 엄격히 따르세요:
{
  "displayMessage": "사용자에게 보여질 메시지",
  "nextStep": "다음 단계",
  "interviewData": { 수집된 데이터 },
  "isInterviewComplete": false
}

절대로 JSON 외의 다른 텍스트를 포함하지 마세요. 코드 블록 마크다운도 사용하지 마세요.`;

  switch (currentStep) {
    case InterviewStep.WELCOME:
      return `${basePrompt}

현재 단계: 환영 인사 및 기본 정보 수집

사용자가 자기소개를 하면:
1. 친근하게 반응하고 이름을 확인하세요
2. interviewData에 memberName을 저장하세요
3. 기술 역량 평가 단계로 넘어가세요
4. nextStep을 "SKILL_ASSESSMENT"로 설정하세요

예시 응답:
{
  "displayMessage": "반갑습니다, [이름]님! 이제 기술 역량에 대해 알아보겠습니다. 어떤 기술 스택을 다루실 수 있나요? 경험 수준도 함께 말씀해주세요.",
  "nextStep": "SKILL_ASSESSMENT",
  "interviewData": {"memberName": "[사용자 이름]"}
}`;

    case InterviewStep.SKILL_ASSESSMENT:
      return `${basePrompt}

현재 단계: 기술 역량 평가
이미 수집된 정보: 이름 - ${interviewData.memberName || '미수집'}

사용자가 기술 스택과 경험을 말하면:
1. 기술 스택을 배열로 정리하고 skills 필드에 저장하세요
2. 경험 수준을 experience 필드에 저장하세요
3. 리더십 경험에 대해 질문하세요
4. nextStep을 "LEADERSHIP_ASSESSMENT"로 설정하세요

기술 스택 예시: ["React", "Node.js", "Python", "AWS"]
경험 수준 예시: "React 2년, Node.js 1년 경험"

예시 응답:
{
  "displayMessage": "좋은 기술 스택을 가지고 계시네요! 이제 리더십 경험에 대해 알아보겠습니다. 팀 프로젝트에서 리더 역할을 맡아본 적이 있나요? 없다면 향후 리더 역할에 대한 생각을 들려주세요.",
  "nextStep": "LEADERSHIP_ASSESSMENT",
  "interviewData": {
    "skills": ["React", "Node.js", "Python"],
    "experience": "React 2년, Node.js 1년 경험"
  }
}`;

    case InterviewStep.LEADERSHIP_ASSESSMENT:
      return `${basePrompt}

현재 단계: 리더십 평가
이미 수집된 정보: 이름 - ${interviewData.memberName}, 기술 - ${interviewData.skills?.join(', ')}

사용자가 리더십 경험을 말하면:
1. 리더십 레벨을 4단계로 분류하세요:
   - "none": 리더 경험 없고 관심도 없음
   - "interested": 리더 경험 없지만 관심 있음
   - "experienced": 리더 경험 있음
   - "preferred": 리더 경험 있고 선호함
2. leadershipLevel 필드에 저장하세요
3. 작업 스타일과 선호도에 대해 질문하세요
4. nextStep을 "PREFERENCE_COLLECTION"로 설정하세요

예시 응답:
{
  "displayMessage": "리더십에 대한 관점을 잘 이해했습니다. 이제 작업 스타일에 대해 알아보겠습니다. 혼자 집중해서 일하는 것을 선호하시나요, 아니면 팀원들과 협업하는 것을 선호하시나요?",
  "nextStep": "PREFERENCE_COLLECTION",
  "interviewData": {
    "leadershipLevel": "interested"
  }
}`;

    case InterviewStep.PREFERENCE_COLLECTION:
      return `${basePrompt}

현재 단계: 작업 선호도 수집
이미 수집된 정보: 이름 - ${interviewData.memberName}, 기술 - ${interviewData.skills?.join(', ')}, 리더십 - ${interviewData.leadershipLevel}

사용자가 작업 스타일을 말하면:
1. workStyle 필드에 저장하세요
2. 추가로 다음 중 하나를 질문하세요:
   - 의사소통 스타일 (communication)
   - 프로젝트 참여 동기 (motivation)
   - 시간 가용성 (availability)
   - 역할 선호도 (rolePreference)
3. 충분한 정보가 수집되면 요약 확인 단계로 넘어가세요
4. nextStep을 "SUMMARY_CONFIRMATION"로 설정하세요

예시 응답:
{
  "displayMessage": "작업 스타일을 잘 이해했습니다. 마지막으로 이 프로젝트에서 어떤 역할을 맡고 싶으신가요? 또는 특별히 피하고 싶은 역할이 있나요?",
  "nextStep": "SUMMARY_CONFIRMATION",
  "interviewData": {
    "workStyle": "팀 협업을 선호하며 소통을 중시함",
    "rolePreference": "프론트엔드 개발 선호"
  }
}`;

    case InterviewStep.SUMMARY_CONFIRMATION:
      return `${basePrompt}

현재 단계: 최종 확인
수집된 정보: ${JSON.stringify(interviewData)}

사용자가 역할 선호도를 말하면:
1. rolePreference 필드에 저장하세요
2. 지금까지 수집된 모든 정보를 요약하세요
3. 면담 완료 확인을 받으세요
4. isInterviewComplete를 true로 설정하세요

예시 응답:
{
  "displayMessage": "면담을 완료했습니다! 수집된 정보를 요약하면: ${interviewData.memberName}님은 ${interviewData.skills?.join(', ')} 기술을 다루시며, 리더십 레벨은 ${interviewData.leadershipLevel}입니다. 작업 스타일은 ${interviewData.workStyle}이고, ${interviewData.rolePreference} 역할을 선호하신다고 하셨습니다. 이 정보가 맞다면 면담을 완료하겠습니다.",
  "isInterviewComplete": true,
  "interviewData": ${JSON.stringify(interviewData)}
}`;

    default:
      return `${basePrompt}

면담을 시작하세요. 친근하게 인사하고 자기소개를 요청하세요.

예시:
{
  "displayMessage": "안녕하세요! 팀 구성을 위한 개인 면담을 시작하겠습니다. 먼저 자기소개를 간단히 해주시겠어요?",
  "nextStep": "WELCOME",
  "interviewData": {}
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
    if (!parsed.displayMessage && !parsed.isInterviewComplete) {
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
      interviewData: undefined,
    };
  }
};

export async function POST(req: Request) {
  try {
    const { messages, currentStep, interviewData } = await req.json();

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
        "X-Title": "DevMatch Interview System",
      },
    });

    // 동적 시스템 프롬프트 생성
    const systemPrompt = getSystemPrompt(currentStep, interviewData);

    // AI 응답 생성
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
      interviewData: parsedResponse.interviewData,
      isInterviewComplete: parsedResponse.isInterviewComplete || false,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Interview API Error:", error);
    
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