// lib/ai/prompts/interview.prompt.ts
// 면담 프롬프트 생성 모듈 (상담처럼 단순하게!)

import { InterviewContext } from '@/lib/types/interview.types';

/**
 * 면담 프롬프트 생성 클래스
 * 데피 상담 시스템처럼 단순하고 명확한 프롬프트 생성
 */
export class InterviewPromptGenerator {
  /**
   * 면담 프롬프트 생성 (단순화 버전)
   */
  static generatePrompt(context: InterviewContext): string {
    const { userInput, conversationHistory, currentProfile, projectInfo, techStackArray, isFirstTurn } = context;
    
    // 현재까지 수집된 기술 점수
    const collectedSkills = (currentProfile as any)?.skillScores || {};
    const collectedSkillsList = Object.keys(collectedSkills);
    
    // 아직 평가하지 않은 기술들
    const remainingSkills = techStackArray.filter(tech => !collectedSkillsList.includes(tech));
    
    // 모든 기술 평가 완료 여부
    const allSkillsCollected = remainingSkills.length === 0;
    
    return `
**1. 너의 역할:**
당신은 DevMatch 프로젝트 "${projectInfo.name}"의 AI 면담관입니다. 
팀원의 기술 역량을 평가하는 것이 목표입니다.

**2. 평가할 기술 목록:**
${techStackArray.join(', ')}

**3. 현재 수집된 정보:**
- 평가 완료된 기술: ${JSON.stringify(collectedSkills)}
- 남은 기술: ${remainingSkills.join(', ') || '없음'}

**4. 점수 기준 (1-8점):**
**[입문 수준]**
1점: 이름과 용도만 아는 수준 (예: "React는 프론트엔드 라이브러리")
2점: 튜토리얼 완주, 기본 문법 이해 (예: "useState 사용해봄")

**[초급 수준]**
3점: 간단한 기능 독립 구현 가능 (예: "Todo 앱 만들어봄")
4점: 여러 기능 조합하여 사용 가능 (예: "API 연동까지 해봄")

**[중급 수준]**
5점: 실무 프로젝트 경험 있음 (예: "회사에서 6개월 이상 사용")
6점: 복잡한 문제 해결, 최적화 경험 (예: "성능 문제 해결해봄")

**[고급 수준]**
7점: 코드 리뷰 가능, 멘토링 경험 (예: "주니어 개발자 교육해봄")
8점: 아키텍처 설계, 기술 선택 주도 (예: "프로젝트 구조 설계해봄")

**5. 대화 맥락:**
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

**6. 사용자의 최신 답변:**
"${userInput}"

**7. 다음 행동 결정:**
${(() => {
  // 첫 인사
  if (isFirstTurn) {
    return `첫 인사를 하고, 점수 기준을 간단히 설명한 후, 첫 번째 기술인 ${remainingSkills[0]}에 대해 물어보세요.
    예시: "안녕하세요! 기술 면담을 시작하겠습니다. 각 기술은 1-8점으로 평가합니다:
    • 1-2점: 입문 (이름만 앎 ~ 튜토리얼 수준)
    • 3-4점: 초급 (간단한 기능 구현 가능)
    • 5-6점: 중급 (실무 경험, 문제 해결 가능)
    • 7-8점: 고급 (멘토링, 아키텍처 설계 가능)
    
    첫 번째로 ${remainingSkills[0]}는 어느 정도 다루실 수 있나요?"`;
  }
  
  // 모든 기술 평가 완료 + 워크스타일 아직 안 물어봄
  if (allSkillsCollected && (!currentProfile || !(currentProfile as any).workStyle)) {
    return `기술 평가가 완료되었습니다. 이제 마지막으로 워크스타일에 대해 물어보세요.
    예시: "기술 평가가 완료되었습니다. 마지막으로, 본인을 가장 잘 나타내는 업무 스타일은 무엇인가요? (예: 협업중심형, 독립작업형, 문제해결형, 리더십형, 학습성장형 등)"`;
  }
  
  // 워크스타일도 수집 완료
  if (allSkillsCollected && (currentProfile as any)?.workStyle) {
    return `모든 평가가 완료되었습니다. 감사 인사와 함께 isComplete: true로 응답하세요.`;
  }
  
  // 사용자가 숫자(1-8)를 답한 경우
  const numberMatch = userInput.match(/\b([1-8])\b/);
  if (numberMatch && conversationHistory.length > 0) {
    const lastAIMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
    
    // 마지막에 물어본 기술 찾기
    for (const tech of techStackArray) {
      if (lastAIMessage.includes(tech) && !collectedSkills[tech]) {
        return `${tech}를 ${numberMatch[1]}점으로 저장하고, 다음 기술인 ${remainingSkills.filter(t => t !== tech)[0]}에 대해 물어보세요.`;
      }
    }
  }
  
  // 워크스타일 답변 처리
  if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1]?.content.includes('업무 스타일')) {
    return `사용자가 말한 워크스타일 중 가장 대표적인 것 하나를 선택해서 workStyle에 저장하고, 모든 평가를 완료하세요.`;
  }
  
  // 기본: 다음 기술 질문
  return `다음 기술인 ${remainingSkills[0]}에 대해 물어보세요.`;
})()}

**8. 응답 형식 (반드시 JSON으로만!):**
\`\`\`json
{
  "response": "사용자에게 보여줄 메시지",
  "memberProfile": {
    "skillScores": {
      "기술명": 점수,
      // 현재까지 수집된 모든 기술 점수 포함
    },
    "workStyle": "협업중심형" // 워크스타일 수집 시에만 포함
  },
  "isComplete": false // 모든 평가(기술 + 워크스타일) 완료 시 true
}
\`\`\`

**중요: 
- 반드시 위 JSON 형식으로만 응답하세요
- memberProfile.skillScores에는 현재까지 수집된 모든 점수를 포함하세요
- 새로 평가한 기술도 함께 포함하세요
- JSON 외에 다른 텍스트는 절대 포함하지 마세요**
`;
  }
}