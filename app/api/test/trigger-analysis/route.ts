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

    // 프로젝트가 ANALYZING 상태인지 확인
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.status !== 'ANALYZING') {
      return NextResponse.json({ error: 'Project is not in ANALYZING state' }, { status: 400 });
    }

    // 가짜 분석 결과 생성
    const mockAnalysis = {
      analysisDate: new Date().toISOString(),
      teamComposition: {
        frontend: ['김프론트'],
        backend: ['박백엔드'],
        fullstack: ['이풀스택']
      },
      teamStrengths: [
        '프론트엔드와 백엔드 역할이 명확히 구분됨',
        '각 분야별 전문가가 균형있게 배치됨',
        '협업과 독립 작업 스타일이 조화롭게 구성됨'
      ],
      recommendations: [
        '김프론트는 UI/UX 설계를 주도하면 좋습니다',
        '박백엔드는 시스템 아키텍처 설계를 담당하세요',
        '이풀스택은 양쪽을 연결하는 브릿지 역할을 추천합니다'
      ]
    };

    // 분석 완료 처리
    await db.project.update({
      where: { id: projectId },
      data: {
        status: 'ACTIVE',
        teamAnalysis: mockAnalysis
      }
    });

    return NextResponse.json({
      success: true,
      message: '팀 분석이 완료되었습니다!',
      analysis: mockAnalysis
    });

  } catch (error) {
    console.error('Trigger analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger analysis' },
      { status: 500 }
    );
  }
}