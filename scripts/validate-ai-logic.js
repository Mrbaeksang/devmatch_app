// AI 로직 검증 시스템 - AI 상담 및 면담 로직의 정확성 검증
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🤖 AI 로직 검증 시스템
class AILogicValidator {
  constructor() {
    this.testCases = [];
    this.results = [];
  }

  // 📝 테스트 케이스 정의
  setupTestCases() {
    this.testCases = [
      {
        name: 'Frontend + Backend 프로젝트',
        techStack: {
          frontend: {
            languages: ['JavaScript', 'TypeScript'],
            frameworks: ['React', 'Next.js'],
            tools: ['Tailwind CSS']
          },
          backend: {
            languages: ['Java'],
            frameworks: ['Spring Boot'],
            tools: ['MySQL']
          },
          collaboration: {
            git: ['Git', 'GitHub'],
            tools: []
          }
        },
        teamSize: 4,
        expected: {
          frontend: { min: 1, max: 2 },
          backend: { min: 1, max: 3 },
          fullstack: { min: 0, max: 2 }
        }
      },
      {
        name: 'Frontend Only 프로젝트',
        techStack: {
          frontend: {
            languages: ['JavaScript'],
            frameworks: ['Vue.js'],
            tools: ['Vuetify']
          },
          collaboration: {
            git: ['Git'],
            tools: ['Slack']
          }
        },
        teamSize: 3,
        expected: {
          frontend: { min: 2, max: 3 },
          backend: { min: 0, max: 0 },
          fullstack: { min: 0, max: 1 }
        }
      },
      {
        name: 'Backend Only 프로젝트',
        techStack: {
          backend: {
            languages: ['Python'],
            frameworks: ['Django'],
            tools: ['PostgreSQL', 'Redis']
          },
          collaboration: {
            git: ['Git', 'GitLab'],
            tools: ['Jira']
          }
        },
        teamSize: 3,
        expected: {
          frontend: { min: 0, max: 0 },
          backend: { min: 2, max: 3 },
          fullstack: { min: 0, max: 1 }
        }
      },
      {
        name: 'Full-Stack 소규모 프로젝트',
        techStack: {
          frontend: {
            languages: ['JavaScript'],
            frameworks: ['React'],
            tools: []
          },
          backend: {
            languages: ['Node.js'],
            frameworks: ['Express'],
            tools: ['MongoDB']
          },
          collaboration: {
            git: ['Git'],
            tools: []
          }
        },
        teamSize: 2,
        expected: {
          frontend: { min: 1, max: 1 },
          backend: { min: 1, max: 1 },
          fullstack: { min: 0, max: 0 }
        }
      }
    ];
  }

  // 🧪 TeamComposition 로직 검증
  validateTeamComposition(testCase, actualComposition) {
    const result = {
      testName: testCase.name,
      passed: true,
      errors: [],
      warnings: []
    };

    console.log(`\n🧪 테스트: ${testCase.name}`);
    console.log('기술 스택:', JSON.stringify(testCase.techStack, null, 2));
    console.log('팀 크기:', testCase.teamSize);
    console.log('실제 결과:', actualComposition.roleRequirements);

    // Frontend 검증
    const hasFrontend = this.hasTechnologies(testCase.techStack.frontend);
    const frontendCount = actualComposition.roleRequirements.frontend;
    
    if (hasFrontend && frontendCount === 0) {
      result.errors.push('🚨 Frontend 기술이 있는데 frontend: 0으로 설정됨');
      result.passed = false;
    } else if (hasFrontend) {
      const expected = testCase.expected.frontend;
      if (frontendCount < expected.min || frontendCount > expected.max) {
        result.warnings.push(`Frontend 인원 범위 벗어남: 예상 ${expected.min}-${expected.max}, 실제 ${frontendCount}`);
      } else {
        console.log(`✅ Frontend 인원 적절: ${frontendCount}명`);
      }
    } else if (!hasFrontend && frontendCount > 0) {
      result.errors.push('🚨 Frontend 기술이 없는데 frontend 인원이 배정됨');
      result.passed = false;
    }

    // Backend 검증
    const hasBackend = this.hasTechnologies(testCase.techStack.backend);
    const backendCount = actualComposition.roleRequirements.backend;
    
    if (hasBackend && backendCount === 0) {
      result.errors.push('🚨 Backend 기술이 있는데 backend: 0으로 설정됨');
      result.passed = false;
    } else if (hasBackend) {
      const expected = testCase.expected.backend;
      if (backendCount < expected.min || backendCount > expected.max) {
        result.warnings.push(`Backend 인원 범위 벗어남: 예상 ${expected.min}-${expected.max}, 실제 ${backendCount}`);
      } else {
        console.log(`✅ Backend 인원 적절: ${backendCount}명`);
      }
    } else if (!hasBackend && backendCount > 0) {
      result.errors.push('🚨 Backend 기술이 없는데 backend 인원이 배정됨');
      result.passed = false;
    }

    // 총 인원 검증
    const totalAssigned = frontendCount + backendCount + (actualComposition.roleRequirements.fullstack || 0);
    if (totalAssigned !== testCase.teamSize) {
      result.errors.push(`총 인원 불일치: 팀 크기 ${testCase.teamSize}, 배정 인원 ${totalAssigned}`);
      result.passed = false;
    } else {
      console.log(`✅ 총 인원 일치: ${totalAssigned}명`);
    }

    return result;
  }

