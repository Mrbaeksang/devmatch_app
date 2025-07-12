import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// 테스트용 사용자 데이터 (한 번에 하나씩 추가)
const testUsers = [
  {
    name: '김프론트',
    nickname: 'frontend_kim',
    email: 'frontend.kim@test.com',
    avatar: JSON.stringify({
      hairColor: '#8B4513',
      skinColor: '#FDBCB4',
      eyeColor: '#4A90E2',
      accessory: 'glasses'
    }),
    bio: 'React 전문가입니다. 사용자 경험을 중시하며 깔끔한 UI를 만들어갑니다.',
    skillProfile: {
      TypeScript: 4,
      JavaScript: 4,
      'Next.js': 5,
      React: 5,
      Tailwind: 4,
      Java: 2,
      'Spring Boot': 1,
      Git: 4,
      GitHub: 4
    },
    workStyles: ['협업소통형', '창의주도형'],
    preferredRole: 'frontend',
    leadershipLevel: 2
  },
  {
    name: '박백엔드',
    nickname: 'backend_park',
    email: 'backend.park@test.com',
    avatar: JSON.stringify({
      hairColor: '#2C3E50',
      skinColor: '#F5DEB3',
      eyeColor: '#27AE60',
      accessory: 'none'
    }),
    bio: '서버 개발과 데이터베이스 설계를 담당합니다. 안정적인 백엔드 시스템 구축이 전문입니다.',
    skillProfile: {
      TypeScript: 2,
      JavaScript: 3,
      'Next.js': 2,
      React: 2,
      Tailwind: 1,
      Java: 5,
      'Spring Boot': 5,
      Git: 5,
      GitHub: 5
    },
    workStyles: ['체계관리형', '문제해결형'],
    preferredRole: 'backend',
    leadershipLevel: 4
  },
  {
    name: '이풀스택',
    nickname: 'fullstack_lee',
    email: 'fullstack.lee@test.com',
    avatar: JSON.stringify({
      hairColor: '#E74C3C',
      skinColor: '#FFE4B5',
      eyeColor: '#8E44AD',
      accessory: 'headband'
    }),
    bio: '프론트엔드와 백엔드 모두 자신있습니다. 전체적인 아키텍처 설계를 좋아합니다.',
    skillProfile: {
      TypeScript: 4,
      JavaScript: 4,
      'Next.js': 4,
      React: 4,
      Tailwind: 3,
      Java: 3,
      'Spring Boot': 3,
      Git: 4,
      GitHub: 4
    },
    workStyles: ['리더십형', '학습지향형'],
    preferredRole: 'fullstack',
    leadershipLevel: 3
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, userIndex } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (typeof userIndex !== 'number' || userIndex < 0 || userIndex >= testUsers.length) {
      return NextResponse.json({ error: 'Invalid user index' }, { status: 400 });
    }

    // 프로젝트 존재 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 이미 팀이 가득 찼는지 확인
    if (project.members.length >= project.teamSize) {
      return NextResponse.json({ error: 'Team is already full' }, { status: 400 });
    }

    const userData = testUsers[userIndex];
    
    // 해당 테스트 사용자가 이미 프로젝트에 있는지 확인
    const existingMember = await db.user.findUnique({
      where: { email: userData.email },
      include: {
        projects: {
          where: { projectId }
        }
      }
    });

    if (existingMember && existingMember.projects.length > 0) {
      return NextResponse.json({ error: '이미 프로젝트에 참여한 사용자입니다' }, { status: 400 });
    }

    // 사용자 생성 또는 업데이트
    const user = await db.user.upsert({
      where: { email: userData.email },
      update: {
        nickname: userData.nickname,
        avatar: userData.avatar,
        bio: userData.bio,
        isCompleted: true
      },
      create: {
        email: userData.email,
        name: userData.name,
        nickname: userData.nickname,
        avatar: userData.avatar,
        bio: userData.bio,
        isCompleted: true
      }
    });

    // 프로젝트 멤버로 추가
    await db.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role: 'member',
        interviewStatus: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        nickname: user.nickname,
        id: user.id
      },
      message: `${userData.name}님이 프로젝트에 추가되었습니다!`
    });

  } catch (error) {
    console.error('Add single dummy user error:', error);
    return NextResponse.json(
      { error: 'Failed to add dummy user' },
      { status: 500 }
    );
  }
}