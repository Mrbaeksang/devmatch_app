// 분석 동의 상태 확인 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAnalysisAgreement(projectId) {
  try {
    console.log(`🔍 프로젝트 ID: ${projectId} 분석 동의 상태 확인`);
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, nickname: true }
            }
          }
        }
      }
    });

    if (!project) {
      console.log('❌ 프로젝트를 찾을 수 없습니다.');
      return;
    }

    console.log(`📊 프로젝트: ${project.name}`);
    console.log(`📊 상태: ${project.status}`);
    console.log('\n👥 **분석 동의 현황:**');
    
    let agreedCount = 0;
    project.members.forEach((member, index) => {
      const name = member.user.name || member.user.nickname || '익명';
      const role = member.role === 'owner' ? '(나)' : '';
      const agreed = member.agreedToAnalysis ? '✅ 동의함' : '❌ 미동의';
      
      if (member.agreedToAnalysis) agreedCount++;
      
      console.log(`  ${index + 1}. ${name} ${role}: ${agreed}`);
    });
    
    console.log(`\n📈 **동의 진행률**: ${agreedCount}/${project.members.length}명`);
    
    if (agreedCount === project.members.length) {
      console.log('🎉 모든 팀원이 분석에 동의했습니다!');
    } else {
      console.log(`⏳ ${project.members.length - agreedCount}명이 더 동의해야 합니다.`);
    }

  } catch (error) {
    console.error('❌ 조회 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  const projectId = process.argv[2];
  
  if (!projectId) {
    console.log('사용법: node check-analysis-agreement.js <프로젝트ID>');
    process.exit(1);
  }
  
  checkAnalysisAgreement(projectId).catch(console.error);
}

module.exports = { checkAnalysisAgreement };