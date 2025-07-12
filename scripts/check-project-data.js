// 특정 프로젝트의 청사진과 면담 데이터를 확인하는 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjectData(projectId) {
  try {
    console.log(`🔍 프로젝트 ID: ${projectId} 데이터 조회 중...`);
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      console.log('❌ 프로젝트를 찾을 수 없습니다.');
      return;
    }

    console.log('\n📋 **프로젝트 기본 정보:**');
    console.log(`- 이름: ${project.name}`);
    console.log(`- 설명: ${project.description}`);
    console.log(`- 팀 크기: ${project.teamSize}명`);
    console.log(`- 상태: ${project.status}`);

    console.log('\n🛠️ **기술 스택 (청사진):**');
    if (project.techStack && typeof project.techStack === 'object') {
      const techStack = project.techStack;
      
      if (techStack.frontend) {
        console.log('Frontend:');
        if (techStack.frontend.languages) console.log(`  Languages: ${techStack.frontend.languages.join(', ')}`);
        if (techStack.frontend.frameworks) console.log(`  Frameworks: ${techStack.frontend.frameworks.join(', ')}`);
        if (techStack.frontend.tools) console.log(`  Tools: ${techStack.frontend.tools.join(', ')}`);
      }
      
      if (techStack.backend) {
        console.log('Backend:');
        if (techStack.backend.languages) console.log(`  Languages: ${techStack.backend.languages.join(', ')}`);
        if (techStack.backend.frameworks) console.log(`  Frameworks: ${techStack.backend.frameworks.join(', ')}`);
        if (techStack.backend.tools) console.log(`  Tools: ${techStack.backend.tools.join(', ')}`);
      }
      
      if (techStack.collaboration) {
        console.log('Collaboration:');
        if (techStack.collaboration.git) console.log(`  Git: ${techStack.collaboration.git.join(', ')}`);
        if (techStack.collaboration.tools) console.log(`  Tools: ${techStack.collaboration.tools.join(', ')}`);
      }
    } else {
      console.log(`기술 스택: ${JSON.stringify(project.techStack)}`);
    }

    console.log('\n👥 **팀원 정보:**');
    project.members.forEach((member, index) => {
      console.log(`\n팀원 ${index + 1}: ${member.user.name || member.user.nickname || '익명'}`);
      console.log(`  - 역할: ${member.role}`);
      console.log(`  - 면담 상태: ${member.interviewStatus}`);
      console.log(`  - 분석 동의: ${member.agreedToAnalysis ? '✅ 동의함' : '❌ 미동의'}`);
      
      if (member.memberProfile) {
        console.log('  - 면담 결과:');
        const profile = member.memberProfile;
        
        if (profile.skillScores) {
          console.log('    기술 점수:');
          Object.entries(profile.skillScores).forEach(([tech, score]) => {
            console.log(`      ${tech}: ${score}점`);
          });
        }
        
        if (profile.workStyles) {
          console.log(`    워크스타일: ${profile.workStyles.join(', ')}`);
        }
        
        // 추가 정보들
        if (profile.preferredRole) console.log(`    선호 역할: ${profile.preferredRole}`);
        if (profile.leadershipLevel) console.log(`    리더십 레벨: ${profile.leadershipLevel}`);
      }
    });

    console.log('\n📊 **청사진 상세 정보:**');
    if (project.blueprint) {
      const blueprint = project.blueprint;
      console.log(`팀 구성: ${JSON.stringify(blueprint.teamComposition, null, 2)}`);
    }

    // 테스트 사용자 생성을 위한 기술 스택 추출
    console.log('\n🧪 **테스트 사용자 생성을 위한 기술 목록:**');
    const allTechs = [];
    
    if (project.techStack && typeof project.techStack === 'object') {
      const techStack = project.techStack;
      
      if (techStack.frontend) {
        if (techStack.frontend.languages) allTechs.push(...techStack.frontend.languages);
        if (techStack.frontend.frameworks) allTechs.push(...techStack.frontend.frameworks);
        if (techStack.frontend.tools) allTechs.push(...techStack.frontend.tools);
      }
      
      if (techStack.backend) {
        if (techStack.backend.languages) allTechs.push(...techStack.backend.languages);
        if (techStack.backend.frameworks) allTechs.push(...techStack.backend.frameworks);
        if (techStack.backend.tools) allTechs.push(...techStack.backend.tools);
      }
      
      if (techStack.collaboration) {
        if (techStack.collaboration.git) allTechs.push(...techStack.collaboration.git);
        if (techStack.collaboration.tools) allTechs.push(...techStack.collaboration.tools);
      }
    }
    
    console.log(`총 ${allTechs.length}개 기술:`);
    allTechs.forEach((tech, index) => {
      console.log(`  ${index + 1}. ${tech}`);
    });

    return {
      project,
      allTechs,
      members: project.members
    };

  } catch (error) {
    console.error('❌ 데이터 조회 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  const projectId = process.argv[2];
  
  if (!projectId) {
    console.log('사용법: node check-project-data.js <프로젝트ID>');
    console.log('예시: node check-project-data.js cmcyf4j700005u8k0v765o8v8');
    process.exit(1);
  }
  
  checkProjectData(projectId).catch(console.error);
}

module.exports = { checkProjectData };