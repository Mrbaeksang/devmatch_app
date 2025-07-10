import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 채팅 메시지 조회 (GET)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 프로젝트 접근 권한 확인
    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id
      }
    });

    if (!projectMember) {
      return NextResponse.json({ error: '프로젝트 접근 권한이 없습니다.' }, { status: 403 });
    }

    // 채팅 메시지 조회
    const messages = await db.chatMessage.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json({
      messages: messages.reverse(), // 시간순 정렬
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('채팅 메시지 조회 오류:', error);
    
    return NextResponse.json(
      { 
        error: '채팅 메시지를 불러오는 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}

// 채팅 메시지 전송 (POST)
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
    const { content, type = 'USER' } = await req.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: '메시지 내용이 필요합니다.' }, { status: 400 });
    }

    // 프로젝트 접근 권한 확인
    const projectMember = await db.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id
      }
    });

    if (!projectMember) {
      return NextResponse.json({ error: '프로젝트 접근 권한이 없습니다.' }, { status: 403 });
    }

    // 메시지 생성
    const message = await db.chatMessage.create({
      data: {
        projectId,
        userId: session.user.id,
        content: content.trim(),
        type
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json(message);

  } catch (error) {
    console.error('채팅 메시지 전송 오류:', error);
    
    return NextResponse.json(
      { 
        error: '메시지 전송 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}