// app/api/chat/route.ts
// 간소화된 AI 상담 API Route (모듈화 후)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ConsultationService } from '@/lib/services/consultation.service';
import { ConsultationRequest } from '@/lib/types/consultation.types';

/**
 * AI 상담 API 엔드포인트 (데피 시스템)
 * 비즈니스 로직은 ConsultationService로 위임
 */
export async function POST(req: Request) {
  try {
    // 1. 세션 확인 (선택적 - 상담은 로그인 없이도 가능)
    const session = await getServerSession(authOptions);
    
    // 2. 요청 데이터 파싱
    const requestData: ConsultationRequest = await req.json();
    const { userInput, collectedData, chatHistory } = requestData;

    // 3. 입력 검증
    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: '사용자 입력이 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🤖 AI 상담 요청:', {
      userInput: userInput.substring(0, 50) + '...',
      collectedDataKeys: Object.keys(collectedData || {}),
      historyLength: chatHistory?.length || 0,
      userId: session?.user?.id || 'anonymous'
    });

    // 4. 데피 AI 상담 진행 (비즈니스 로직은 서비스에서 처리)
    const response = await ConsultationService.conductConsultation(requestData, session?.user?.id);

    console.log('✅ AI 상담 응답:', {
      responseLength: response.response.length,
      isComplete: response.isComplete,
      hasProjectId: !!response.projectId
    });

    // 프로젝트가 생성된 경우 projectCreated 플래그 추가
    const apiResponse = {
      ...response,
      projectCreated: !!response.projectId
    };

    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('AI 상담 API 오류:', error);
    
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

      if (error.message.includes('프로젝트 생성')) {
        return NextResponse.json(
          { error: '프로젝트 생성에 실패했습니다. 다시 시도해주세요.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: '상담 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}