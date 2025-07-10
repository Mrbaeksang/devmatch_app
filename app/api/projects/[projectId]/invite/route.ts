import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { projectId } = await params;

    // 프로젝트 확인 (소유자 개념 제거됨)
    const project = await db.project.findUnique({
      where: {
        id: projectId
      },
      include: {
        members: {
          where: {
            userId: session.user.id
          }
        }
      }
    });

    if (!project || project.members.length === 0) {
      return new NextResponse('Project not found or you are not a member', { status: 404 });
    }

    // 고유한 초대 코드 생성
    const code = nanoid(10); // 10자리의 고유 코드

    // 만료일 설정 (예: 7일 후)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const inviteLink = await db.inviteLink.create({
      data: {
        projectId,
        code,
        expiresAt,
      },
    });

    return NextResponse.json({
      message: 'Invite link created successfully',
      inviteLink: {
        id: inviteLink.id,
        code: inviteLink.code,
        expiresAt: inviteLink.expiresAt,
        url: `${process.env.NEXTAUTH_URL}/projects/join/${inviteLink.code}`,
      },
    });
  } catch (error) {
    console.error('[PROJECT_INVITE_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
