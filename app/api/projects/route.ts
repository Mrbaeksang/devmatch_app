import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 서버 시작 시 환경 변수 로드 확인 (터미널에 한 번만 찍힘)
// 이 로그가 잘 찍히지 않는다면, Next.js 서버를 완전히 재시작해야 합니다.
console.log('--- 서버 시작 환경 변수 확인 ---');
console.log('NEXTAUTH_SECRET (서버 시작):', process.env.NEXTAUTH_SECRET ? '✅ 로드됨' : '❌ 로드 안됨');
console.log('NEXTAUTH_SECRET 값 길이 (서버 시작):', process.env.NEXTAUTH_SECRET?.length);
console.log('NEXTAUTH_URL (서버 시작):', process.env.NEXTAUTH_URL);
console.log('----------------------------');


export async function POST(req: Request) {
  // API 요청이 들어올 때마다 찍히는 디버그 로그
  console.log('--- API 요청 디버깅 시작 ---');
  console.log('요청 URL:', req.url);
  console.log('요청 메서드:', req.method);

  // 요청 헤더 디버그 추가
  console.log('요청 헤더:');
  req.headers.forEach((value, key) => {
    // 민감 정보는 마스킹하거나 로깅하지 않도록 주의 (Authorization 헤더 등)
    if (key === 'authorization') {
      console.log(`  ${key}: Bearer [마스킹됨]`);
    } else if (key === 'cookie') {
      console.log(`  ${key}: [쿠키 데이터 마스킹됨]`); // 쿠키도 민감 정보 포함 가능
    }
    else {
      console.log(`  ${key}: ${value}`);
    }
  });

  // API 핸들러 내부에서 환경 변수 재확인 (요청 시점)
  console.log('API 핸들러 내부 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ 로드됨' : '❌ 로드 안됨');
  console.log('API 핸들러 내부 NEXTAUTH_SECRET 값 길이:', process.env.NEXTAUTH_SECRET?.length);


  try {
    const session = await getServerSession(authOptions);
    
    // 디버깅 로그 강화 (기존 유지)
    console.log('=== NextAuth Session Debug ===');
    console.log('Session:', JSON.stringify(session, null, 2)); // 세션 객체 전체를 보기 쉽게 JSON 포맷으로
    console.log('User ID:', session?.user?.id);
    console.log('============================');

    if (!session || !session.user?.id) {
      console.log('❌ 인증 실패: 세션 또는 사용자 ID가 없습니다');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, goal } = await req.json();
    console.log('수신된 요청 본문 (name, goal):', { name, goal }); // 요청 본문 데이터 확인

    if (!name || !goal) {
      console.log('❌ 필수 필드 누락: 프로젝트 이름과 목표가 필요합니다.');
      return NextResponse.json({ message: 'Project name and goal are required' }, { status: 400 });
    }

    console.log('✅ 인증 성공, 프로젝트 생성 시작');
    
    const project = await db.project.create({
      data: {
        name,
        description: goal,
        techStack: {}, // 빈 객체로 초기화
        members: {
          create: {
            userId: session.user.id,
            interviewStatus: 'PENDING'
          },
        },
      },
    });
    
    console.log('✅ 프로젝트 생성 완료:', project.id);
    return NextResponse.json(project, { status: 201 });
    
  } catch (error) {
    console.error('❌ 프로젝트 생성 오류:', error);
    // 에러 객체가 Error 인스턴스인 경우 message 속성을 사용
    // 그렇지 않은 경우 전체 객체 로깅
    if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
    } else {
        console.error('알 수 없는 오류 객체:', error);
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  } finally {
      console.log('--- API 요청 디버깅 종료 ---');
  }
}