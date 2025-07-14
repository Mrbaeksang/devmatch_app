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

    // 면담 초기화
    await db.projectMember.update({
      where: { id: member.id },
      data: {
        interviewStatus: 'PENDING',
        memberProfile: {
          skillScores: {},
          roleAptitudes: {},
          workStyles: []
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${userName}님의 면담이 초기화되었습니다!`
    });

  } catch (error) {
    console.error('Reset single interview error:', error);
    return NextResponse.json(
      { error: 'Failed to reset interview' },
      { status: 500 }
    );
  }
}