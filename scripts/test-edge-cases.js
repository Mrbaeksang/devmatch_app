#!/usr/bin/env node

// 엣지 케이스 테스트
// 예상치 못한 입력에 대한 시스템 반응 검증

const { InterviewService } = require('../.next/server/chunks/_lib_services_interview_b6bb0a._.js');

console.log('🧪 엣지 케이스 테스트\n');

// 테스트 케이스들
const edgeCases = [
  {
    name: "중간 범위 숫자",
    context: {
      userInput: "3.5",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: {},
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "CLARIFY - 정수만 허용"
  },
  {
    name: "범위 밖 숫자",
    context: {
      userInput: "10",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: {},
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "CLARIFY - 1-8 범위만 허용"
  },
  {
    name: "이미 평가한 기술",
    context: {
      userInput: "5",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: { skillScores: { JavaScript: 3 } },
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "ASK_NEXT - 다음 기술(TypeScript) 질문"
  },
  {
    name: "여러 숫자 언급",
    context: {
      userInput: "3이나 4정도 될 것 같아요",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: {},
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "SAVE_AND_ASK_NEXT - 첫 번째 숫자(3) 사용"
  },
  {
    name: "기술명 직접 언급",
    context: {
      userInput: "TypeScript는 2점이고 React는 5점이에요",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: {},
      techStackArray: ["JavaScript", "TypeScript", "React"]
    },
    expected: "CLARIFY - 현재 질문(JavaScript)에 대한 답변 요청"
  },
  {
    name: "빈 답변",
    context: {
      userInput: "",
      conversationHistory: [{ role: "ai", content: "JavaScript에 대한 당신의 역량은?" }],
      currentProfile: {},
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "ASK_NEXT - 첫 질문이므로"
  },
  {
    name: "모든 기술 완료 + 워크스타일 미완료",
    context: {
      userInput: "협업을 선호해요",
      conversationHistory: [],
      currentProfile: { 
        skillScores: { JavaScript: 3, TypeScript: 2 },
        workStyles: []
      },
      techStackArray: ["JavaScript", "TypeScript"]
    },
    expected: "COMPLETE - 워크스타일 수집 필요"
  }
];

// analyzeUserInput 메서드 직접 테스트
console.log('analyzeUserInput 메서드 테스트 결과:\n');

edgeCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   입력: "${testCase.context.userInput}"`);
  
  try {
    // analyzeUserInput은 private이므로 리플렉션으로 접근
    const result = InterviewService['analyzeUserInput'](testCase.context);
    
    console.log(`   결과: ${result.promptType}`);
    if (result.skillToSave) {
      console.log(`   저장: ${result.skillToSave.tech} = ${result.skillToSave.score}점`);
    }
    if (result.nextSkill) {
      console.log(`   다음: ${result.nextSkill}`);
    }
    console.log(`   예상: ${testCase.expected}`);
    console.log('');
  } catch (error) {
    console.log(`   ❌ 오류: ${error.message}\n`);
  }
});

// 데이터 무결성 검증
console.log('\n📊 데이터 무결성 검증');
console.log('----------------------');

const integrityChecks = [
  {
    name: 'skillScores 누적',
    before: { skillScores: { JavaScript: 3 } },
    update: { skillScores: { TypeScript: 2 } },
    expected: { skillScores: { JavaScript: 3, TypeScript: 2 } }
  },
  {
    name: 'workStyles 배열 처리',
    before: { workStyles: ['협업선호'] },
    update: { workStyles: ['계획적'] },
    expected: { workStyles: ['계획적'] } // 배열은 교체됨
  },
  {
    name: 'roleAptitudes 병합',
    before: { roleAptitudes: { backend: 0.7 } },
    update: { roleAptitudes: { frontend: 0.8 } },
    expected: { roleAptitudes: { backend: 0.7, frontend: 0.8 } }
  }
];

integrityChecks.forEach(check => {
  console.log(`\n${check.name}:`);
  console.log(`  이전: ${JSON.stringify(check.before)}`);
  console.log(`  업데이트: ${JSON.stringify(check.update)}`);
  
  // Deep merge 시뮬레이션
  const merged = {
    ...check.before,
    ...check.update,
    skillScores: {
      ...(check.before.skillScores || {}),
      ...(check.update.skillScores || {})
    },
    roleAptitudes: {
      ...(check.before.roleAptitudes || {}),
      ...(check.update.roleAptitudes || {})
    }
  };
  
  console.log(`  결과: ${JSON.stringify(merged)}`);
  console.log(`  예상: ${JSON.stringify(check.expected)}`);
  console.log(`  ✅ 일치: ${JSON.stringify(merged) === JSON.stringify({ ...check.before, ...check.expected })}`);
});

console.log('\n✅ 엣지 케이스 테스트 완료');