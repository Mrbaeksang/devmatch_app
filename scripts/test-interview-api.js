// 면담 API 직접 호출 테스트
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInterviewAPI() {
  try {
    // 1. 프로젝트와 멤버 정보 가져오기
    const project = await prisma.project.findFirst({
      where: { name: '카페 메뉴 관리 서비스' },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      console.log('프로젝트를 찾을 수 없습니다.');
      return;
    }

    const member = project.members[0];
    console.log('\n🎯 테스트 정보:');
    console.log(`프로젝트: ${project.name} (${project.id})`);
    console.log(`멤버: ${member.user.nickname} (${member.id})`);
    console.log(`면담 상태: ${member.interviewStatus}`);
    console.log(`기술 스택:`, project.techStack);
    
    // 2. 기술 스택 추출
    const techStackArray = [];
    const ts = project.techStack;
    if (ts.frontend) {
      if (ts.frontend.languages) techStackArray.push(...ts.frontend.languages);
      if (ts.frontend.frameworks) techStackArray.push(...ts.frontend.frameworks);
    }
    if (ts.backend) {
      if (ts.backend.languages) techStackArray.push(...ts.backend.languages);
      if (ts.backend.frameworks) techStackArray.push(...ts.backend.frameworks);
      if (ts.backend.tools) techStackArray.push(...ts.backend.tools);
    }
    if (ts.collaboration) {
      if (ts.collaboration.git) techStackArray.push(...ts.collaboration.git);
    }
    
    console.log(`\n📚 평가할 기술들: ${techStackArray.join(', ')}`);
    console.log(`총 ${techStackArray.length}개의 기술 평가 필요`);
    
    // 3. 면담 진행 시뮬레이션
    console.log('\n🎤 면담 진행 시뮬레이션:');
    
    // 초기 상태
    let currentProfile = {
      skillScores: {},
      roleAptitudes: {},
      workStyles: []
    };
    
    // JavaScript 점수 수집
    console.log('\n1️⃣ JavaScript 평가:');
    currentProfile.skillScores['JavaScript'] = 5;
    console.log('- JavaScript: 5점 저장');
    
    // TypeScript 점수 수집
    console.log('\n2️⃣ TypeScript 평가:');
    currentProfile.skillScores['TypeScript'] = 3;
    console.log('- TypeScript: 3점 저장');
    
    // 나머지 기술들 점수 수집
    const otherSkills = ['React', 'Next.js', 'Java', 'Spring Boot', 'MySQL', 'Git'];
    otherSkills.forEach((skill, index) => {
      const score = Math.floor(Math.random() * 8) + 1; // 1-8점 랜덤
      currentProfile.skillScores[skill] = score;
      console.log(`- ${skill}: ${score}점 저장`);
    });
    
    // 워크스타일 추가
    currentProfile.workStyles = ['협업 선호', '문서화 중시'];
    
    // 역할 적합도 계산
    currentProfile.roleAptitudes = {
      frontend: 4.5,
      backend: 3.2,
      fullstack: 3.8,
      teamLead: 2.5
    };
    
    console.log('\n📊 최종 프로필:', JSON.stringify(currentProfile, null, 2));
    
    // 4. DB에 저장
    console.log('\n💾 DB 업데이트...');
    await prisma.projectMember.update({
      where: { id: member.id },
      data: {
        memberProfile: currentProfile,
        interviewStatus: 'COMPLETED'
      }
    });
    
    // 5. 업데이트 확인
    const updated = await prisma.projectMember.findUnique({
      where: { id: member.id }
    });
    
    console.log('\n✅ 업데이트 완료:');
    console.log('면담 상태:', updated.interviewStatus);
    console.log('저장된 프로필:', JSON.stringify(updated.memberProfile, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInterviewAPI();