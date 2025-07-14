// 모든 멤버의 면담 데이터 확인 스크립트
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllMembers() {
  try {
    // 최근 프로젝트 찾기
    const project = await prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      console.log('❌ 프로젝트가 없습니다.');
      return;
    }

    console.log(`\n🎯 프로젝트: ${project.name}`);
    console.log(`멤버 수: ${project.members.length}명\n`);

    // 각 멤버의 면담 데이터 출력
    project.members.forEach((member, index) => {
      console.log(`\n${index + 1}. ${member.user.nickname || member.user.name}`);
      console.log(`   상태: ${member.interviewStatus}`);
      console.log(`   면담 데이터:`, member.memberProfile ? 
        JSON.stringify(member.memberProfile, null, 2) : 
        '❌ 데이터 없음'
      );
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllMembers();