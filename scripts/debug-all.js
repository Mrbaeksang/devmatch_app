// 통합 디버깅 시스템 - 모든 검증 도구를 한 번에 실행
const { DevMatchDebugger } = require('./debug-flow.js');
const { AILogicValidator } = require('./validate-ai-logic.js');
const { DataConsistencyMonitor } = require('./monitor-data-consistency.js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🔧 통합 디버깅 시스템
class UnifiedDebugSystem {
  constructor() {
    this.allResults = {
      flowValidation: null,
      aiLogicValidation: null,
      dataConsistency: null
    };
  }

  // 🎯 특정 프로젝트 전체 검증
  async debugProject(projectId) {
    console.log('🔧 **DevMatch 통합 디버깅 시스템**');
    console.log('='.repeat(70));
    console.log(`🎯 대상 프로젝트: ${projectId}`);
    console.log('='.repeat(70));

    try {
      // 1. 데이터 플로우 검증
      console.log('\n📋 **1단계: 데이터 플로우 검증**');
      const flowDebugger = new DevMatchDebugger();
      this.allResults.flowValidation = await flowDebugger.runFullValidation(projectId);

      // 2. AI 로직 검증
      console.log('\n🤖 **2단계: AI 로직 검증**');
      const aiValidator = new AILogicValidator();
      this.allResults.aiLogicValidation = await aiValidator.runValidation(projectId);

      // 3. 전체 시스템 일관성 검사
      console.log('\n📊 **3단계: 시스템 전체 일관성 검사**');
      const consistencyMonitor = new DataConsistencyMonitor();
      this.allResults.dataConsistency = await consistencyMonitor.runMonitoring();

      // 통합 결과 출력
      this.printUnifiedReport(projectId);

      return this.allResults;

    } catch (error) {
      console.error('❌ 통합 디버깅 중 오류:', error);
      return null;
    }
  }

  // 🌐 전체 시스템 검증 (모든 프로젝트)
  async debugAllProjects() {
    console.log('🔧 **DevMatch 전체 시스템 디버깅**');
    console.log('='.repeat(70));

    try {
      // 모든 프로젝트 가져오기
      const projects = await prisma.project.findMany({
        select: { id: true, name: true, status: true }
      });

      console.log(`📊 총 ${projects.length}개 프로젝트 발견`);

      const projectResults = {};

      // 각 프로젝트별 검증
      for (const project of projects) {
        console.log(`\n🎯 프로젝트 검증: ${project.name} (${project.status})`);
        
        const flowDebugger = new DevMatchDebugger();
        const result = await flowDebugger.runFullValidation(project.id);
        
        projectResults[project.id] = {
          name: project.name,
          status: project.status,
          passed: result
        };
      }

      // 전체 시스템 일관성 검사
      console.log('\n📊 **전체 시스템 일관성 검사**');
      const consistencyMonitor = new DataConsistencyMonitor();
      const systemHealth = await consistencyMonitor.runMonitoring();

      // 전체 결과 요약
      this.printSystemReport(projectResults, systemHealth);

      return { projectResults, systemHealth };

    } catch (error) {
      console.error('❌ 전체 시스템 디버깅 중 오류:', error);
      return null;
    } finally {
      await prisma.$disconnect();
    }
  }

  // 📋 프로젝트별 통합 리포트
  printUnifiedReport(projectId) {
    console.log('\n' + '='.repeat(70));
    console.log('📋 **통합 디버깅 결과 리포트**');
    console.log('='.repeat(70));
    console.log(`🎯 프로젝트 ID: ${projectId}`);

    // 각 검증 결과
    const results = [
      { name: '데이터 플로우 검증', passed: this.allResults.flowValidation },
      { name: 'AI 로직 검증', passed: this.allResults.aiLogicValidation },
      { name: '시스템 일관성 검사', passed: this.allResults.dataConsistency }
    ];

    console.log('\n📊 **검증 결과 요약**:');
    results.forEach(result => {
      const status = result.passed ? '✅ 통과' : '❌ 실패';
      console.log(`  ${result.name}: ${status}`);
    });

    // 전체 평가
    const allPassed = results.every(r => r.passed);
    const passedCount = results.filter(r => r.passed).length;

    console.log(`\n🎯 **종합 평가**: ${passedCount}/${results.length} 검증 통과`);
    
    if (allPassed) {
      console.log('✅ 모든 검증을 통과했습니다! 프로젝트가 정상 작동합니다.');
    } else {
      console.log('🚨 일부 검증에 실패했습니다. 위의 상세 로그를 확인하여 문제를 해결하세요.');
    }

    console.log('='.repeat(70));
  }

  // 🌐 전체 시스템 리포트
  printSystemReport(projectResults, systemHealth) {
    console.log('\n' + '='.repeat(70));
    console.log('🌐 **전체 시스템 건강도 리포트**');
    console.log('='.repeat(70));

    const totalProjects = Object.keys(projectResults).length;
    const healthyProjects = Object.values(projectResults).filter(p => p.passed).length;
    const problematicProjects = Object.values(projectResults).filter(p => !p.passed);

    console.log(`\n📊 **프로젝트 현황**:`);
    console.log(`  총 프로젝트: ${totalProjects}개`);
    console.log(`  정상 프로젝트: ${healthyProjects}개`);
    console.log(`  문제 프로젝트: ${problematicProjects.length}개`);

    if (problematicProjects.length > 0) {
      console.log('\n🚨 **문제가 있는 프로젝트들**:');
      problematicProjects.forEach(project => {
        console.log(`  - ${project.name} (${project.status})`);
      });
    }

    console.log(`\n💊 **전체 시스템 상태**: ${systemHealth ? '✅ 건강' : '🚨 문제 있음'}`);
    
    const overallHealth = (healthyProjects / totalProjects) * 100;
    console.log(`📈 **시스템 건강도**: ${Math.round(overallHealth)}%`);

    if (overallHealth >= 90) {
      console.log('🎉 시스템이 매우 안정적입니다!');
    } else if (overallHealth >= 70) {
      console.log('⚠️ 시스템이 대체로 안정적이지만 일부 개선이 필요합니다.');
    } else {
      console.log('🚨 시스템에 심각한 문제가 있습니다. 즉시 수정이 필요합니다!');
    }

    console.log('\n💡 **권장사항**:');
    if (problematicProjects.length > 0) {
      console.log('  1. 문제가 있는 프로젝트들을 개별적으로 디버깅하세요');
      console.log('  2. node debug-all.js <프로젝트ID> 명령으로 상세 분석하세요');
    }
    if (!systemHealth) {
      console.log('  3. 시스템 일관성 문제를 우선 해결하세요');
    }
    console.log('  4. AI 로직 변경 시 반드시 이 도구로 검증하세요');

    console.log('='.repeat(70));
  }

  // 📈 지속적 모니터링 (개발 중 실시간 체크)
  async startContinuousMonitoring(intervalMinutes = 5) {
    console.log(`🔄 지속적 모니터링 시작 (${intervalMinutes}분 간격)`);
    
    const runCheck = async () => {
      console.log(`\n⏰ ${new Date().toLocaleString()} - 정기 검사 실행`);
      
      const monitor = new DataConsistencyMonitor();
      const result = await monitor.runMonitoring();
      
      if (!result) {
        console.log('🚨 문제 발견! 상세 확인이 필요합니다.');
      }
    };

    // 첫 실행
    await runCheck();
    
    // 주기적 실행
    setInterval(runCheck, intervalMinutes * 60 * 1000);
  }
}

// 스크립트 실행
if (require.main === module) {
  const debugSystem = new UnifiedDebugSystem();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔧 DevMatch 통합 디버깅 시스템');
    console.log('');
    console.log('사용법:');
    console.log('  node debug-all.js <프로젝트ID>     # 특정 프로젝트 전체 검증');
    console.log('  node debug-all.js --all           # 전체 시스템 검증');
    console.log('  node debug-all.js --monitor       # 지속적 모니터링 시작');
    console.log('');
    console.log('예시:');
    console.log('  node debug-all.js cmcyf4j700005u8k0v765o8v8');
    console.log('  node debug-all.js --all');
    console.log('  node debug-all.js --monitor');
    process.exit(1);
  }

  const command = args[0];
  
  if (command === '--all') {
    debugSystem.debugAllProjects().catch(console.error);
  } else if (command === '--monitor') {
    debugSystem.startContinuousMonitoring().catch(console.error);
  } else {
    // 프로젝트 ID로 간주
    debugSystem.debugProject(command).catch(console.error);
  }
}

module.exports = { UnifiedDebugSystem };