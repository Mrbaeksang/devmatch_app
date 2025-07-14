#!/usr/bin/env node

// 면담 프롬프트 분석 도구
// 프롬프트가 어떻게 생성되는지 시각화

const { InterviewPromptGenerator } = require('../.next/server/chunks/_lib_ai_prompts_interview_9ad988._.js');

// 테스트 케이스들
const testCases = [
  {
    name: "첫 질문 (JavaScript)",
    context: {
      projectInfo: { name: "테스트 프로젝트" },
      memberInfo: { name: "홍길동" },
      conversationHistory: [],
      userInput: "",
      currentProfile: {},
      isFirstTurn: true,
      techStackArray: ["JavaScript", "TypeScript", "React", "Node.js"]
    },
    analysis: {
      promptType: "ASK_NEXT",
      nextSkill: "JavaScript"
    }
  },
  {
    name: "점수 저장 및 다음 질문",
    context: {
      projectInfo: { name: "테스트 프로젝트" },
      memberInfo: { name: "홍길동" },
      conversationHistory: [
        { role: "ai", content: "JavaScript에 대한 당신의 역량은 어느 정도인가요?" }
      ],
      userInput: "3",
      currentProfile: {},
      isFirstTurn: false,
      techStackArray: ["JavaScript", "TypeScript", "React", "Node.js"]
    },
    analysis: {
      promptType: "SAVE_AND_ASK_NEXT",
      skillToSave: { tech: "JavaScript", score: 3 },
      nextSkill: "TypeScript"
    }
  },
  {
    name: "애매한 답변 처리",
    context: {
      projectInfo: { name: "테스트 프로젝트" },
      memberInfo: { name: "홍길동" },
      conversationHistory: [
        { role: "ai", content: "TypeScript에 대한 당신의 역량은 어느 정도인가요?" }
      ],
      userInput: "음... 그냥 조금 할 줄 알아요",
      currentProfile: { skillScores: { JavaScript: 3 } },
      isFirstTurn: false,
      techStackArray: ["JavaScript", "TypeScript", "React", "Node.js"]
    },
    analysis: {
      promptType: "CLARIFY",
      nextSkill: "TypeScript"
    }
  },
  {
    name: "모든 기술 완료 후",
    context: {
      projectInfo: { name: "테스트 프로젝트" },
      memberInfo: { name: "홍길동" },
      conversationHistory: [],
      userInput: "",
      currentProfile: { 
        skillScores: { 
          JavaScript: 3, 
          TypeScript: 2, 
          React: 5, 
          "Node.js": 4 
        } 
      },
      isFirstTurn: false,
      techStackArray: ["JavaScript", "TypeScript", "React", "Node.js"]
    },
    analysis: {
      promptType: "COMPLETE"
    }
  }
];

console.log('🔍 면담 프롬프트 분석 도구\n');
console.log('================================\n');

testCases.forEach((testCase, index) => {
  console.log(`📋 테스트 케이스 ${index + 1}: ${testCase.name}`);
  console.log('입력 상황:', {
    userInput: testCase.context.userInput || "(없음)",
    currentSkills: testCase.context.currentProfile.skillScores || {},
    promptType: testCase.analysis.promptType
  });
  
  console.log('\n생성된 프롬프트:');
  console.log('------------------------');
  
  try {
    const prompt = InterviewPromptGenerator.generatePromptByType(
      testCase.context,
      testCase.analysis
    );
    
    // 프롬프트의 주요 부분만 표시
    const lines = prompt.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('너의 역할:') || 
      line.includes('너의 할 일:') ||
      line.includes('새로 저장할 점수:') ||
      line.includes('다음으로 물어볼 기술:')
    );
    
    importantLines.forEach(line => console.log(line.trim()));
    
  } catch (error) {
    console.error('❌ 프롬프트 생성 실패:', error.message);
  }
  
  console.log('\n================================\n');
});

console.log('✅ 분석 완료');
console.log('\n핵심 개선사항:');
console.log('1. 각 상황별로 독립적인 프롬프트 생성');
console.log('2. AI에게 명확한 단일 작업 지시');
console.log('3. JSON 응답 형식을 프롬프트에 직접 포함');
console.log('4. 조건문 없이 단순한 지시사항만 전달');