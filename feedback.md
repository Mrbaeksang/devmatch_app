# Interview API 루트 로직 설명

## 🎯 **최종 목표 데이터**
```typescript
memberProfile: {
  skills: string[],        // ["React", "Node.js", "Python"]
  experience: string,      // "React 2년, 백엔드 1년 경험"
  strengths: string[],     // ["빠른 학습력", "문제 해결"]
  workStyle: string,       // "협업 선호, 소통 중시"
  motivation: string,      // "새로운 기술 습득 및 팀워크 경험"
  availability: string,    // "주중 저녁 7-11시, 주말 자유"
  concerns: string[]       // ["첫 프로젝트라 걱정", "시간 부족"]
}
```

## 🔄 **면담 진행 과정**

### **1단계: 프로젝트 연관 동기 파악**
```
AI: "안녕하세요! [프로젝트명] 프로젝트 면담을 시작하겠습니다. 
     이 프로젝트에 지원하신 이유나 관심사를 말씀해주세요!"

User: "React 배우고 싶어서 지원했어요"
→ motivation 수집
```

### **2단계: 기술 역량 구체화**
```
AI: "React에 관심이 있으시군요! 현재 어떤 기술들을 다루실 수 있나요? 
     경험 수준도 함께 말씀해주세요."

User: "JavaScript 1년, HTML/CSS는 잘해요. React는 아직 초보예요"
→ skills: ["JavaScript", "HTML", "CSS", "React"]
→ experience: "JavaScript 1년, React 초급"
```

### **3단계: 강점과 업무 스타일**
```
AI: "좋네요! 본인의 강점이나 특기가 있다면 말씀해주세요."

User: "문제 해결을 좋아하고 새로운 것 배우는 게 빨라요"
→ strengths: ["문제 해결", "빠른 학습"]

AI: "혼자 작업하시는 걸 선호하시나요, 팀원들과 협업하는 걸 선호하시나요?"

User: "팀원들과 소통하면서 하는 게 좋아요"
→ workStyle: "협업 선호, 소통 중시"
```

### **4단계: 실질적 가용성**
```
AI: "프로젝트에 얼마나 시간을 투입하실 수 있나요?"

User: "평일 저녁이랑 주말에 시간 있어요"
→ availability: "주중 저녁, 주말 가능"
```

### **5단계: 우려사항 해소**
```
AI: "마지막으로 프로젝트 진행하면서 걱정되는 부분이나 궁금한 점이 있나요?"

User: "첫 팀 프로젝트라서 실수할까봐 걱정이에요"
→ concerns: ["첫 프로젝트 경험 부족"]
```

## ⚙️ **기술적 처리 로직**

### **API 호출 구조:**
```typescript
POST /api/interview
{
  userInput: "사용자 답변",
  projectId: "프로젝트 ID", 
  memberId: "팀원 ID",
  chatHistory: [이전 대화들],
  memberProfile: {현재까지 수집된 정보}
}
```

### **AI 프롬프트 전략:**
1. **프로젝트 정보 주입**: 해당 프로젝트의 이름, 목표, 기술스택을 AI에게 알려줌
2. **점진적 정보 수집**: 한 번에 모든 걸 묻지 않고 자연스러운 대화로 단계별 수집
3. **맥락 유지**: 이전 대화 내용을 계속 참조하여 일관성 있는 면담 진행

### **완료 처리:**
```typescript
// AI가 충분한 정보를 수집했다고 판단하면
if (aiResponse.isComplete && aiResponse.memberProfile) {
  // 1. DB 업데이트
  await db.projectMember.update({
    where: { id: memberId },
    data: {
      memberProfile: aiResponse.memberProfile,
      interviewStatus: 'COMPLETED'  // 면담 완료 상태로 변경
    }
  });
  
  // 2. 팀 분석 트리거 (모든 팀원 면담 완료 시)
}
```

## 🎯 **핵심 포인트**
- **프로젝트별 맞춤**: 각 프로젝트의 기술스택과 목표에 맞는 질문
- **자연스러운 대화**: 딱딱한 설문이 아닌 친근한 면담 분위기  
- **점진적 수집**: 사용자 답변에 따라 다음 질문을 동적으로 결정
- **실시간 저장**: 대화 중 수집된 정보를 즉시 저장하여 중단되어도 복구 가능

---

