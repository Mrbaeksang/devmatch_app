/**
 * 면담 페이지 무응답 문제 디버깅 스크립트
 * 
 * 사용법: node scripts/debug-interview-page.js <projectId> <memberId>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugInterviewPage(projectId, memberId) {
  console.log('\n=== 면담 페이지 디버깅 시작 ===\n');
  
  try {
    // 1. 프로젝트 존재 여부 확인
    console.log('1. 프로젝트 확인...');
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });
    
    if (!project) {
      console.error('❌ 프로젝트를 찾을 수 없습니다:', projectId);
      return;
    }
    console.log('✅ 프로젝트 찾음:', project.name);
    
    // 2. 멤버 존재 여부 확인
    console.log('\n2. 멤버 확인...');
    const member = project.members.find(m => m.id === memberId);
    
    if (!member) {
      console.error('❌ 멤버를 찾을 수 없습니다:', memberId);
      console.log('   현재 멤버 목록:');
      project.members.forEach(m => {
        console.log(`   - ${m.id}: ${m.name} (${m.role})`);
      });
      return;
    }
    console.log('✅ 멤버 찾음:', member.name);
    console.log('   - 역할:', member.role);
    console.log('   - 면담 상태:', member.interviewStatus);
    console.log('   - 면담 완료 시간:', member.interviewCompletedAt);
    
    // 3. 면담 완료 여부 확인
    console.log('\n3. 면담 상태 분석...');
    if (member.interviewStatus === 'COMPLETED') {
      console.log('⚠️  이미 완료된 면담입니다!');
      console.log('   완료 시간:', member.interviewCompletedAt);
      console.log('   → 페이지는 3초 후 대기실로 리다이렉트됩니다.');
    } else {
      console.log('✅ 면담 진행 가능 상태');
    }
    
    // 4. 프로젝트 전체 상태 확인
    console.log('\n4. 프로젝트 전체 상태...');
    console.log('   - 멤버 수:', project.members.length);
    console.log('   - 면담 완료 수:', project.members.filter(m => m.interviewStatus === 'COMPLETED').length);
    console.log('   - 프로젝트 상태:', project.status);
    
    // 5. 권장 사항
    console.log('\n5. 디버깅 권장 사항:');
    console.log('   - 브라우저 개발자 도구에서 Console 탭 확인');
    console.log('   - Network 탭에서 API 요청 확인');
    console.log('   - React StrictMode 비활성화 테스트');
    console.log('   - 로컬 스토리지 클리어 후 재시도');
    
    // 6. 테스트 URL 제공
    console.log('\n6. 테스트 URL:');
    console.log(`   http://localhost:3000/projects/${projectId}/interview?memberId=${memberId}`);
    
  } catch (error) {
    console.error('\n❌ 디버깅 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
const [,, projectId, memberId] = process.argv;

if (!projectId || !memberId) {
  console.log('사용법: node scripts/debug-interview-page.js <projectId> <memberId>');
  process.exit(1);
}

debugInterviewPage(projectId, memberId);