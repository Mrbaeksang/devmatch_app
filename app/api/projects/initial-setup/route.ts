import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { ProjectBlueprint } from '@/types/project';

// 요청 본문의 유효성 검사를 위한 Zod 스키마 (확장됨)
const projectSetupSchema = z.object({
  projectName: z.string().min(1, "Project name is required."),
  projectGoal: z.string().min(1, "Project goal is required."),
  consultationData: z.any(), // AI 상담 내용은 유연하게 받음
  
  // 새로운 ProjectBlueprint 데이터 (선택적)
  projectBlueprint: z.object({
    creatorName: z.string(),
    projectName: z.string(),
    projectDescription: z.string(),
    techStack: z.array(z.string()),
    projectType: z.string(),
    complexity: z.enum(['beginner', 'intermediate', 'advanced']),
    duration: z.string(),
    requirements: z.array(z.string()),
    goals: z.array(z.string()),
    teamSize: z.number(),
    preferredRoles: z.array(z.string()),
    aiSuggestedRoles: z.array(z.object({
      roleName: z.string(),
      count: z.number(),
      description: z.string(),
      requirements: z.array(z.string()),
      isLeader: z.boolean(),
    })),
  }).optional(),
});

/**
 * ConsultationData를 ProjectBlueprint로 변환하는 함수
 */
function createProjectBlueprint(consultationData: ConsultationData, creatorName: string): ProjectBlueprint {
  return {
    creatorName,
    projectName: consultationData.projectName || '',
    projectDescription: consultationData.projectGoal || '',
    techStack: Array.isArray(consultationData.techStack) ? consultationData.techStack : (consultationData.techStack ? [consultationData.techStack] : []),
    projectType: 'web-application', // 기본값 설정
    complexity: 'intermediate', // 기본값 설정
    duration: consultationData.duration || consultationData.projectDuration || '',
    requirements: [], // 기본값 설정
    goals: consultationData.projectGoal ? [consultationData.projectGoal] : [],
    teamSize: consultationData.teamMembersCount || 4,
    preferredRoles: [],
    aiSuggestedRoles: (consultationData.aiSuggestedRoles || []).map((role: { role: string; count: number; note?: string }) => ({
      roleName: role.role || role.roleName || '',
      count: role.count || 1,
      description: role.note || role.description || '',
      requirements: role.requirements || [],
      isLeader: role.note?.includes('팀장') || role.note?.includes('리더') || false,
    })),
  };
}

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

    const { projectName, projectGoal, consultationData, projectBlueprint } = validation.data;

    // ProjectBlueprint 생성 또는 사용
    const blueprint = projectBlueprint || createProjectBlueprint(
      consultationData, 
      session.user.name || 'Unknown'
    );

    const newProject = await db.project.create({
      data: {
        name: projectName,
        description: projectGoal, // description 필드 추가
        goal: projectGoal,
        ownerId: session.user.id,
        status: 'RECRUITING', // 새로운 상태 사용
        interviewPhase: 'PENDING', // 면담 단계 초기화
        consultationData: consultationData, // 기존 상담 데이터 유지
        blueprint: blueprint, // 새로운 ProjectBlueprint 저장
        techStack: Array.isArray(consultationData.techStack) ? consultationData.techStack : (consultationData.techStack ? [consultationData.techStack] : []),
      },
    });

    // 프로젝트 생성 후 멤버로 추가 (확장된 필드 포함)
    await db.projectMember.create({
      data: {
        projectId: newProject.id,
        userId: session.user.id,
        consultationCompleted: true, // 생성자는 상담 완료 상태
        interviewStatus: 'COMPLETED', // 생성자는 면담 완료 상태
        role: 'owner', // 생성자 역할
      },
    });

    // 응답에 inviteCode 포함하여 반환
    return NextResponse.json({
      ...newProject,
      inviteCode: newProject.inviteCode,
      blueprint: blueprint,
      success: true,
    }, { status: 201 });

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