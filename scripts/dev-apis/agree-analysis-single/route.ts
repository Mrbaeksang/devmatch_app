import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, userName } = await req.json();

    if (!projectId || !userName) {
      return NextResponse.json({ error: 'Project ID and user name are required' }, { status: 400 });
    }

    // 프로젝트와 멤버 정보 가져오기
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

    const member = project.members.find(m => m.user.name === userName);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 면담이 완료되지 않은 경우
    if (member.interviewStatus !== 'COMPLETED') {
      return NextResponse.json({ error: '면담을 먼저 완료해야 합니다' }, { status: 400 });
    }

    // 이미 동의한 경우
    if (member.agreedToAnalysis) {
      return NextResponse.json({ error: '이미 분석에 동의했습니다' }, { status: 400 });
    }

    // 분석 동의 처리
    await db.projectMember.update({
      where: { id: member.id },
      data: {
        agreedToAnalysis: true
      }
    });

    // 모든 멤버가 동의했는지 확인
    const updatedProject = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    const allAgreed = updatedProject!.members.every(m => m.agreedToAnalysis);
    const agreedCount = updatedProject!.members.filter(m => m.agreedToAnalysis).length;

    // 모든 멤버가 동의했고 팀이 가득 찼으면 분석 시작
    if (allAgreed && updatedProject!.members.length === updatedProject!.teamSize) {
      await db.project.update({
        where: { id: projectId },
        data: {
          status: 'ANALYZING'
        }
      });

      // 자동으로 분석 API 호출
      try {
        const analysisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/projects/${projectId}/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Request': 'true'
          }
        });

        if (!analysisResponse.ok) {
          console.error('자동 분석 호출 실패:', await analysisResponse.text());
        } else {
          console.log('자동 분석 성공적으로 시작됨');
        }
      } catch (error) {
        console.error('자동 분석 호출 중 오류:', error);
      }

      return NextResponse.json({
        success: true,
        message: `${userName}님이 분석에 동의했습니다! 모든 팀원이 동의하여 분석을 시작합니다.`,
        allAgreed: true,
        agreedCount,
        totalCount: updatedProject!.members.length
      });
    }

    return NextResponse.json({
      success: true,
      message: `${userName}님이 분석에 동의했습니다!`,
      allAgreed: false,
      agreedCount,
      totalCount: updatedProject!.members.length
    });

  } catch (error) {
    console.error('Agree analysis single error:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis agreement' },
      { status: 500 }
    );
  }
}