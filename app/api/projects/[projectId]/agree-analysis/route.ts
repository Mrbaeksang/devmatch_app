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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // 프로젝트 멤버 확인
    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id
      }
    });

    if (!projectMember) {
      return NextResponse.json({ error: '프로젝트 멤버가 아닙니다.' }, { status: 403 });
    }

    // 면담 완료 확인
    if (projectMember.interviewStatus !== 'COMPLETED') {
      return NextResponse.json({ error: '면담을 먼저 완료해주세요.' }, { status: 400 });
    }

    // 이미 동의한 경우
    if (projectMember.agreedToAnalysis) {
      return NextResponse.json({ message: '이미 분석에 동의하셨습니다.' }, { status: 200 });
    }

    // 분석 동의 업데이트
    await db.projectMember.update({
      where: { id: projectMember.id },
      data: { agreedToAnalysis: true }
    });

    // 프로젝트의 모든 멤버 확인
    const allMembers = await db.projectMember.findMany({
      where: { projectId },
      include: { user: true }
    });

    // 모든 멤버가 면담을 완료하고 분석에 동의했는지 확인
    const allAgreed = allMembers.every(
      member => member.interviewStatus === 'COMPLETED' && member.agreedToAnalysis
    );

    // 모든 멤버가 동의한 경우 분석 시작
    if (allAgreed) {
      // 프로젝트 상태를 ANALYZING으로 변경
      await db.project.update({
        where: { id: projectId },
        data: { status: 'ANALYZING' }
      });

      // 비동기로 분석 시작 (응답은 즉시 반환)
      startAnalysisInBackground(projectId);

      return NextResponse.json({
        success: true,
        allAgreed: true,
        message: '모든 팀원이 동의하여 분석을 시작합니다.',
        agreedCount: allMembers.length,
        totalCount: allMembers.length
      });
    }

    // 동의한 멤버 수 계산
    const agreedCount = allMembers.filter(
      member => member.interviewStatus === 'COMPLETED' && member.agreedToAnalysis
    ).length;

    return NextResponse.json({
      success: true,
      allAgreed: false,
      message: '분석 동의가 완료되었습니다.',
      agreedCount,
      totalCount: allMembers.length
    });

  } catch (error) {
    console.error('분석 동의 오류:', error);
    return NextResponse.json(
      { 
        error: '분석 동의 처리 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// 백그라운드에서 분석 실행
async function startAnalysisInBackground(projectId: string) {
  try {
    // 분석 API 호출
    const analysisUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/projects/${projectId}/analyze`;
    
    const response = await fetch(analysisUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 내부 API 호출용 특별한 헤더 (선택사항)
        'X-Internal-Request': 'true'
      }
    });

    if (!response.ok) {
      console.error('분석 API 호출 실패:', await response.text());
    } else {
      console.log('분석이 성공적으로 시작되었습니다:', projectId);
    }
  } catch (error) {
    console.error('백그라운드 분석 실행 오류:', error);
  }
}