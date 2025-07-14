// app/api/projects/[projectId]/reset-interviews/route.ts
// 프로젝트의 모든 멤버 면담을 초기화하는 API 엔드포인트

import { NextResponse } from 'next/server';
import { InterviewService } from '@/lib/services/interview.service';
import { ErrorHandler } from '@/lib/errors/handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // 인증 확인 (개발자 전용 기능)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ErrorHandler.handleUnauthorized();
    }

    const projectId = params.projectId;
    if (!projectId) {
      return ErrorHandler.handleBadRequest('Project ID가 필요합니다.');
    }

    // 프로젝트 존재 여부 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true }
    });

    if (!project) {
      return ErrorHandler.handleNotFound('프로젝트를 찾을 수 없습니다.');
    }

    // 개발 중에는 모든 프로젝트 멤버가 초기화할 수 있도록 허용
    // 실제 운영에서는 프로젝트 소유자만 가능하도록 제한 필요
    const isMember = await db.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: session.user.id
      }
    });

    if (!isMember) {
      return ErrorHandler.handleForbidden('프로젝트 멤버만 접근 가능합니다.');
    }

    // 면담 초기화 실행
    const resetCount = await InterviewService.resetInterviewsForProject(projectId);

    return NextResponse.json({ 
      success: true,
      message: `${resetCount}명의 멤버 면담이 성공적으로 초기화되었습니다.`,
      resetCount
    });
  } catch (error) {
    console.error('면담 초기화 API 오류:', error);
    return ErrorHandler.handleInternalError(error);
  }
}