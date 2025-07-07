import { getServerSession } from 'next-auth';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// @ts-expect-error // TypeScript "params 암시적 any" 경고 무시
export async function POST(_req: Request, { params }) {
  try {
    const { projectId } = params as { projectId: string };

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const project = await db.project.findFirst({
      where: { id: projectId, ownerId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found or you are not the owner' }, { status: 404 });
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const inviteLink = await db.inviteLink.create({
      data: {
        projectId: projectId,
        code: nanoid(16),
        expiresAt: expiresAt,
      },
    });

    return NextResponse.json(inviteLink, { status: 201 });
  } catch (error) {
    console.error('Error creating invite link:', error);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}
