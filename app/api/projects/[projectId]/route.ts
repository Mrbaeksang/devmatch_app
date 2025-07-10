import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // 프로젝트 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                nickname: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로젝트 접근 권한 확인 (멤버인지 확인)
    const isMember = project.members.some(member => member.user.id === session.user.id);

    if (!isMember) {
      return NextResponse.json({ message: '프로젝트 접근 권한이 없습니다.' }, { status: 403 });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      inviteCode: project.inviteCode,
      teamSize: project.teamSize,
      techStack: project.techStack,
      createdAt: project.createdAt,
      members: project.members.map(member => ({
        id: member.id,
        role: member.role,
        interviewStatus: member.interviewStatus,
        joinedAt: member.joinedAt,
        user: member.user,
        memberProfile: member.memberProfile,
        canStartInterview: member.interviewStatus === 'PENDING'
      })),
      blueprint: project.blueprint,
      teamAnalysis: project.teamAnalysis
    });

  } catch (error) {
    console.error('프로젝트 정보 조회 오류:', error);
    
    return NextResponse.json(
      { 
        message: '프로젝트 정보를 불러오는 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}