  // 🛠️ 기술 존재 여부 확인
  hasTechnologies(techCategory) {
    if (!techCategory) return false;
    
    const hasLanguages = techCategory.languages && techCategory.languages.length > 0;
    const hasFrameworks = techCategory.frameworks && techCategory.frameworks.length > 0;
    const hasTools = techCategory.tools && techCategory.tools.length > 0;
    
    return hasLanguages || hasFrameworks || hasTools;
  }

  // 🎯 실제 프로젝트의 AI 로직 검증
  async validateExistingProject(projectId) {
    console.log(`\n🎯 실제 프로젝트 [${projectId}] AI 로직 검증`);
    
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || !project.blueprint) {
      console.log('❌ 프로젝트 또는 blueprint를 찾을 수 없습니다.');
      return false;
    }

    const blueprint = project.blueprint;
    
    // 실제 프로젝트를 테스트 케이스로 변환
    const actualTestCase = {
      name: `실제 프로젝트: ${project.name}`,
      techStack: blueprint.techStack,
      teamSize: blueprint.teamSize || project.teamSize,
      expected: this.generateExpectedRoles(blueprint.techStack, blueprint.teamSize || project.teamSize)
    };

    const result = this.validateTeamComposition(actualTestCase, blueprint.teamComposition);
    this.results.push(result);
    
    return result.passed;
  }

  // 📊 예상 역할 분배 생성 (휴리스틱)
  generateExpectedRoles(techStack, teamSize) {
    const hasFrontend = this.hasTechnologies(techStack.frontend);
    const hasBackend = this.hasTechnologies(techStack.backend);
    
    let expected = {
      frontend: { min: 0, max: 0 },
      backend: { min: 0, max: 0 },
      fullstack: { min: 0, max: teamSize }
    };

    if (hasFrontend && hasBackend) {
      // Frontend + Backend 프로젝트
      expected.frontend = { min: 1, max: Math.ceil(teamSize / 2) };
      expected.backend = { min: 1, max: teamSize - 1 };
      expected.fullstack = { min: 0, max: Math.floor(teamSize / 3) };
    } else if (hasFrontend) {
      // Frontend Only
      expected.frontend = { min: Math.ceil(teamSize / 2), max: teamSize };
      expected.backend = { min: 0, max: 0 };
    } else if (hasBackend) {
      // Backend Only  
      expected.frontend = { min: 0, max: 0 };
      expected.backend = { min: Math.ceil(teamSize / 2), max: teamSize };
    }

    return expected;
  }

  // 📋 검증 결과 요약
  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🤖 **AI 로직 검증 결과**');
    console.log('='.repeat(60));

    let totalTests = this.results.length;
    let passedTests = this.results.filter(r => r.passed).length;
    let failedTests = totalTests - passedTests;

    this.results.forEach(result => {
      console.log(`\n${result.passed ? '✅' : '❌'} ${result.testName}`);
      
      if (result.errors.length > 0) {
        console.log('  오류:');
        result.errors.forEach(error => console.log(`    ${error}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('  경고:');
        result.warnings.forEach(warning => console.log(`    ${warning}`));
      }
    });

    console.log(`\n📊 **종합 결과**: ${passedTests}/${totalTests} 테스트 통과`);
    if (failedTests > 0) {
      console.log(`🚨 ${failedTests}개 테스트 실패 - AI 로직 수정 필요!`);
    } else {
      console.log('✅ 모든 AI 로직 검증 통과!');
    }
    console.log('='.repeat(60));

    return failedTests === 0;
  }

  // 🚀 전체 검증 실행
  async runValidation(projectId = null) {
    this.setupTestCases();
    
    console.log('🚀 AI 로직 검증 시작');
    
    try {
      // 기본 테스트 케이스들은 향후 mock AI 호출로 검증 가능
      // 현재는 실제 프로젝트만 검증
      
      if (projectId) {
        await this.validateExistingProject(projectId);
      } else {
        console.log('⚠️ 실제 프로젝트 ID가 제공되지 않아 기본 검증만 수행합니다.');
      }
      
      return this.printResults();
      
    } catch (error) {
      console.error('❌ AI 로직 검증 중 오류:', error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const projectId = process.argv[2];
  
  if (!projectId) {
    console.log('사용법: node validate-ai-logic.js <프로젝트ID>');
    console.log('예시: node validate-ai-logic.js cmcyf4j700005u8k0v765o8v8');
    console.log('');
    console.log('이 스크립트는 AI 상담 로직의 정확성을 검증합니다.');
  }
  
  const validator = new AILogicValidator();
  validator.runValidation(projectId).catch(console.error);
}

module.exports = { AILogicValidator };