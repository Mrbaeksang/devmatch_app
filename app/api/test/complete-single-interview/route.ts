import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { TechStackStructure } from '@/lib/types/common.types';

// 테스트 프로필 데이터
const testProfiles = [
  {
    name: '김프론트',
    workStyles: ['협업선호형', '창의적사고형'],
    skillWeights: {
      frontend: { min: 4, max: 5 },
      backend: { min: 1, max: 2 },
      collaboration: { min: 3, max: 4 }
    }
  },
  {
    name: '박백엔드',
    workStyles: ['독립작업형', '분석적사고형'],
    skillWeights: {
      frontend: { min: 1, max: 2 },
      backend: { min: 4, max: 5 },
      collaboration: { min: 4, max: 5 }
    }
  },
  {
    name: '이풀스택',
    workStyles: ['리더십형', '학습지향형'],
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

// 역할 적합도 계산 (실제 면담과 동일하게)
function calculateRoleAptitudes(skillScores: Record<string, number>, techStack: TechStackStructure) {
  // 백엔드 기술 점수 평균
  const backendSkills = techStack.backend?.languages?.concat(
    techStack.backend?.frameworks || []
  ) || [];
  const backendScores = backendSkills
    .map(skill => skillScores[skill] || 0)
    .filter(score => score > 0);
  const backendAvg = backendScores.length > 0 
    ? backendScores.reduce((a, b) => a + b, 0) / backendScores.length 
    : 0;
  
  // 프론트엔드 기술 점수 평균
  const frontendSkills = techStack.frontend?.languages?.concat(
    techStack.frontend?.frameworks || []
  ) || [];
  const frontendScores = frontendSkills
    .map(skill => skillScores[skill] || 0)
    .filter(score => score > 0);
  const frontendAvg = frontendScores.length > 0 
    ? frontendScores.reduce((a, b) => a + b, 0) / frontendScores.length 
    : 0;
  
  // 1-5점으로 변환 (8점 만점 기준)
  return {
    backend: Math.round((backendAvg / 8) * 5) || 1,
    frontend: Math.round((frontendAvg / 8) * 5) || 1,
    fullstack: Math.round(((backendAvg + frontendAvg) / 16) * 5) || 1,
    teamLead: 3 // 기본값
  };
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
            user: {
              name: userName
            }
          },
          include: {
            user: true
          }
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
    const techStack = project.techStack as unknown as TechStackStructure;
    const skillScores = generateSkillScores(techStack, userIndex);
    const profile = testProfiles[userIndex];
    
    // 역할 적합도 계산 (실제 면담과 동일하게!)
    const roleAptitudes = calculateRoleAptitudes(skillScores, techStack);

    // 면담 완료 처리 - 실제 면담과 동일한 구조로!
    const updatedMember = await db.projectMember.update({
      where: { id: member.id },
      data: {
        interviewStatus: 'COMPLETED',
        memberProfile: {
          skillScores,           // 기술 점수
          workStyles: profile.workStyles,  // 워크스타일
          roleAptitudes         // 역할 적합도 (자동 계산)
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