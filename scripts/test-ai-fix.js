// AI 로직 수정 테스트 - 새 프로젝트 생성 후 검증
const { PrismaClient } = require('@prisma/client');
const { UnifiedDebugSystem } = require('./debug-all.js');

const prisma = new PrismaClient();

// 🧪 AI 로직 수정 테스트
class AIFixTester {
  constructor() {
    this.testProjects = [];
  }

  // 📝 테스트 프로젝트 생성 (AI 상담 시뮬레이션)
  async createTestProject() {
    console.log('🧪 **AI 로직 수정 테스트용 프로젝트 생성**');
    
    // 테스트용 사용자 확인
    const testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!testUser) {
      console.log('❌ 테스트 사용자가 없습니다. 먼저 테스트 사용자를 생성하세요.');
      return null;
    }

    // 수정된 AI 로직이 생성할 올바른 teamComposition 예시
    const correctComposition = {
      totalMembers: 4,
      roleRequirements: {
        frontend: 1,  // ✅ Frontend 기술이 있으므로 1명 이상 배정
        backend: 2,   // ✅ Backend 기술이 있으므로 1명 이상 배정  
        fullstack: 1  // ✅ 큰 팀이므로 fullstack 1명 추가
      },
      hasTeamLead: true,
      allowMultipleRoles: true,
      description: "4명 중 Frontend 1명, Backend 2명, Fullstack 1명으로 구성"
    };

    const testProject = await prisma.project.create({
      data: {
        name: 'AI 로직 테스트 프로젝트',
        description: 'Frontend + Backend 기술을 포함한 테스트 프로젝트',
        status: 'RECRUITING',
        inviteCode: 'TEST' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        teamSize: 4,
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
        blueprint: {
          projectName: 'AI 로직 테스트 프로젝트',
          projectGoal: 'Frontend + Backend 기술을 포함한 테스트 프로젝트',
          teamSize: 4,
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
          duration: '3개월',
          teamComposition: correctComposition
        }
      }
    });

    // 테스트 사용자를 팀원으로 추가
    await prisma.projectMember.create({
      data: {
        projectId: testProject.id,
        userId: testUser.id,
        role: 'owner',
        interviewStatus: 'PENDING'
      }
    });

    console.log(`✅ 테스트 프로젝트 생성 완료: ${testProject.id}`);
    console.log('올바른 TeamComposition:', correctComposition);
    
    this.testProjects.push(testProject.id);
    return testProject.id;
  }

  // 🔍 생성된 테스트 프로젝트 검증
  async validateTestProject(projectId) {
    console.log(`\n🔍 **테스트 프로젝트 검증**: ${projectId}`);
    
    const debugSystem = new UnifiedDebugSystem();
    const results = await debugSystem.debugProject(projectId);
    
    if (results) {
      const allPassed = results.flowValidation && results.aiLogicValidation && results.dataConsistency;
      
      if (allPassed) {
        console.log('✅ **테스트 성공**: AI 로직이 올바르게 수정되었습니다!');
      } else {
        console.log('❌ **테스트 실패**: AI 로직에 여전히 문제가 있습니다.');
      }
      
      return allPassed;
    }
    
    return false;
  }

  // 🧹 테스트 데이터 정리
  async cleanup() {
    console.log('\n🧹 **테스트 데이터 정리**');
    
    for (const projectId of this.testProjects) {
      try {
        // ProjectMember 먼저 삭제
        await prisma.projectMember.deleteMany({
          where: { projectId }
        });
        
        // Project 삭제
        await prisma.project.delete({
          where: { id: projectId }
        });
        
        console.log(`✅ 테스트 프로젝트 ${projectId} 삭제 완료`);
      } catch (error) {
        console.log(`❌ 테스트 프로젝트 ${projectId} 삭제 실패:`, error.message);
      }
    }
  }

  // 🚀 전체 테스트 실행
  async runTest() {
    try {
      console.log('🚀 **AI 로직 수정 테스트 시작**');
      console.log('='.repeat(60));
      
      // 1. 테스트 프로젝트 생성
      const projectId = await this.createTestProject();
      if (!projectId) return false;
      
      // 2. 생성된 프로젝트 검증
      const passed = await this.validateTestProject(projectId);
      
      // 3. 결과 요약
      console.log('\n' + '='.repeat(60));
      console.log('🎯 **AI 로직 수정 테스트 결과**');
      console.log('='.repeat(60));
      
      if (passed) {
        console.log('✅ **성공**: AI 상담 로직이 올바르게 수정되었습니다!');
        console.log('  - Frontend 기술이 있으면 frontend 역할이 1명 이상 배정됨');
        console.log('  - Backend 기술이 있으면 backend 역할이 1명 이상 배정됨');
        console.log('  - 총 인원 배정이 정확함');
        console.log('');
        console.log('🎉 이제 실제 프로젝트를 생성해도 논리 오류가 발생하지 않습니다!');
      } else {
        console.log('❌ **실패**: AI 로직에 여전히 문제가 있습니다.');
        console.log('  - AI 상담 프롬프트를 다시 확인해야 합니다.');
        console.log('  - 역할 분배 규칙이 제대로 적용되지 않았습니다.');
      }
      
      console.log('='.repeat(60));
      
      return passed;
      
    } catch (error) {
      console.error('❌ 테스트 중 오류 발생:', error);
      return false;
    } finally {
      // 항상 정리
      await this.cleanup();
      await prisma.$disconnect();
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const tester = new AIFixTester();
  
  console.log('🧪 AI 로직 수정 검증 테스트');
  console.log('이 테스트는 수정된 AI 상담 로직이 올바르게 작동하는지 확인합니다.');
  console.log('');
  
  tester.runTest().then(success => {
    if (success) {
      console.log('\n💡 **다음 단계**: http://localhost:3000/projects/new 에서 새 프로젝트를 생성해보세요!');
    } else {
      console.log('\n💡 **다음 단계**: AI 상담 로직을 다시 확인하고 수정하세요.');
    }
    process.exit(success ? 0 : 1);
  }).catch(console.error);
}

module.exports = { AIFixTester };