// scripts/debug-interview-flow.js
// 면담 플로우 디버깅 스크립트

const chalk = require('chalk');

/**
 * 프론트엔드 면담 페이지에서 발생하는 문제점 분석
 */
async function analyzeInterviewFlow() {
  console.log(chalk.bgMagenta.white('\n=== DevMatch 면담 시스템 문제 분석 ===\n'));

  console.log(chalk.yellow('🔍 현재 발견된 문제점:'));
  console.log();

  // 1. 프론트엔드 상태 관리 문제
  console.log(chalk.red('1. 프론트엔드 memberProfile 상태 관리 문제'));
  console.log(chalk.gray('   위치: app/projects/[projectId]/interview/page.tsx'));
  console.log(chalk.white('   문제점:'));
  console.log('   - 232번 줄: memberProfile 병합 로직이 불완전함');
  console.log('   - skillScores가 제대로 누적되지 않음');
  console.log();
  console.log(chalk.green('   해결책:'));
  console.log(`   const updatedProfile = {
     ...memberProfile,
     ...data.memberProfile,
     skillScores: {
       ...memberProfile.skillScores,
       ...(data.memberProfile?.skillScores || {})
     },
     roleAptitudes: {
       ...memberProfile.roleAptitudes,
       ...(data.memberProfile?.roleAptitudes || {})
     },
     workStyles: data.memberProfile?.workStyles || memberProfile.workStyles
   };`);
  console.log();

  // 2. API 요청 문제
  console.log(chalk.red('2. API 요청 시 현재 상태 누락'));
  console.log(chalk.gray('   위치: app/projects/[projectId]/interview/page.tsx - sendMessage 함수'));
  console.log(chalk.white('   문제점:'));
  console.log('   - 206번 줄: requestBody에 현재 memberProfile이 포함되지만');
  console.log('   - 이전 응답에서 업데이트된 상태가 제대로 반영되지 않음');
  console.log();

  // 3. 서비스 레이어 문제
  console.log(chalk.red('3. InterviewService의 프로필 병합 문제'));
  console.log(chalk.gray('   위치: lib/services/interview.service.ts - saveMemberProfile'));
  console.log(chalk.white('   문제점:'));
  console.log('   - DB에 저장은 되지만 다음 요청에서 활용되지 않음');
  console.log('   - currentProfile이 AI 프롬프트에 제대로 전달되지 않음');
  console.log();

  // 4. AI 프롬프트 문제
  console.log(chalk.red('4. AI가 현재 프로필을 인식하지 못함'));
  console.log(chalk.gray('   위치: lib/ai/prompts/interview.prompt.ts'));
  console.log(chalk.white('   문제점:'));
  console.log('   - currentProfile이 있어도 AI가 이를 무시하고 처음부터 질문');
  console.log('   - 수집된 기술 점수를 확인하는 로직이 작동하지 않음');
  console.log();

  // 실제 플로우 시뮬레이션
  console.log(chalk.bgBlue.white('\n=== 실제 플로우 시뮬레이션 ===\n'));

  const flow = [
    {
      step: 1,
      action: '사용자가 JavaScript 3점 답변',
      frontend: { skillScores: { JavaScript: 3 } },
      api: { skillScores: { JavaScript: 3 } },
      db: { skillScores: { JavaScript: 3 } },
      status: '✅'
    },
    {
      step: 2,
      action: '사용자가 TypeScript 2점 답변',
      frontend: { skillScores: { TypeScript: 2 } }, // ❌ JavaScript가 사라짐
      api: { skillScores: { JavaScript: 3, TypeScript: 2 } }, // ✅ 제대로 전달
      db: { skillScores: { JavaScript: 3, TypeScript: 2 } }, // ✅ DB에는 저장
      status: '❌'
    },
    {
      step: 3,
      action: 'AI가 다시 TypeScript 질문',
      frontend: { skillScores: {} }, // ❌ 상태가 리셋됨
      api: 'currentProfile이 비어있어 AI가 처음부터 시작',
      db: '저장된 데이터는 있지만 활용되지 않음',
      status: '❌'
    }
  ];

  flow.forEach(({ step, action, frontend, api, db, status }) => {
    console.log(chalk.cyan(`Step ${step}: ${action} ${status}`));
    console.log(chalk.gray('  프론트엔드:'), frontend);
    console.log(chalk.gray('  API:'), api);
    console.log(chalk.gray('  DB:'), db);
    console.log();
  });

  // 해결 방안
  console.log(chalk.bgGreen.black('\n=== 해결 방안 ===\n'));

  console.log(chalk.green('1. 프론트엔드 수정 (즉시 필요)'));
  console.log('   - memberProfile 상태 업데이트 로직 수정');
  console.log('   - Deep merge 구현으로 기존 데이터 보존');
  console.log();

  console.log(chalk.green('2. 디버깅 로그 추가'));
  console.log('   - 각 단계별 memberProfile 상태 출력');
  console.log('   - API 요청/응답 데이터 확인');
  console.log();

  console.log(chalk.green('3. AI 프롬프트 개선'));
  console.log('   - currentProfile 확인 로직 강화');
  console.log('   - 수집된 기술 명시적으로 표시');
  console.log();

  console.log(chalk.yellow('\n💡 다음 단계:'));
  console.log('1. 프론트엔드 memberProfile 병합 로직 수정');
  console.log('2. console.log 추가로 데이터 흐름 추적');
  console.log('3. 수정 후 실제 테스트 진행');
}

// 실행
analyzeInterviewFlow().catch(console.error);