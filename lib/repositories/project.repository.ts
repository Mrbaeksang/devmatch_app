// lib/repositories/project.repository.ts
// 프로젝트 데이터 접근 레이어 (Repository 패턴)

import { db } from '@/lib/db';
import { BaseRepository } from './base.repository';
import { Project, ProjectMember, Prisma } from '@prisma/client';
import { ProjectStatus } from '../types/common.types';

// 타입 정의 (Prisma 생성 타입 활용)
type ProjectCreateInput = Prisma.ProjectCreateInput;
type ProjectUpdateInput = Prisma.ProjectUpdateInput;
type ProjectWhereInput = Prisma.ProjectWhereInput;
type ProjectWhereUniqueInput = Prisma.ProjectWhereUniqueInput;

// 확장된 프로젝트 타입 (관련 데이터 포함)
export type ProjectWithMembers = Project & {
  members: (ProjectMember & {
    user: {
      id: string;
      name: string | null;
      nickname: string | null;
    };
  })[];
};

/**
 * 프로젝트 Repository 클래스
 * 프로젝트 관련 모든 데이터베이스 작업을 담당
 * BaseRepository를 상속받아 기본 CRUD + 프로젝트 특화 메서드 제공
 */
export class ProjectRepository extends BaseRepository<
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectWhereInput,
  ProjectWhereUniqueInput
> {
  protected model = db.project;

  /**
   * 초대 코드로 프로젝트 조회
   * 팀원들이 초대 링크를 통해 참여할 때 사용
   */
  async findByInviteCode(inviteCode: string): Promise<ProjectWithMembers | null> {
    try {
      return await this.model.findUnique({
        where: { inviteCode },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, nickname: true }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('[ProjectRepository] findByInviteCode 오류:', error);
      throw new Error(`초대 코드로 프로젝트 조회 실패: ${inviteCode}`);
    }
  }

  /**
   * 프로젝트 상세 정보 조회 (멤버 포함)
   * 프로젝트 페이지에서 사용
   */
  async findWithMembers(projectId: string): Promise<ProjectWithMembers | null> {
    try {
      return await this.model.findUnique({
        where: { id: projectId },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, nickname: true }
              }
            },
            orderBy: { joinedAt: 'asc' } // 참여 순서대로 정렬
          }
        }
      });
    } catch (error) {
      console.error('[ProjectRepository] findWithMembers 오류:', error);
      throw new Error(`프로젝트 상세 조회 실패: ${projectId}`);
    }
  }

  /**
   * 사용자의 프로젝트 목록 조회
   * 대시보드에서 사용자가 참여한 프로젝트들을 보여줄 때 사용
   */
  async findByUserId(userId: string): Promise<ProjectWithMembers[]> {
    try {
      return await this.model.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, nickname: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' } // 최신 순으로 정렬
      });
    } catch (error) {
      console.error('[ProjectRepository] findByUserId 오류:', error);
      throw new Error(`사용자 프로젝트 목록 조회 실패: ${userId}`);
    }
  }

  /**
   * 프로젝트 상태별 조회
   * 관리자 대시보드나 통계에서 사용
   */
  async findByStatus(status: ProjectStatus, limit?: number): Promise<Project[]> {
    try {
      return await this.model.findMany({
        where: { status: status as any },
        take: limit,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('[ProjectRepository] findByStatus 오류:', error);
      throw new Error(`상태별 프로젝트 조회 실패: ${status}`);
    }
  }

  /**
   * 팀원 추가
   * 새로운 멤버가 프로젝트에 참여할 때 사용
   */
  async addMember(projectId: string, userId: string): Promise<ProjectMember> {
    try {
      // 트랜잭션으로 안전하게 처리
      return await this.transaction(async (tx) => {
        // 1. 프로젝트 존재 확인
        const project = await tx.project.findUnique({
          where: { id: projectId },
          include: { members: true }
        });

        if (!project) {
          throw new Error('프로젝트가 존재하지 않습니다.');
        }

        // 2. 이미 참여한 멤버인지 확인
        const existingMember = project.members.find(m => m.userId === userId);
        if (existingMember) {
          throw new Error('이미 참여한 멤버입니다.');
        }

        // 3. 팀 정원 확인
        if (project.members.length >= project.teamSize) {
          throw new Error('팀 정원이 가득 찼습니다.');
        }

        // 4. 멤버 추가
        return await tx.projectMember.create({
          data: {
            projectId,
            userId,
            joinedAt: new Date()
          }
        });
      });
    } catch (error) {
      console.error('[ProjectRepository] addMember 오류:', error);
      throw error; // 비즈니스 로직 오류는 그대로 전파
    }
  }

  /**
   * 팀원 제거
   * 멤버가 프로젝트를 떠날 때 사용
   */
  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      await db.projectMember.deleteMany({
        where: {
          projectId,
          userId
        }
      });
    } catch (error) {
      console.error('[ProjectRepository] removeMember 오류:', error);
      throw new Error('팀원 제거 실패');
    }
  }

  /**
   * 프로젝트 상태 업데이트
   * 프로젝트 생명주기 관리 (모집중 → 진행중 → 완료)
   */
  async updateStatus(projectId: string, status: ProjectStatus): Promise<Project> {
    try {
      return await this.update(
        { id: projectId },
        { status: status as any, updatedAt: new Date() }
      );
    } catch (error) {
      console.error('[ProjectRepository] updateStatus 오류:', error);
      throw new Error('프로젝트 상태 업데이트 실패');
    }
  }

  /**
   * 프로젝트 청사진 업데이트
   * AI 분석 후 팀 구성이 완료되었을 때 사용
   */
  async updateBlueprint(projectId: string, blueprint: any): Promise<Project> {
    try {
      return await this.update(
        { id: projectId },
        { 
          blueprint,
          updatedAt: new Date()
        }
      );
    } catch (error) {
      console.error('[ProjectRepository] updateBlueprint 오류:', error);
      throw new Error('프로젝트 청사진 업데이트 실패');
    }
  }

  /**
   * 팀 분석 결과 저장
   * AI가 분석한 팀 구성 결과를 저장
   */
  async updateTeamAnalysis(projectId: string, teamAnalysis: any): Promise<Project> {
    try {
      return await this.update(
        { id: projectId },
        { 
          teamAnalysis,
          updatedAt: new Date()
        }
      );
    } catch (error) {
      console.error('[ProjectRepository] updateTeamAnalysis 오류:', error);
      throw new Error('팀 분석 결과 저장 실패');
    }
  }

  /**
   * 프로젝트 통계 조회
   * 관리자나 분석용 데이터 제공
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    recentProjects: Project[];
  }> {
    try {
      const [total, projects] = await Promise.all([
        this.count(),
        this.findMany(undefined, undefined, { createdAt: 'desc' }, 10)
      ]);

      // 상태별 통계 계산
      const byStatus: Record<string, number> = {};
      for (const project of projects) {
        byStatus[project.status] = (byStatus[project.status] || 0) + 1;
      }

      return {
        total,
        byStatus,
        recentProjects: projects
      };
    } catch (error) {
      console.error('[ProjectRepository] getStatistics 오류:', error);
      throw new Error('프로젝트 통계 조회 실패');
    }
  }
}

// 싱글톤 인스턴스 생성 및 export
export const projectRepository = new ProjectRepository();