## 📝 **피드백 정리**
**기존 문제점:**
- chat/route.ts의 효율적인 방식(역할, 목표, 원칙 명확 정의) 부재
- 대화 흐름 시나리오 없음
- 프로젝트 청사진 정보 활용 안함
- 쓸데없는 정보 수집 (년수 경험 등 주관적 지표)
- 객관적 기술 점수 시스템 부재

**개선 방향:**
- 프로젝트 청사진 기반 맞춤형 질문
- 기술스택별 1~5점 객관적 평가 시스템
- 단순화된 최종 수집 정보: 기술스택 점수 + 워크스타일
- chat/route.ts 스타일의 체계적 프롬프트 구조

---

## 🔄 **개선된 면담 시스템 설계 (chat/route.ts 스타일)**

### **1. 최종 목표 데이터 (간소화)**
```typescript
memberProfile: {
  skillScores: {
    [techStack]: number  // 1~5점 객관적 평가
  },
  workStyle: string      // 단일 워크스타일
}

// 예시:
{
  skillScores: {
    "React": 3,
    "Node.js": 2, 
    "TypeScript": 4
  },
  workStyle: "협업형 리더"
}
```

### **2. 기술 점수 기준표**
```
5점: 실무 프로젝트 다수 경험, 다른 사람에게 가르칠 수 있는 수준
4점: 실무 프로젝트 경험 있음, 독립적으로 개발 가능
3점: 기본기 탄탄, 간단한 기능 구현 가능
2점: 문법과 개념 이해, 튜토리얼 따라하기 가능
1점: 들어본 적 있거나 방금 시작한 수준
```

### **3. 개선된 데피 스타일 면담 시스템 프롬프트**

```javascript
const createInterviewPrompt = (projectData, memberInfo, collectedData, conversationHistory, userInput) => {
  const isFirstTurn = !conversationHistory || conversationHistory.length === 0;
  
  return `
**1. 너의 역할 (Persona & Goal):**
당신은 DevMatch의 AI 면담관 **인터뷰어(Interviewer)**입니다. ${memberInfo.nickname}님과의 면담을 통해 **"${projectData.name}" 프로젝트의 성공적인 역할분배를 위한 정보**를 수집하는 것이 목표입니다. 

이미 프로젝트 개요는 정해져 있고, 각 팀원의 개별 면담을 통해 최종 역할분배를 진행할 예정입니다. 이 과정이 바로 그 역할분배를 위한 정보 수집 단계입니다.

**2. 최종 목표 (The Final Output):**
면담 완료 시 아래 JSON 구조를 완벽하게 채워야 합니다:

{
  skillScores: {
    // AI가 판단하기에 이 프로젝트에 필요한 기술들 (최소 1개)
    "기술명": 숫자(1~5점)
  },
  workStyles: [
    // AI가 판단하기에 이 사람의 업무 스타일들 (최소 2개)
    "워크스타일1", "워크스타일2"
  ]
}

**3. 프로젝트 정보 (실제 DB 구조 기반):**
- 프로젝트 ID: ${project.id}
- 프로젝트명: ${project.name}
- 목표: ${project.goal}
- 기본 기술스택: ${project.techStack?.join(', ') || '미정'}
- 상담 데이터: ${JSON.stringify(project.consultationData)}
  - 총 팀원수: ${project.consultationData?.teamSize}명
  - 예상 기간: ${project.consultationData.duration}
  - 팀장 유무: ${project.consultationData?.teamComposition?.hasTeamLead || false}

**4. 기술 평가 기준 (반드시 사용자에게 설명):**
- 5점: 실무 다수 경험, 다른 사람에게 가르칠 수 있는 수준
- 4점: 실무 프로젝트 경험, 독립적으로 개발 가능
- 3점: 기본기 탄탄, 간단한 기능 구현 가능
- 2점: 문법과 개념 이해, 튜토리얼 따라하기 가능
- 1점: 들어본 적 있거나 방금 시작한 수준

**5. 워크스타일 분류:**
["개인집중형", "협업소통형", "문제해결형", "체계관리형", "창의주도형", "리더십형", "서포트형", "학습지향형"]

**6. 대화 원칙:**
- **목적 명시**: 역할분배를 위한 정보 수집임을 사용자에게 알려주세요
- **지능적 판단**: 청사진 기술스택에 얽매이지 말고, 프로젝트에 필요하다고 판단되는 기술을 AI가 스스로 선별하여 질문
- **최소 수집 기준**: 기술스택 최소 1개, 워크스타일 최소 2개
- **완료 조건**: 더 이상 이 프로젝트에 필요해 보이는 기술이 없을 때

