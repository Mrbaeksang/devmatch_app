// lib/ai/prompts/team-analysis.prompt.ts
// 팀 분석 AI 프롬프트 생성 모듈

import { TeamAnalysisContext } from '@/lib/types/analysis.types';

/**
 * 팀 분석 프롬프트 생성 클래스
 */
export class TeamAnalysisPromptGenerator {
  /**
   * 팀 분석 프롬프트 생성
   */
  static generatePrompt(context: TeamAnalysisContext): string {
    const { project, members } = context;
    
    // 기술 스택을 배열로 변환
    const techStackArray = this.extractTechStack(project.techStack);
    
    return `
**DevMatch 팀 분석 AI**

당신은 DevMatch의 팀 분석 전문 AI입니다. 
면담이 완료된 팀원들의 데이터를 분석하여 최적의 팀 구성을 제안해야 합니다.

**1. 프로젝트 정보:**
- 이름: ${project.name}
- 목표: ${project.description}
- 팀 크기: ${project.maxMembers}명
- 필요 기술: ${techStackArray.join(', ')}
- 원래 계획된 역할 분배:
  - Frontend: ${project.roleDistribution.frontend}명
  - Backend: ${project.roleDistribution.backend}명
  - Fullstack: ${project.roleDistribution.fullstack}명

**2. 팀원 면담 결과:**
${members.map((member, index) => `
팀원 ${index + 1}: ${member.userName} (ID: ${member.userId})
- 기술 점수 (1-8점):
${Object.entries(member.skillScores).map(([skill, score]) => `  - ${skill}: ${score}점`).join('\n')}
- 워크스타일: ${member.workStyles.join(', ')}
`).join('\n')}

**3. 분석 기준:**

3-1. 역할 배정 기준:
- Frontend Developer: React, Next.js, JavaScript/TypeScript 평균 5점 이상
- Backend Developer: Java/Python, Spring/Django 등 백엔드 기술 평균 5점 이상
- Fullstack Developer: 양쪽 모두 4점 이상이면서 균형있는 실력

3-2. 팀장 추천도 계산:
- Git/GitHub 점수: 70% 가중치
- 전체 기술 평균: 30% 가중치
- 예시: Git 6점, GitHub 5점, 전체 평균 4점 → (5.5/8 × 70) + (4/8 × 30) = 63.125%

3-3. 팀 강점 분석:
- 프로젝트에 필요한 기술 커버리지
- 역할 분배의 균형
- 워크스타일 시너지

3-4. 조언 생성:
- 부족한 기술에 대한 보완 방안
- 효과적인 협업 방법
- 프로젝트 성공을 위한 구체적 제안

**4. 응답 형식 (JSON만):**
\`\`\`json
{
  "teamAnalysis": {
    "teamStrengths": [
      "구체적인 팀 강점 1",
      "구체적인 팀 강점 2", 
      "구체적인 팀 강점 3"
    ],
    "aiAdvice": [
      "실용적인 조언 1",
      "실용적인 조언 2"
    ],
    "operationRecommendations": [
      "팀 운영 방법 1",
      "팀 운영 방법 2"
    ],
    "leadershipDistribution": {
${members.map(m => `      "${m.userId}": 숫자`).join(',\n')}
    }
  },
  "memberAnalysis": [
${members.map(m => `    {
      "userId": "${m.userId}",
      "role": "Frontend/Backend/Fullstack Developer 중 하나",
      "strengths": ["개인 강점 1", "개인 강점 2"],
      "leadershipScore": 숫자
    }`).join(',\n')}
  ]
}
\`\`\`

**중요 규칙:**
- 모든 userId는 제공된 실제 ID 사용
- leadershipDistribution의 합계는 정확히 100
- 각 멤버의 leadershipScore는 leadershipDistribution과 동일한 값
- role은 기술 점수 기반으로 정확히 판단
- JSON 외 다른 텍스트 절대 금지
`;
  }
  
  /**
   * TechStackStructure에서 기술 목록 추출
   */
  private static extractTechStack(techStack: any): string[] {
    const skills: string[] = [];
    
    if (techStack.frontend) {
      if (techStack.frontend.languages) skills.push(...techStack.frontend.languages);
      if (techStack.frontend.frameworks) skills.push(...techStack.frontend.frameworks);
    }
    
    if (techStack.backend) {
      if (techStack.backend.languages) skills.push(...techStack.backend.languages);
      if (techStack.backend.frameworks) skills.push(...techStack.backend.frameworks);
    }
    
    if (techStack.database) {
      skills.push(...techStack.database);
    }
    
    if (techStack.collaboration?.git) {
      skills.push(...techStack.collaboration.git);
    }
    
    return skills;
  }
}