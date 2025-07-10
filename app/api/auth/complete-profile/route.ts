import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// 요청 검증 스키마
const completeProfileSchema = z.object({
  nickname: z.string()
    .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
    .max(15, '닉네임은 최대 15자까지 가능합니다.')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다.'),
  avatar: z.string().min(1, '아바타를 선택해주세요.'), // DiceBear 설정 JSON 문자열
  bio: z.string().max(100, '자기소개는 100자 이하로 입력해주세요.').optional()
});

export async function POST(req: Request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // 요청 데이터 검증
    const { nickname, avatar, bio } = completeProfileSchema.parse(body);

    // 현재 사용자 정보 확인
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 프로필을 완성한 사용자인지 확인
    if (currentUser.isCompleted) {
      return NextResponse.json(
        { error: '이미 프로필이 완성된 사용자입니다.' },
        { status: 400 }
      );
    }

    // 닉네임 중복 확인 (자신 제외)
    const existingUser = await db.user.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: 'insensitive'
        },
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 닉네임입니다.' },
        { status: 400 }
      );
    }

    // 프로필 업데이트
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        nickname,
        avatar,
        bio: bio || null,
        isCompleted: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        nickname: true,
        avatar: true,
        bio: true,
        isCompleted: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '프로필이 성공적으로 완성되었습니다.',
      user: updatedUser
    });

  } catch (error) {
    console.error('프로필 완성 오류:', error);
    
    // Zod 검증 오류
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Prisma 중복 키 오류
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: '이미 사용 중인 닉네임입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '프로필 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}