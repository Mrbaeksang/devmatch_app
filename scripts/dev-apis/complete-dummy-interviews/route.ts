import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 테스트용 사용자별 면담 데이터
const testInterviewData = {
  'frontend.kim@test.com': {
    skillScores: {
      React: 4,
      JavaScript: 4,
      TypeScript: 3,
      'HTML/CSS': 5,
      Git: 4,
      'Node.js': 2
    },
    workStyles: ['협업소통형', '창의주도형'],
    preferredRole: 'frontend',
    leadershipLevel: 'interested',
    projectMotivation: 'React 전문가로서 팀에 기여하고 싶습니다. 사용자 경험을 중시하며 깔끔한 UI를 만들어가겠습니다.',
    leadershipExperience: [],
    leadershipMotivation: '',
    strongSkills: ['React', 'UI/UX 디자인', 'JavaScript'],
    learningGoals: ['TypeScript 심화', 'Next.js 최적화']
  },
  'backend.park@test.com': {
    skillScores: {
      'Node.js': 5,
      Java: 4,
      Python: 3,
      MySQL: 4,
      PostgreSQL: 3,
      Git: 5,
      React: 2
    },
    workStyles: ['체계관리형', '문제해결형'],
    preferredRole: 'backend',
    leadershipLevel: 'preferred',
    projectMotivation: '안정적인 백엔드 시스템 구축에 기여하고 싶습니다. 서버 개발과 데이터베이스 설계가 전문분야입니다.',
    leadershipExperience: ['대학교 팀 프로젝트 리더', '인턴십 프로젝트 팀장'],
    leadershipMotivation: '체계적인 프로젝트 관리와 기술적 리더십을 발휘하고 싶습니다.',
    strongSkills: ['서버 아키텍처', 'API 설계', 'Database 설계'],
    learningGoals: ['클라우드 배포', 'DevOps']
  },
  'fullstack.lee@test.com': {
    skillScores: {
      React: 3,
      'Node.js': 4,
      JavaScript: 4,
      TypeScript: 3,
      Python: 3,
      Git: 5,
      PostgreSQL: 3
    },
    workStyles: ['리더십형', '협업소통형'],
    preferredRole: 'fullstack',
    leadershipLevel: 'experienced',
    projectMotivation: '프론트엔드와 백엔드 모두 다룰 수 있는 풀스택 개발자로서 팀의 전반적인 기술 조율을 도맡고 싶습니다.',
    leadershipExperience: ['스타트업 CTO', '오픈소스 프로젝트 메인테이너'],
    leadershipMotivation: '팀원들의 성장을 도우며 프로젝트의 성공을 이끌고 싶습니다.',
    strongSkills: ['풀스택 개발', '팀 리더십', 'Git 관리'],
    learningGoals: ['최신 프레임워크', '팀 매니지먼트']
  }
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 프로젝트 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 프로젝트 소유자 확인
    const isOwner = project.members.some(member => 
      member.userId === session.user.id && member.role === 'owner'
    );

    if (!isOwner) {
      return NextResponse.json({ error: 'Only project owner can complete test interviews' }, { status: 403 });
    }

    console.log('📝 테스트 면담 자동 완료 시작...');
    
    const completedInterviews = [];

    for (const member of project.members) {
      if (!member.user?.email) continue;
      
      const testData = testInterviewData[member.user.email as keyof typeof testInterviewData];
      if (!testData) continue;

      // 이미 완료된 면담인지 확인
      if (member.interviewStatus === 'COMPLETED') {
        console.log(`ℹ️ ${member.user.name}의 면담은 이미 완료됨`);
        continue;
      }

      // 면담 완료 처리
      await db.projectMember.update({
        where: { id: member.id },
        data: {
          memberProfile: testData,
          interviewStatus: 'COMPLETED'
        }
      });

      completedInterviews.push({
        memberId: member.id,
        userName: member.user.name,
        memberProfile: testData
      });

      console.log(`✅ ${member.user.name}의 면담 완료`);
    }

    // 모든 면담이 완료되었는지 확인
    const allMembers = await db.projectMember.findMany({
      where: { projectId }
    });

    const allInterviewsCompleted = allMembers.every(m => m.interviewStatus === 'COMPLETED');

    if (allInterviewsCompleted) {
      console.log('🎉 모든 면담 완료 - 프로젝트 상태 업데이트 가능');
    }

    console.log('🎉 테스트 면담 자동 완료 완료!');

    return NextResponse.json({
      success: true,
      message: '테스트 면담이 성공적으로 완료되었습니다.',
      completedInterviews,
      allInterviewsCompleted,
      totalMembers: allMembers.length,
      completedMembers: allMembers.filter(m => m.interviewStatus === 'COMPLETED').length
    });

  } catch (error) {
    console.error('❌ 테스트 면담 완료 중 오류:', error);
    
    return NextResponse.json({
      error: '테스트 면담 완료 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}