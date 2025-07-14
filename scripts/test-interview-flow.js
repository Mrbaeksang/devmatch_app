#!/usr/bin/env node

// 면담 시스템 테스트 스크립트
// 사용법: node scripts/test-interview-flow.js <projectId>

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const PROJECT_ID = process.argv[2];

if (!PROJECT_ID) {
  console.error('❌ 사용법: node scripts/test-interview-flow.js <projectId>');
  process.exit(1);
}

// 테스트용 대화 시뮬레이션
const conversations = [
  { input: '', expected: 'JavaScript 질문' },
  { input: '3', expected: 'JavaScript 3점 저장, TypeScript 질문' },
  { input: '2', expected: 'TypeScript 2점 저장, React 질문' },
  { input: '5', expected: 'React 5점 저장, Node.js 질문' },
  { input: '4', expected: 'Node.js 4점 저장, Express 질문' },
  { input: '3', expected: 'Express 3점 저장, PostgreSQL 질문' },
  { input: '2', expected: 'PostgreSQL 2점 저장, Git 질문' },
  { input: '5', expected: 'Git 5점 저장, GitHub 질문' },
  { input: '4', expected: 'GitHub 4점 저장, 워크스타일 질문' },
  { input: '협업을 선호하고 계획적으로 일해요', expected: '워크스타일 저장' },
  { input: '창의적이고 유연하게 일하는 편이에요', expected: '면담 완료' }
];

let chatHistory = [];
let memberProfile = { skillScores: {}, roleAptitudes: {}, workStyles: [] };

async function simulateInterview() {
  console.log('🚀 면담 시스템 테스트 시작\n');
  console.log(`프로젝트 ID: ${PROJECT_ID}`);
  console.log('================================\n');

  // 먼저 멤버 ID 가져오기
  const projectResponse = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}`);
  const projectData = await projectResponse.json();
  
  if (!projectData.members || projectData.members.length === 0) {
    console.error('❌ 프로젝트에 멤버가 없습니다.');
    return;
  }

  const memberId = projectData.members[0].id;
  console.log(`멤버 ID: ${memberId}\n`);

  for (let i = 0; i < conversations.length; i++) {
    const { input, expected } = conversations[i];
    
    console.log(`\n🔄 [${i + 1}/${conversations.length}] ${expected}`);
    if (input) console.log(`👤 사용자: "${input}"`);

    try {
      const response = await fetch(`${BASE_URL}/api/projects/${PROJECT_ID}/interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'next-auth.session-token=test-session' // 실제 환경에서는 유효한 세션 필요
        },
        body: JSON.stringify({
          projectId: PROJECT_ID,
          memberId: memberId,
          userInput: input,
          chatHistory: chatHistory,
          memberProfile: memberProfile
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API 오류:', data.error);
        break;
      }

      console.log(`🤖 AI: "${data.response.substring(0, 100)}..."`);
      
      // 상태 업데이트
      if (data.memberProfile) {
        memberProfile = {
          ...memberProfile,
          ...data.memberProfile,
          skillScores: {
            ...memberProfile.skillScores,
            ...(data.memberProfile.skillScores || {})
          }
        };
        console.log('📊 프로필 업데이트:', JSON.stringify(memberProfile.skillScores));
      }

      // 대화 기록 추가
      if (input) {
        chatHistory.push({ role: 'user', content: input });
      }
      chatHistory.push({ role: 'ai', content: data.response });

      if (data.isComplete) {
        console.log('\n✅ 면담 완료!');
        console.log('최종 프로필:', JSON.stringify(memberProfile, null, 2));
        break;
      }

      // 다음 대화를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('❌ 요청 실패:', error.message);
      break;
    }
  }

  console.log('\n================================');
  console.log('📊 최종 수집된 점수:');
  console.log(JSON.stringify(memberProfile.skillScores, null, 2));
  console.log('\n🏁 테스트 종료');
}

// 실행
simulateInterview().catch(console.error);