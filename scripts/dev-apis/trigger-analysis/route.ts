import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 프로젝트 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // ANALYZING 상태인지 확인
    if (project.status !== 'ANALYZING') {
      return NextResponse.json({ error: 'Project is not in analyzing state' }, { status: 400 });
    }

    console.log(`🚀 수동 분석 트리거: ${projectId}`);

    // 분석 API 호출 (내부 요청으로 표시)
    const analysisResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/projects/${projectId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true'
      }
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('분석 API 호출 실패:', errorText);
      throw new Error(`분석 API 호출 실패: ${errorText}`);
    }

    const analysisResult = await analysisResponse.json();
    
    return NextResponse.json({
      success: true,
      message: '팀 분석이 성공적으로 완료되었습니다!',
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Trigger analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger analysis' },
      { status: 500 }
    );
  }
}