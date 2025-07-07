import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectGoal, consultationData } = await req.json();

    if (!projectGoal || !consultationData) {
      return NextResponse.json({ message: 'Project goal and consultation data are required' }, { status: 400 });
    }

    // 프로젝트 초기 정보 저장 (status는 INITIAL_CONSULTATION으로 설정)
    const project = await db.project.create({
      data: {
        name: "새로운 프로젝트 (임시)", // 초기에는 임시 이름 사용
        goal: projectGoal,
        ownerId: session.user.id,
        status: ProjectStatus.INITIAL_CONSULTATION,
        consultationData: consultationData,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error('프로젝트 초기 설정 API 오류:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}