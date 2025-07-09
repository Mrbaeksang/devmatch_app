import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    // 프로젝트 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로젝트 접근 권한 확인 (멤버 또는 소유자)
    const isMember = project.members.some(member => member.user.id === session.user.id);
    const isOwner = project.owner.id === session.user.id;

    if (!isMember && !isOwner) {
      return NextResponse.json({ message: '프로젝트 접근 권한이 없습니다.' }, { status: 403 });
    }

    return NextResponse.json({
      id: project.id,
      name: project.name,
      goal: project.goal,
      description: project.description,
      status: project.status,
      inviteCode: project.inviteCode,
      maxMembers: project.maxMembers,
      techStack: project.techStack,
      createdAt: project.createdAt,
      startedAt: project.startedAt,
      interviewPhase: project.interviewPhase,
      owner: project.owner,
      members: project.members.map(member => ({
        id: member.id,
        role: member.role,
        consultationCompleted: member.consultationCompleted,
        interviewStatus: member.interviewStatus,
        joinedAt: member.joinedAt,
        user: member.user,
        memberProfile: member.memberProfile,
        roleAssignment: member.roleAssignment
      })),
      consultationData: project.consultationData,
      blueprint: project.blueprint,
      teamAnalysis: project.teamAnalysis
    });

  } catch (error) {
    console.error('프로젝트 정보 조회 오류:', error);
    
    return NextResponse.json(
      { 
        message: '프로젝트 정보를 불러오는 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  }
}