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
    
    const { projectId } = await params;

    // 프로젝트 ID로 프로젝트 찾기
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
                avatar: true,
                nickname: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 현재 사용자 찾기
    let currentUser = null;
    if (session?.user?.id) {
      currentUser = project.members.find(m => m.user.id === session.user.id);
    }

    // 팀원 정보 변환
    const members = project.members.map(member => ({
      id: member.id,
      name: member.user.nickname || member.user.name,
      avatar: member.user.avatar,
      joinedAt: member.joinedAt,
      userId: member.user.id,
      interviewStatus: member.interviewStatus,
      canStartInterview: member.interviewStatus === 'PENDING',
      memberProfile: member.memberProfile,
      role: member.role
    }));

    // 프로젝트 정보 반환
    const projectData = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      inviteCode: project.inviteCode,
      teamSize: project.teamSize,
      techStack: project.techStack,
      blueprint: project.blueprint,
      teamAnalysis: project.teamAnalysis,
      members: members,
      createdAt: project.createdAt
    };

    // 현재 사용자 정보 변환
    let currentUserData = null;
    if (currentUser) {
      currentUserData = {
        id: currentUser.id,
        name: currentUser.user.nickname || currentUser.user.name,
        avatar: currentUser.user.avatar,
        joinedAt: currentUser.joinedAt,
        userId: currentUser.user.id,
        interviewStatus: currentUser.interviewStatus,
        canStartInterview: currentUser.interviewStatus === 'PENDING',
        memberProfile: currentUser.memberProfile,
        role: currentUser.role,
        user: currentUser.user
      };
    }

    return NextResponse.json({
      project: projectData,
      currentUser: currentUserData,
      isUserInProject: !!currentUser
    });

  } catch (error) {
    console.error('프로젝트 조회 오류:', error);
    
    return NextResponse.json(
      { 
        message: '프로젝트 정보를 불러오는 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // 프로젝트 ID로 프로젝트 찾기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 참여한 사용자인지 확인
    const existingMember = project.members.find(m => m.userId === session.user.id);
    if (existingMember) {
      return NextResponse.json({ message: '이미 참여한 프로젝트입니다.' }, { status: 400 });
    }

    // 최대 인원 확인
    if (project.members.length >= project.teamSize) {
      return NextResponse.json({ message: '프로젝트가 가득 찼습니다.' }, { status: 400 });
    }

    // 멤버 추가
    await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        interviewStatus: 'PENDING'
      }
    });

    return NextResponse.json({ message: '프로젝트에 참여했습니다.' });

  } catch (error) {
    console.error('프로젝트 참여 오류:', error);
    
    return NextResponse.json(
      { 
        message: '프로젝트 참여 중 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}