import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db as prisma } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { projectId, projectGoal, userResponse } = await req.json();

  if (!projectId || !projectGoal || !userResponse) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    // TODO: Gemini API 호출 로직 추가
    // 현재는 임시 데이터 반환
    const roles = [
      { id: 'role1', name: '프론트엔드 개발자', description: '웹 프론트엔드 개발 담당' },
      { id: 'role2', name: '백엔드 개발자', description: '서버 및 API 개발 담당' },
    ];

    // 프로젝트에 역할 저장 (임시)
    await prisma.project.update({
      where: { id: projectId },
      data: {
        roles: {
          create: roles.map(role => ({ name: role.name, description: role.description }))
        }
      }
    });

    return NextResponse.json({ status: 'success', message: '프로젝트 역할이 성공적으로 확정되었습니다.', roles }, { status: 200 });
  } catch (error) {
    console.error('Error confirming AI roles:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
