// lib/repositories/base.repository.ts
// 기본 Repository 패턴 구현 (데이터베이스 접근 추상화)

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

/**
 * 기본 Repository 클래스
 * 모든 Repository의 공통 메서드를 정의
 * Prisma ORM을 래핑하여 일관된 데이터베이스 접근 인터페이스 제공
 */
export abstract class BaseRepository<
  Model,
  CreateInput,
  UpdateInput,
  WhereInput,
  WhereUniqueInput
> {
  protected abstract model: any; // Prisma 모델 (Project, User 등)

  /**
   * 단일 레코드 조회 (ID 기반)
   * @param id - 고유 식별자
   * @param include - 관련 데이터 포함 옵션
   */
  async findById(id: string, include?: any): Promise<Model | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] findById 오류:`, error);
      throw new Error(`데이터 조회 실패: ${id}`);
    }
  }

  /**
   * 단일 레코드 조회 (조건 기반)
   * @param where - 검색 조건
   * @param include - 관련 데이터 포함 옵션
   */
  async findFirst(where: WhereInput, include?: any): Promise<Model | null> {
    try {
      return await this.model.findFirst({
        where,
        include
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] findFirst 오류:`, error);
      throw new Error('데이터 조회 실패');
    }
  }

  /**
   * 다중 레코드 조회
   * @param where - 검색 조건
   * @param include - 관련 데이터 포함 옵션
   * @param orderBy - 정렬 조건
   * @param take - 조회할 개수 제한
   * @param skip - 건너뛸 개수
   */
  async findMany(
    where?: WhereInput,
    include?: any,
    orderBy?: any,
    take?: number,
    skip?: number
  ): Promise<Model[]> {
    try {
      return await this.model.findMany({
        where,
        include,
        orderBy,
        take,
        skip
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] findMany 오류:`, error);
      throw new Error('데이터 목록 조회 실패');
    }
  }

  /**
   * 레코드 생성
   * @param data - 생성할 데이터
   * @param include - 반환 시 포함할 관련 데이터
   */
  async create(data: CreateInput, include?: any): Promise<Model> {
    try {
      return await this.model.create({
        data,
        include
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] create 오류:`, error);
      
      // Prisma 고유 제약 조건 오류 처리
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('이미 존재하는 데이터입니다.');
        }
        if (error.code === 'P2003') {
          throw new Error('관련 데이터가 존재하지 않습니다.');
        }
      }
      
      throw new Error('데이터 생성 실패');
    }
  }

  /**
   * 레코드 업데이트
   * @param where - 업데이트할 레코드 조건
   * @param data - 업데이트할 데이터
   * @param include - 반환 시 포함할 관련 데이터
   */
  async update(
    where: WhereUniqueInput,
    data: UpdateInput,
    include?: any
  ): Promise<Model> {
    try {
      return await this.model.update({
        where,
        data,
        include
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] update 오류:`, error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('업데이트할 데이터가 존재하지 않습니다.');
        }
      }
      
      throw new Error('데이터 업데이트 실패');
    }
  }

  /**
   * 레코드 삭제
   * @param where - 삭제할 레코드 조건
   */
  async delete(where: WhereUniqueInput): Promise<Model> {
    try {
      return await this.model.delete({
        where
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] delete 오류:`, error);
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new Error('삭제할 데이터가 존재하지 않습니다.');
        }
      }
      
      throw new Error('데이터 삭제 실패');
    }
  }

  /**
   * 레코드 개수 조회
   * @param where - 검색 조건
   */
  async count(where?: WhereInput): Promise<number> {
    try {
      return await this.model.count({
        where
      });
    } catch (error) {
      console.error(`[${this.constructor.name}] count 오류:`, error);
      throw new Error('데이터 개수 조회 실패');
    }
  }

  /**
   * 레코드 존재 여부 확인
   * @param where - 검색 조건
   */
  async exists(where: WhereInput): Promise<boolean> {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error) {
      console.error(`[${this.constructor.name}] exists 오류:`, error);
      return false;
    }
  }

  /**
   * 트랜잭션 실행
   * Repository 패턴에서 복잡한 비즈니스 로직을 안전하게 처리
   */
  async transaction<T>(
    fn: (tx: Omit<typeof db, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>
  ): Promise<T> {
    try {
      return await db.$transaction(fn);
    } catch (error) {
      console.error(`[${this.constructor.name}] transaction 오류:`, error);
      throw new Error('트랜잭션 실행 실패');
    }
  }
}