**7. 대화 흐름 시나리오:**
${isFirstTurn ? `
**첫 인사:** "안녕하세요 ${memberInfo.nickname || memberInfo.name}님! **${project.name}** 프로젝트의 성공적인 협업을 위해 팀원들의 정보를 취합하는 간단한 설문을 시작하겠습니다. 

이는 최종 역할분배를 위한 과정이니 편안하게 답변해주세요! 먼저 이 프로젝트와 관련하여 어떤 기술들을 다루실 수 있는지 알아보겠습니다."
` : `
**진행 중:** 현재까지 수집된 정보를 보고 AI가 판단하기에 추가로 필요한 기술이나 워크스타일을 질문하세요.
`}

**8. 현재 상황:**
- 이미 수집된 데이터: ${JSON.stringify(collectedData)}
- 사용자 입력: "${userInput}"
- 대화 기록: ${JSON.stringify(conversationHistory)}

**9. 응답 형식 (JSON):**
// 면담 진행 중
{
  "response": "친근하고 목적이 명확한 질문",
  "dataToSave": { "새로_수집된_정보": "값" },
  "isComplete": false
}

// 면담 완료 시
{
  "response": "면담 완료! 수집된 정보로 최적의 역할분배를 진행하겠습니다.",
  "dataToSave": {},
  "isComplete": true,
  "finalData": {
    "skillScores": { "React": 4, "Node.js": 3, "AWS": 2 },
    "workStyles": ["협업소통형", "문제해결형"]
  }
}

**10. 다음 AI로 넘길 데이터 (실제 구조):**
**불변값 (프로젝트 기본 정보):**
- projectId: ${project.id}
- projectName: ${project.name}
- goal: ${project.goal}
- totalMembers: ${project.consultationData?.teamSize}
- duration: ${project.consultationData.duration}
- hasTeamLead: ${project.consultationData?.teamComposition?.hasTeamLead}
- originalTechStack: ${project.techStack}

**가변값 (이번 AI 결과 - DB의 memberProfile에 저장):**
- skillScores: { 수집된 기술별 점수 }
- workStyles: [ 수집된 워크스타일들 ]
`;
};
```

### **4. 개선된 면담 예시 시나리오:**
```
AI: "안녕하세요 김개발님! **카페 메뉴 관리 시스템** 프로젝트의 성공적인 협업을 위해 
     팀원들의 정보를 취합하는 간단한 설문을 시작하겠습니다.
     
     이는 최종 역할분배를 위한 과정이니 편안하게 답변해주세요! 
     먼저 이 프로젝트와 관련하여 어떤 기술들을 다루실 수 있는지 알아보겠습니다."

User: "React랑 Node.js 조금 할 수 있어요"

AI: "좋습니다! React 실력을 1~5점으로 평가해볼게요.
     5점(실무 다수), 4점(독립 개발), 3점(기본 기능), 2점(튜토리얼), 1점(초보)
     어느 정도 수준이신가요?"

User: "3점 정도요"
→ dataToSave: { "skillScores": { "React": 3 } }

AI: "Node.js는 어떠세요?"

User: "2점 정도? 아직 배우는 중이에요"
→ dataToSave: { "skillScores": { "React": 3, "Node.js": 2 } }

AI: "데이터베이스는 다뤄보신 적 있나요? 이 프로젝트에는 MySQL이나 MongoDB가 필요할 것 같은데요"

User: "MySQL 조금 할 수 있어요"
→ dataToSave: { "skillScores": { "React": 3, "Node.js": 2, "MySQL": 2 } }

AI: "업무 스타일에 대해 알아보겠습니다. 
     혼자 집중해서 작업하는 것과 팀원들과 소통하며 하는 것 중 어느 쪽을 선호하시나요?"

User: "팀원들과 소통하는 걸 좋아해요"
→ dataToSave: { "workStyles": ["협업소통형"] }

AI: "문제가 생겼을 때 어떻게 접근하시나요?"

User: "차근차근 분석해서 해결하려고 해요"
→ finalData: { 
    "skillScores": { "React": 3, "Node.js": 2, "MySQL": 2 },
    "workStyles": ["협업소통형", "문제해결형"]
  }

AI: "면담 완료! 수집된 정보로 최적의 역할분배를 진행하겠습니다."
```

### **5. 실제 데이터 흐름:**
```
Chat AI → Project Creation → Interview AI → Team Analysis AI

불변값: projectId, name, description, totalMembers, duration, hasTeamLead
가변값: 각 팀원별 { skillScores, workStyles }
```

