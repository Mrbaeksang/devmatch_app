// 특정 프로젝트의 모든 데이터를 상세하게 조회하는 스크립트
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProjectData() {
    const projectId = 'cmd19cimn0000u839zfiu4w98';
    
    try {
        console.log('🎯 프로젝트 상세 데이터 조회');
        console.log('='.repeat(60));
        
        // 1. 프로젝트 기본 정보
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                chatMessages: true
            }
        });
        
        if (!project) {
            console.log('❌ 프로젝트를 찾을 수 없습니다.');
            return;
        }
        
        console.log('📋 **프로젝트 기본 정보**');
        console.log(`이름: ${project.name}`);
        console.log(`초대코드: ${project.inviteCode}`);
        console.log(`팀 크기: ${project.teamSize}명`);
        console.log(`상태: ${project.status}`);
        console.log(`생성일: ${project.createdAt}`);
        console.log('');
        
        // 2. 블루프린트 (AI 상담 결과)
        console.log('🤖 **AI 상담 결과 (Blueprint)**');
        if (project.blueprint) {
            console.log('블루프린트 데이터:');
            console.log(JSON.stringify(project.blueprint, null, 2));
        } else {
            console.log('❌ 블루프린트 없음');
        }
        console.log('');
        
        // 3. 기술 스택
        console.log('💻 **기술 스택**');
        console.log(JSON.stringify(project.techStack, null, 2));
        console.log('');
        
        // 4. 팀원 정보
        console.log('👥 **팀원 정보**');
        console.log(`현재 참여자: ${project.members.length}명`);
        for (const member of project.members) {
            console.log(`- ${member.user.name || '이름없음'} (역할: ${member.role || '미정'})`);
            console.log(`  면담 상태: ${member.interviewStatus}`);
            console.log(`  가입일: ${member.joinedAt}`);
            console.log(`  분석 동의: ${member.agreedToAnalysis}`);
            if (member.memberProfile) {
                console.log(`  프로필: ${JSON.stringify(member.memberProfile)}`);
            }
        }
        console.log('');
        
        // 5. 별도 조회: 역할 정보
        console.log('🎯 **역할 정보**');
        let roles = [];
        let recommendations = [];
        
        try {
            roles = await prisma.role.findMany({
                where: { projectId: projectId }
            });
        } catch (error) {
            console.log(`역할 조회 오류: ${error.message}`);
        }
        
        console.log(`정의된 역할: ${roles.length}개`);
        for (const role of roles) {
            console.log(`- ${role.name}: ${role.description || '설명없음'}`);
        }
        console.log('');
        
        // 6. 별도 조회: AI 추천 역할
        console.log('🤖 **AI 추천 역할**');
        try {
            recommendations = await prisma.recommendedRole.findMany({
                where: { projectId: projectId },
                include: {
                    User: true,
                    Role: true
                }
            });
        } catch (error) {
            console.log(`추천 역할 조회 오류: ${error.message}`);
        }
        
        console.log(`추천 결과: ${recommendations.length}개`);
        for (const recommendation of recommendations) {
            console.log(`- ${recommendation.User.name} → ${recommendation.Role.name}`);
            console.log(`  이유: ${recommendation.reason || '없음'}`);
            console.log(`  추천일: ${recommendation.createdAt}`);
        }
        console.log('');
        
        // 7. AI 분석 결과
        console.log('🔍 **AI 팀 분석 결과**');
        if (project.teamAnalysis) {
            console.log('팀 분석 데이터:');
            console.log(JSON.stringify(project.teamAnalysis, null, 2));
        } else {
            console.log('❌ AI 팀 분석 미완료');
        }
        console.log('');
        
        // 8. 채팅 메시지
        console.log('💬 **채팅 메시지**');
        console.log(`총 메시지: ${project.chatMessages.length}개`);
        if (project.chatMessages.length > 0) {
            const recent = project.chatMessages.slice(-3);
            console.log('최근 3개 메시지:');
            for (const msg of recent) {
                console.log(`- [${msg.type}] ${msg.content.slice(0, 50)}...`);
            }
        }
        console.log('');
        
        // 9. 데이터 무결성 검사
        console.log('🔧 **데이터 무결성 검사**');
        const teamSizeCheck = project.teamSize;
        const currentMembers = project.members.length;
        const definedRoles = roles.length;
        const recommendationCount = recommendations.length;
        
        console.log(`팀 크기 설정: ${teamSizeCheck}명`);
        console.log(`현재 참여자: ${currentMembers}명`);
        console.log(`정의된 역할: ${definedRoles}개`);
        console.log(`AI 추천 결과: ${recommendationCount}개`);
        
        if (project.teamAnalysis) {
            const analysis = project.teamAnalysis;
            console.log('팀 분석 결과 검사...');
            if (typeof analysis === 'object') {
                console.log('분석 결과:', Object.keys(analysis));
            }
        }
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProjectData();
