import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // 프로젝트 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로젝트 소유자 또는 멤버 확인
    const isMember = project.members.some(member => member.user.id === session.user.id);
    if (!isMember) {
      return NextResponse.json({ message: '프로젝트 접근 권한이 없습니다.' }, { status: 403 });
    }

    // 분석이 완료되었는지 확인
    if (!project.teamAnalysis || project.status !== 'ACTIVE') {
      return NextResponse.json({ 
        message: '팀 분석이 완료되어야 프로젝트를 시작할 수 있습니다.' 
      }, { status: 400 });
    }

    // 프로젝트 상태를 ACTIVE로 업데이트 (이미 ACTIVE이지만 확실히 하기 위해)
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
        interviewPhase: 'COMPLETED'
      }
    });

    console.log('프로젝트 시작:', {
      projectId,
      projectName: project.name,
      memberCount: project.members.length,
      startedBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      project: {
        id: updatedProject.id,
        name: updatedProject.name,
        status: updatedProject.status,
        startedAt: updatedProject.startedAt
      },
      message: '프로젝트가 시작되었습니다.'
    });

  } catch (error) {
    console.error('프로젝트 시작 오류:', error);
    
    let errorMessage = '프로젝트 시작 중 오류가 발생했습니다.';
    
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        errorMessage = '프로젝트를 찾을 수 없습니다.';
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = '잘못된 프로젝트 ID입니다.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}