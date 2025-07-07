import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// 요청 본문의 유효성 검사를 위한 Zod 스키마
const projectSetupSchema = z.object({
  projectName: z.string().min(1, "Project name is required."),
  projectGoal: z.string().min(1, "Project goal is required."),
  consultationData: z.any(), // AI 상담 내용은 유연하게 받음
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validation = projectSetupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors }, { status: 400 });
    }

    const { projectName, projectGoal, consultationData } = validation.data;

    const newProject = await db.project.create({
      data: {
        name: projectName,
        goal: projectGoal,
        ownerId: session.user.id,
        status: 'PENDING', // 새로운 Enum 값 사용
        consultationData: consultationData,
        members: {
          create: [
            {
              userId: session.user.id, // 프로젝트 생성자를 멤버로 자동 추가
            },
          ],
        },
      },
    });

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error('Error creating initial project:', error);
    return NextResponse.json({ message: 'An internal error occurred.' }, { status: 500 });
  }
}