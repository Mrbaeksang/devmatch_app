import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { TechStackStructure } from '@/types/project';

// 테스트 사용자별 프로필 (프로젝트 기술에 맞춰 동적으로 생성)
const testProfiles = [
  {
    name: '김프론트',
    workStyles: ['협업소통형', '창의주도형'],
    preferredRole: 'frontend',
    leadershipLevel: 'interested',
    skillWeights: { // 기술별 가중치 (1-5 범위로 랜덤 생성 시 사용)
      frontend: { min: 3, max: 5 },
      backend: { min: 1, max: 2 },
      collaboration: { min: 3, max: 4 }
    }
  },
  {
    name: '박백엔드',
    workStyles: ['체계관리형', '문제해결형'],
    preferredRole: 'backend',
    leadershipLevel: 'preferred',
    skillWeights: {
      frontend: { min: 1, max: 2 },
      backend: { min: 4, max: 5 },
      collaboration: { min: 4, max: 5 }
    }
  },
  {
    name: '이풀스택',
    workStyles: ['리더십형', '학습지향형'],
    preferredRole: 'fullstack',
    leadershipLevel: 'experienced',
    skillWeights: {
      frontend: { min: 3, max: 4 },
      backend: { min: 3, max: 4 },
      collaboration: { min: 3, max: 5 }
    }
  }
];

// 프로젝트 기술스택에 맞춰 스킬 점수 생성
function generateSkillScores(techStack: TechStackStructure, userIndex: number) {
  const profile = testProfiles[userIndex];
  const skillScores: Record<string, number> = {};
  
  // Frontend 기술들
  if (techStack.frontend) {
    const weight = profile.skillWeights.frontend;
    if (techStack.frontend.languages) {
      techStack.frontend.languages.forEach(lang => {
        skillScores[lang] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
    if (techStack.frontend.frameworks) {
      techStack.frontend.frameworks.forEach(fw => {
        skillScores[fw] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
    if (techStack.frontend.tools) {
      techStack.frontend.tools.forEach(tool => {
        skillScores[tool] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
  }
  
  // Backend 기술들
  if (techStack.backend) {
    const weight = profile.skillWeights.backend;
    if (techStack.backend.languages) {
      techStack.backend.languages.forEach(lang => {
        skillScores[lang] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
    if (techStack.backend.frameworks) {
      techStack.backend.frameworks.forEach(fw => {
        skillScores[fw] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
    if (techStack.backend.tools) {
      techStack.backend.tools.forEach(tool => {
        skillScores[tool] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
  }
  
  // Collaboration 기술들
  if (techStack.collaboration) {
    const weight = profile.skillWeights.collaboration;
    if (techStack.collaboration.git) {
      techStack.collaboration.git.forEach(tool => {
        skillScores[tool] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
    if (techStack.collaboration.tools) {
      techStack.collaboration.tools.forEach(tool => {
        skillScores[tool] = Math.floor(Math.random() * (weight.max - weight.min + 1)) + weight.min;
      });
    }
  }
  
  return skillScores;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, userName } = await req.json();

    if (!projectId || !userName) {
      return NextResponse.json({ error: 'Project ID and user name are required' }, { status: 400 });
    }

    // 사용자 인덱스 찾기
    const userIndex = testProfiles.findIndex(p => p.name === userName);
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Invalid user name' }, { status: 400 });
    }

    // 프로젝트와 멤버 정보 가져오기
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: {
            user: { name: userName }
          },
          include: { user: true }
        }
      }
    });

    if (!project || project.members.length === 0) {
      return NextResponse.json({ error: 'Project or member not found' }, { status: 404 });
    }

    const member = project.members[0];
    
    // 이미 면담이 완료된 경우
    if (member.interviewStatus === 'COMPLETED') {
      return NextResponse.json({ error: '이미 면담이 완료되었습니다' }, { status: 400 });
    }

    // 프로젝트의 기술스택에 맞춰 스킬 점수 생성
    const techStack = project.techStack as TechStackStructure;
    const skillScores = generateSkillScores(techStack, userIndex);
    const profile = testProfiles[userIndex];

    // 면담 완료 처리
    const updatedMember = await db.projectMember.update({
      where: { id: member.id },
      data: {
        interviewStatus: 'COMPLETED',
        memberProfile: {
          skillScores,
          workStyles: profile.workStyles,
          preferredRole: profile.preferredRole,
          leadershipLevel: profile.leadershipLevel
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${userName}님의 면담이 완료되었습니다!`,
      memberProfile: updatedMember.memberProfile
    });

  } catch (error) {
    console.error('Complete single interview error:', error);
    return NextResponse.json(
      { error: 'Failed to complete interview' },
      { status: 500 }
    );
  }
}