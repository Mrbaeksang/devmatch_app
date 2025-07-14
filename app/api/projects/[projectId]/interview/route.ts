// app/api/projects/[projectId]/interview/route.ts
// 간소화된 API Route (모듈화 후)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InterviewService } from '@/lib/services/interview.service';
import { InterviewRequest } from '@/lib/types/interview.types';

/**
 * 면담 API 엔드포인트
 * 비즈니스 로직은 InterviewService로 위임
 */
export async function POST(req: Request) {
  try {
    // 1. 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 요청 데이터 파싱
    const requestData: InterviewRequest = await req.json();
    const { memberId } = requestData;

    // 3. 권한 확인 (본인만 면담 가능)
    const hasAccess = await InterviewService.verifyMemberAccess(memberId, session.user.id);
    if (!hasAccess) {
      return NextResponse.json({ error: '본인의 면담만 진행할 수 있습니다.' }, { status: 403 });
    }

    // 4. 면담 진행 (비즈니스 로직은 서비스에서 처리)
    const response = await InterviewService.conductInterview(requestData);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Interview API Error:', error);
    
    // 에러 타입별 처리
    if (error instanceof Error) {
      if (error.message.includes('OpenRouter') || error.message.includes('API')) {
        return NextResponse.json(
          { error: 'AI 서비스 연결 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return NextResponse.json(
          { error: '데이터베이스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 500 }
        );
      }

      if (error.message.includes('찾을 수 없습니다')) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}