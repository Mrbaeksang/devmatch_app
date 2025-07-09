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
    console.log('Received project setup request:', JSON.stringify(body, null, 2));
    
    // 데이터 검증 전 디버깅
    console.log('projectName:', body.projectName);
    console.log('projectGoal:', body.projectGoal);
    console.log('consultationData:', body.consultationData);
    
    const validation = projectSetupSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      console.error('Received data that failed validation:', body);
      return NextResponse.json({ 
        message: 'Validation failed',
        errors: validation.error.errors,
        receivedData: body
      }, { status: 400 });
    }

    const { projectName, projectGoal, consultationData } = validation.data;

    const newProject = await db.project.create({
      data: {
        name: projectName,
        description: projectGoal, // description 필드 추가
        goal: projectGoal,
        ownerId: session.user.id,
        status: 'RECRUITING', // PENDING 대신 RECRUITING 사용
        consultationData: consultationData,
      },
    });

    // 프로젝트 생성 후 멤버로 추가
    await db.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    console.error('Error creating initial project:', error);
    
    // Prisma 에러 구분
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ message: 'Project already exists with this name.' }, { status: 409 });
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ message: 'Invalid user reference.' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      message: 'An internal error occurred while creating the project.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}