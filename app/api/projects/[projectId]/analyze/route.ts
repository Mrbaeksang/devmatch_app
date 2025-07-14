// app/api/projects/[projectId]/analyze/route.ts
// 팀 분석 API 라우트 (모듈화 버전)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TeamAnalysisService } from '@/lib/services/team-analysis.service';
import { ErrorHandler, ApiErrorCode } from '@/lib/errors';

/**
 * 팀 분석 실행 API
 * POST /api/projects/[projectId]/analyze
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // 내부 요청 확인 (agree-analysis에서 호출)
    const isInternalRequest = req.headers.get('X-Internal-Request') === 'true';
    
    if (!isInternalRequest) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return ErrorHandler.createErrorResponse(
          ApiErrorCode.AUTH_REQUIRED
        );
      }
    }

    const { projectId } = await params;

    // 팀 분석 서비스 호출
    const analysisResult = await TeamAnalysisService.analyzeTeam({ projectId });

    console.log(`✅ 팀 분석 완료: ${projectId}`);

    return NextResponse.json({
      success: true,
      teamAnalysis: analysisResult.teamAnalysis,
      memberAnalysis: analysisResult.memberAnalysis,
      message: '팀 분석이 완료되었습니다.'
    });

  } catch (error) {
    console.error('팀 분석 오류:', error);
    
    // 에러 메시지에 따른 적절한 응답
    const errorMessage = error instanceof Error ? error.message : '팀 분석 중 오류가 발생했습니다.';
    
    if (errorMessage.includes('찾을 수 없습니다')) {
      return ErrorHandler.createErrorResponse(
        ApiErrorCode.RESOURCE_NOT_FOUND
      );
    }
    
    if (errorMessage.includes('완료되어야')) {
      return ErrorHandler.createErrorResponse(
        ApiErrorCode.VALIDATION_FAILED
      );
    }
    
    return ErrorHandler.createErrorResponse(
      ApiErrorCode.SYSTEM_ERROR
    );
  }
}