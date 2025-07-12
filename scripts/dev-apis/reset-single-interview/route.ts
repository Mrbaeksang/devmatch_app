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
          where: {
            user: { name: userName }
          },
          include: { user: true }
        }
      }
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Project or member not found' }, { status: 404 });
    }

    const member = project.members[0];
    
    // 면담이 완료되지 않은 경우
    if (member.interviewStatus !== 'COMPLETED') {
      return NextResponse.json({ error: '면담이 완료되지 않았습니다' }, { status: 400 });
    }

    // 면담 초기화
    await db.projectMember.update({
      where: { id: member.id },
      data: {
        interviewStatus: 'PENDING',
        memberProfile: {},
        agreedToAnalysis: false
      }
    });

    return NextResponse.json({
      success: true,
      message: `${userName}님의 면담 데이터가 초기화되었습니다!`
    });

  } catch (error) {
    console.error('Reset single interview error:', error);
    return NextResponse.json(
      { error: 'Failed to reset interview' },
      { status: 500 }
    );
  }
}