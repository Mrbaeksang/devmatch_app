import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 사용자가 참여한 모든 프로젝트 조회
    const userProjects = await db.projectMember.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        project: {
          include: {
            members: {
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
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // 프로젝트 데이터 변환
    const projects = userProjects.map(memberRecord => {
      const project = memberRecord.project;
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        teamSize: project.teamSize,
        currentMembers: project.members.length,
        joinedAt: memberRecord.joinedAt,
        myRole: memberRecord.role,
        myInterviewStatus: memberRecord.interviewStatus,
        inviteCode: project.inviteCode,
        members: project.members.map(member => ({
          id: member.id,
          name: member.user.nickname || member.user.name,
          avatar: member.user.avatar,
          interviewStatus: member.interviewStatus,
          role: member.role
        })),
        blueprint: project.blueprint,
        teamAnalysis: project.teamAnalysis,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      };
    });

    return NextResponse.json({ projects });

  } catch (error) {
    console.error('내 프로젝트 조회 오류:', error);
    
    return NextResponse.json(
      { 
        error: '프로젝트 목록을 불러오는 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
      },
      { status: 500 }
    );
  }
}