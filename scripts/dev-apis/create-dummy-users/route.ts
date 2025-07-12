import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';

// 테스트용 사용자 데이터
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
      React: 4,
      JavaScript: 4,
      TypeScript: 3,
      'HTML/CSS': 5,
      Git: 4,
      'Node.js': 2
    },
    workStyles: ['협업소통형', '창의주도형'],
    preferredRole: 'frontend'
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
      'Node.js': 5,
      Java: 4,
      Python: 3,
      MySQL: 4,
      PostgreSQL: 3,
      Git: 5,
      React: 2
    },
    workStyles: ['체계관리형', '문제해결형'],
    preferredRole: 'backend'
  },
  {
    name: '이풀스택',
    nickname: 'fullstack_lee',
    email: 'fullstack.lee@test.com',
    avatar: JSON.stringify({
      hairColor: '#E74C3C',
      skinColor: '#FDBCB4',
      eyeColor: '#9B59B6',
      accessory: 'headphones'
    }),
    bio: '프론트엔드와 백엔드 모두 다룰 수 있는 풀스택 개발자입니다. 팀 리더 경험이 있습니다.',
    skillProfile: {
      React: 3,
      'Node.js': 4,
      JavaScript: 4,
      TypeScript: 3,
      Python: 3,
      Git: 5,
      PostgreSQL: 3
    },
    workStyles: ['리더십형', '협업소통형'],
    preferredRole: 'fullstack'
  }
];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // 프로젝트 존재 확인
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 프로젝트 소유자 확인
    const isOwner = project.members.some(member => 
      member.userId === session.user.id && member.role === 'owner'
    );

    if (!isOwner) {
      return NextResponse.json({ error: 'Only project owner can create test users' }, { status: 403 });
    }

    console.log('🚀 테스트 사용자 생성 시작...');
    
    const createdUsers = [];
    const createdMembers = [];

    for (const userData of testUsers) {
      // 이미 존재하는 사용자 확인
      let existingUser = await db.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        // 새 사용자 생성
        existingUser = await db.user.create({
          data: {
            name: userData.name,
            nickname: userData.nickname,
            email: userData.email,
            avatar: userData.avatar,
            bio: userData.bio,
            isCompleted: true,
            accounts: {
              create: {
                type: 'oauth',
                provider: 'test',
                providerAccountId: randomBytes(16).toString('hex'),
                access_token: 'test_token',
                token_type: 'Bearer',
                scope: 'read'
              }
            }
          }
        });

        console.log(`✅ ${userData.name} (${userData.nickname}) 생성 완료`);
      } else {
        console.log(`ℹ️ ${userData.name} (${userData.nickname}) 이미 존재함`);
      }

      createdUsers.push(existingUser);

      // 프로젝트에 이미 참여했는지 확인
      const existingMember = await db.projectMember.findFirst({
        where: {
          projectId,
          userId: existingUser.id
        }
      });

      if (!existingMember) {
        // 프로젝트 멤버로 추가
        const member = await db.projectMember.create({
          data: {
            projectId,
            userId: existingUser.id,
            role: 'member',
            interviewStatus: 'PENDING'
          }
        });

        createdMembers.push(member);
        console.log(`✅ ${userData.name}을 프로젝트에 추가`);
      } else {
        console.log(`ℹ️ ${userData.name}은 이미 프로젝트 멤버임`);
      }
    }

    console.log('🎉 테스트 사용자 설정 완료!');

    return NextResponse.json({
      success: true,
      message: '테스트 사용자가 성공적으로 생성되고 프로젝트에 추가되었습니다.',
      users: createdUsers.map(user => ({
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email
      })),
      membersAdded: createdMembers.length
    });

  } catch (error) {
    console.error('❌ 테스트 사용자 생성 중 오류:', error);
    
    return NextResponse.json({
      error: '테스트 사용자 생성 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
}