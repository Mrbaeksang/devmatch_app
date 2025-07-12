// 테스트용 더미 사용자 생성 스크립트
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// 테스트용 사용자 데이터
const testUsers = [
  {
    name: '김프론트',
    nickname: 'frontend_kim',
    email: 'frontend.kim@test.com',
    avatar: JSON.stringify({
      hairColor: '#8B4513',
      skinColor: '#FDBCB4',
      eyeColor: '#4A90E2',
      accessory: 'glasses'
    }),
    bio: 'React 전문가입니다. 사용자 경험을 중시하며 깔끔한 UI를 만들어갑니다.',
    skillProfile: {
      React: 4,
      JavaScript: 4,
      TypeScript: 3,
      'HTML/CSS': 5,
      Git: 4,
      'Node.js': 2
    },
    workStyles: ['협업소통형', '창의주도형'],
    preferredRole: 'frontend'
  },
  {
    name: '박백엔드',
    nickname: 'backend_park',
    email: 'backend.park@test.com',
    avatar: JSON.stringify({
      hairColor: '#2C3E50',
      skinColor: '#F5DEB3',
      eyeColor: '#27AE60',
      accessory: 'none'
    }),
    bio: '서버 개발과 데이터베이스 설계를 담당합니다. 안정적인 백엔드 시스템 구축이 전문입니다.',
    skillProfile: {
      'Node.js': 5,
      Java: 4,
      Python: 3,
      MySQL: 4,
      PostgreSQL: 3,
      Git: 5,
      React: 2
    },
    workStyles: ['체계관리형', '문제해결형'],
    preferredRole: 'backend'
  },
  {
    name: '이풀스택',
    nickname: 'fullstack_lee',
    email: 'fullstack.lee@test.com',
    avatar: JSON.stringify({
      hairColor: '#E74C3C',
      skinColor: '#FDBCB4',
      eyeColor: '#9B59B6',
      accessory: 'headphones'
    }),
    bio: '프론트엔드와 백엔드 모두 다룰 수 있는 풀스택 개발자입니다. 팀 리더 경험이 있습니다.',
    skillProfile: {
      React: 3,
      'Node.js': 4,
      JavaScript: 4,
      TypeScript: 3,
      Python: 3,
      Git: 5,
      PostgreSQL: 3
    },
    workStyles: ['리더십형', '협업소통형'],
    preferredRole: 'fullstack'
  }
];

async function createTestUsers() {
  console.log('🚀 테스트용 더미 사용자 생성 시작...');
  
  try {
    const createdUsers = [];
    
    for (const userData of testUsers) {
      // 사용자 생성
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          nickname: userData.nickname,
          email: userData.email,
          avatar: userData.avatar,
          bio: userData.bio,
          isCompleted: true,
          accounts: {
            create: {
              type: 'oauth',
              provider: 'test',
              providerAccountId: crypto.randomUUID(),
              access_token: 'test_token',
              token_type: 'Bearer',
              scope: 'read'
            }
          }
        }
      });
      
      createdUsers.push({
        ...user,
        skillProfile: userData.skillProfile,
        workStyles: userData.workStyles,
        preferredRole: userData.preferredRole
      });
      
      console.log(`✅ ${userData.name} (${userData.nickname}) 생성 완료`);
    }
    
    console.log('🎉 모든 테스트 사용자 생성 완료!');
    console.log('👥 생성된 사용자들:');
    createdUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.nickname}): ${user.id}`);
    });
    
    return createdUsers;
    
  } catch (error) {
    console.error('❌ 테스트 사용자 생성 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 특정 프로젝트에 테스트 사용자들을 팀원으로 추가하는 함수
async function addTestUsersToProject(projectId, userIds) {
  console.log(`🏗️ 프로젝트 ${projectId}에 테스트 사용자들 추가...`);
  
  try {
    const members = [];
    
    for (const userId of userIds) {
      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId,
          role: 'member',
          interviewStatus: 'PENDING'
        }
      });
      members.push(member);
      console.log(`✅ 사용자 ${userId}를 프로젝트에 추가`);
    }
    
    console.log('🎉 모든 테스트 사용자를 프로젝트에 추가 완료!');
    return members;
    
  } catch (error) {
    console.error('❌ 프로젝트 멤버 추가 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 테스트 사용자들의 면담을 자동 완료하는 함수
async function completeTestInterviews(projectId, userData) {
  console.log(`📝 프로젝트 ${projectId}의 테스트 면담 자동 완료...`);
  
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });
    
    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }
    
    for (const member of project.members) {
      const userTestData = userData.find(u => u.id === member.userId);
      if (!userTestData) continue;
      
      // 면담 데이터 생성
      const memberProfile = {
        skillScores: userTestData.skillProfile,
        workStyles: userTestData.workStyles,
        preferredRole: userTestData.preferredRole,
        leadershipLevel: userTestData.workStyles.includes('리더십형') ? 'preferred' : 'interested',
        projectMotivation: `${userTestData.preferredRole} 개발자로서 팀에 기여하고 싶습니다.`
      };
      
      await prisma.projectMember.update({
        where: { id: member.id },
        data: {
          memberProfile,
          interviewStatus: 'COMPLETED'
        }
      });
      
      console.log(`✅ ${member.user.name}의 면담 완료`);
    }
    
    console.log('🎉 모든 테스트 면담 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 면담 완료 중 오류:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  const command = process.argv[2];
  const projectId = process.argv[3];
  
  if (command === 'create-users') {
    createTestUsers().catch(console.error);
  } else if (command === 'add-to-project' && projectId) {
    // 사용자 ID들을 하드코딩하거나 별도로 전달받아야 함
    console.log('프로젝트 ID:', projectId);
    console.log('먼저 create-users를 실행해서 사용자를 생성한 후, 생성된 ID들을 사용하세요.');
  } else if (command === 'complete-interviews' && projectId) {
    console.log('면담 완료 기능은 별도 구현 필요');
  } else {
    console.log('사용법:');
    console.log('  node create-test-users.js create-users');
    console.log('  node create-test-users.js add-to-project <프로젝트ID>');
    console.log('  node create-test-users.js complete-interviews <프로젝트ID>');
  }
}

module.exports = { createTestUsers, addTestUsersToProject, completeTestInterviews };