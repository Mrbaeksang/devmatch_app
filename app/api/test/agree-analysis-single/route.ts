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

    // 멤버 찾기
    const member = await db.projectMember.findFirst({
      where: {
        projectId,
        user: {
          name: userName
        }
      }
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // 분석 동의 처리
    await db.projectMember.update({
      where: { id: member.id },
      data: {
        agreedToAnalysis: true
      }
    });

    // 모든 멤버가 동의했는지 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const agreedCount = project.members.filter(m => m.agreedToAnalysis).length;
    const allAgreed = agreedCount === project.teamSize;

    // 모두 동의했으면 분석 시작
    if (allAgreed) {
      await db.project.update({
        where: { id: projectId },
        data: { status: 'ANALYZING' }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${userName}님이 분석에 동의했습니다!`,
      agreedCount,
      totalCount: project.teamSize,
      allAgreed
    });

  } catch (error) {
    console.error('Agree analysis single error:', error);
    return NextResponse.json(
      { error: 'Failed to agree analysis' },
      { status: 500 }
    );
  }
}