import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    // 해당 프로젝트가 존재하고, 요청한 사용자가 소유자인지 확인
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found or you are not the owner' }, { status: 404 });
    }

    // 24시간 후에 만료되는 초대 링크 생성
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inviteLink = await db.inviteLink.create({
      data: {
        projectId: projectId,
        code: nanoid(16), // 16자리의 고유 코드 생성
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json(inviteLink, { status: 201 });

  } catch (error) {
    console.error('Error creating invite link:', error);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}