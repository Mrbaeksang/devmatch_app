import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { MemberProfile } from '@/types/project';

// 면담 완료 요청 스키마
interface CompleteInterviewRequest {
  projectId: string;
  memberId: string;
  interviewData: {
    memberName?: string;
    skills?: string[];
    experience?: string;
    leadershipLevel?: 'none' | 'interested' | 'experienced' | 'preferred';
    workStyle?: 'individual' | 'collaborative' | 'mixed';
    communication?: string;
    motivation?: string;
    availability?: string;
    rolePreference?: string;
    additionalInfo?: string;
  };
}

/**
 * 면담 데이터를 MemberProfile로 변환하는 함수
 */
function createMemberProfile(interviewData: CompleteInterviewRequest['interviewData']): Partial<MemberProfile> {
  return {
    memberName: interviewData.memberName || '',
    strongSkills: interviewData.skills || [],
    leadershipLevel: interviewData.leadershipLevel || 'none',
    workStyle: interviewData.workStyle || 'individual',
    projectMotivation: interviewData.motivation || '',
    // 기타 필드들은 면담 시 별도로 수집하거나 기본값 설정
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body: CompleteInterviewRequest = await req.json();
    const { projectId, memberId, interviewData } = body;

    console.log('면담 완료 요청:', {
      projectId,
      memberId,
      userId: session.user.id,
      interviewData
    });

    // 프로젝트 존재 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: true
      }
    });

    if (!project) {
      return NextResponse.json({ message: '프로젝트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 멤버 권한 확인
    const member = project.members.find(m => m.id === memberId && m.userId === session.user.id);
    if (!member) {
      return NextResponse.json({ message: '멤버 권한이 없습니다.' }, { status: 403 });
    }

    // MemberProfile 생성
    const memberProfile = createMemberProfile(interviewData);

    // 멤버 정보 업데이트
    const updatedMember = await db.projectMember.update({
      where: { id: memberId },
      data: {
        memberProfile: memberProfile,
        interviewStatus: 'COMPLETED',
      }
    });

    // 모든 멤버의 면담이 완료되었는지 확인
    const allMembers = await db.projectMember.findMany({
      where: { projectId }
    });

    const allInterviewsCompleted = allMembers.every(m => m.interviewStatus === 'COMPLETED');

    if (allInterviewsCompleted) {
      // 프로젝트 상태를 ANALYZING으로 변경
      await db.project.update({
        where: { id: projectId },
        data: {
          status: 'ANALYZING'
        }
      });

      console.log('모든 면담 완료 - 프로젝트 상태를 ANALYZING으로 변경');
    }

    return NextResponse.json({
      success: true,
      member: updatedMember,
      memberProfile: memberProfile,
      allInterviewsCompleted,
    }, { status: 200 });

  } catch (error) {
    console.error('면담 완료 처리 오류:', error);
    
    // Prisma 에러 구분
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json({ message: '멤버를 찾을 수 없습니다.' }, { status: 404 });
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ message: '잘못된 프로젝트 또는 멤버 ID입니다.' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      message: '면담 완료 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}