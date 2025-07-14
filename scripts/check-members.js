const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log('\n📋 최근 프로젝트 목록:');
    projects.forEach(p => {
      console.log(`\n프로젝트: ${p.name} (${p.id})`);
      console.log(`상태: ${p.status}`);
      console.log(`멤버 수: ${p.members.length}`);
      p.members.forEach(m => {
        console.log(`  - ${m.user.name || m.user.nickname || 'Unknown'}: ${m.interviewStatus}`);
        if (m.memberProfile) {
          console.log(`    프로필: ${JSON.stringify(m.memberProfile, null, 2)}`);
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProjects();