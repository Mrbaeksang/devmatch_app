import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

// 요청 검증 스키마
const checkNicknameSchema = z.object({
  nickname: z.string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(15, '닉네임은 최대 15자까지 가능합니다.')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다.')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 요청 데이터 검증
    const { nickname } = checkNicknameSchema.parse(body);

    // 데이터베이스에서 닉네임 중복 확인
    const existingUser = await db.user.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive' // 대소문자 구분 없이 검색
        }
      }
    });

    return NextResponse.json({
      available: !existingUser,
      nickname
    });

  } catch (error) {
    console.error('닉네임 체크 오류:', error);
    
    // Zod 검증 오류
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid nickname format', 
          details: error.errors[0]?.message || '잘못된 닉네임 형식입니다.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '닉네임 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}