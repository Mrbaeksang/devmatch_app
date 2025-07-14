// 면담 API 테스트 스크립트
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testInterview() {
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
    console.log(`현재 프로필:`, member.memberProfile);

    // 2. 면담 API 호출 시뮬레이션
    console.log('\n📡 API 호출 시뮬레이션:');
    
    const testRequest = {
      userInput: 'JavaScript는 5점 정도 할 수 있어요. 실무에서 사용해봤습니다.',
      projectId: project.id,
      memberId: member.id,
      chatHistory: [
        { role: 'ai', content: '안녕하세요! JavaScript 실력은 어느 정도인가요?' }
      ],
      memberProfile: {
        skillScores: {},
        roleAptitudes: {},
        workStyles: []
      }
    };

    console.log('요청 데이터:', JSON.stringify(testRequest, null, 2));

    // 3. InterviewService 직접 호출 테스트
    const { InterviewService } = require('../lib/services/interview.service');
    
    console.log('\n🔧 InterviewService 테스트:');
    try {
      const response = await InterviewService.conductInterview(testRequest);
      console.log('응답:', JSON.stringify(response, null, 2));
      
      // 4. DB 상태 확인
      const updatedMember = await prisma.projectMember.findUnique({
        where: { id: member.id }
      });
      
      console.log('\n📊 업데이트된 멤버 정보:');
      console.log('면담 상태:', updatedMember.interviewStatus);
      console.log('프로필:', updatedMember.memberProfile);
      
    } catch (error) {
      console.error('InterviewService 오류:', error);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInterview();