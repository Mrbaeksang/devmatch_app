// 특정 프로젝트를 완전히 삭제하는 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteProject() {
    const projectId = 'cmd0m2oof0005u8l4vj4d3kt0';
    
    try {
        console.log('🗑️ 프로젝트 삭제 시작...');
        console.log(`프로젝트 ID: ${projectId}`);
        
        // 1. 관련 데이터 확인
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: true,
                chatMessages: true
            }
        });
        
        if (!project) {
            console.log('❌ 프로젝트를 찾을 수 없습니다.');
            return;
        }
        
        console.log(`📋 삭제할 프로젝트: ${project.name}`);
        console.log(`👥 연결된 멤버: ${project.members.length}명`);
        console.log(`💬 채팅 메시지: ${project.chatMessages.length}개`);
        
        // 2. 연관 데이터 삭제 (Cascade로 자동 삭제되지만 명시적으로)
        
        // 추천 역할 삭제
        const recommendedRoles = await prisma.recommendedRole.deleteMany({
            where: { projectId: projectId }
        });
        console.log(`🎯 추천 역할 삭제: ${recommendedRoles.count}개`);
        
        // 역할 삭제
        const roles = await prisma.role.deleteMany({
            where: { projectId: projectId }
        });
        console.log(`📝 역할 삭제: ${roles.count}개`);
        
        // 초대 링크 삭제
        const inviteLinks = await prisma.inviteLink.deleteMany({
            where: { projectId: projectId }
        });
        console.log(`🔗 초대 링크 삭제: ${inviteLinks.count}개`);
        
        // 채팅 메시지 삭제
        const chatMessages = await prisma.chatMessage.deleteMany({
            where: { projectId: projectId }
        });
        console.log(`💬 채팅 메시지 삭제: ${chatMessages.count}개`);
        
        // 프로젝트 멤버 삭제
        const projectMembers = await prisma.projectMember.deleteMany({
            where: { projectId: projectId }
        });
        console.log(`👥 프로젝트 멤버 삭제: ${projectMembers.count}개`);
        
        // 3. 프로젝트 삭제
        const deletedProject = await prisma.project.delete({
            where: { id: projectId }
        });
        
        console.log('✅ 프로젝트 삭제 완료!');
        console.log(`삭제된 프로젝트: ${deletedProject.name}`);
        
        // 4. 최종 확인
        console.log('\n📊 삭제 후 상태:');
        const remainingProjects = await prisma.project.count();
        console.log(`남은 프로젝트: ${remainingProjects}개`);
        
    } catch (error) {
        console.error('❌ 삭제 중 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteProject();