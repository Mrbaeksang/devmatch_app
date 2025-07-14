// lib/utils/data-transform.ts
// 데이터 변환 유틸리티 모듈

/**
 * 데이터 변환 유틸리티 클래스
 * API 응답, 데이터베이스 변환, 타입 변환 등의 공통 로직 제공
 */
export class DataTransformUtils {

  /**
   * null/undefined 값을 기본값으로 변환
   * @param value - 변환할 값
   * @param defaultValue - 기본값
   */
  static defaultValue<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue;
  }

  /**
   * 객체에서 undefined/null 프로퍼티 제거
   * @param obj - 정리할 객체
   */
  static removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        result[key as keyof T] = value;
      }
    }
    
    return result;
  }

  /**
   * 민감한 정보를 제거한 안전한 객체 반환
   * @param obj - 원본 객체
   * @param sensitiveFields - 제거할 필드명 목록
   */
  static sanitizeObject<T extends Record<string, any>>(
    obj: T,
    sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey']
  ): Partial<T> {
    const result: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (!sensitiveFields.includes(key)) {
        result[key as keyof T] = value;
      }
    }
    
    return result;
  }

  /**
   * 사용자 정보를 클라이언트용으로 변환
   * 민감한 정보 제거 및 필요한 필드만 추출
   */
  static transformUserForClient(user: any): {
    id: string;
    name: string | null;
    nickname: string | null;
    email?: string;
  } {
    return {
      id: user.id,
      name: user.name || null,
      nickname: user.nickname || null,
      email: user.email // 이메일은 선택적으로 포함
    };
  }

  /**
   * 프로젝트 정보를 클라이언트용으로 변환
   * 불필요한 내부 데이터 제거
   */
  static transformProjectForClient(project: any): {
    id: string;
    name: string;
    description: string;
    teamSize: number;
    status: string;
    inviteCode: string;
    createdAt: string;
    blueprint?: any;
    techStack?: any;
    teamAnalysis?: any;
    memberCount: number;
  } {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      teamSize: project.teamSize,
      status: project.status,
      inviteCode: project.inviteCode,
      createdAt: project.createdAt.toISOString(),
      blueprint: project.blueprint,
      techStack: project.techStack,
      teamAnalysis: project.teamAnalysis,
      memberCount: project.members?.length || 0
    };
  }

  /**
   * 멤버 정보를 클라이언트용으로 변환
   */
  static transformMemberForClient(member: any): {
    id: string;
    userId: string;
    joinedAt: string;
    user: {
      id: string;
      name: string | null;
      nickname: string | null;
    };
    memberProfile?: any;
  } {
    return {
      id: member.id,
      userId: member.userId,
      joinedAt: member.joinedAt.toISOString(),
      user: this.transformUserForClient(member.user),
      memberProfile: member.memberProfile
    };
  }

  /**
   * 기술 스택을 표준 형식으로 변환
   * AI가 생성한 다양한 형식을 통일된 구조로 변환
   */
  static normalizeTechStack(techStack: any): {
    frontend?: {
      languages: string[];
      frameworks: string[];
      tools?: string[];
    };
    backend?: {
      languages: string[];
      frameworks: string[];
      tools?: string[];
    };
    collaboration: {
      git: string[];
      tools?: string[];
    };
  } {
    const normalized: any = {
      collaboration: {
        git: ['Git', 'GitHub'], // 기본값
        tools: []
      }
    };

    // Frontend 정규화
    if (techStack.frontend) {
      normalized.frontend = {
        languages: Array.isArray(techStack.frontend.languages) 
          ? techStack.frontend.languages 
          : [],
        frameworks: Array.isArray(techStack.frontend.frameworks) 
          ? techStack.frontend.frameworks 
          : [],
        tools: Array.isArray(techStack.frontend.tools) 
          ? techStack.frontend.tools 
          : []
      };
    }

    // Backend 정규화
    if (techStack.backend) {
      normalized.backend = {
        languages: Array.isArray(techStack.backend.languages) 
          ? techStack.backend.languages 
          : [],
        frameworks: Array.isArray(techStack.backend.frameworks) 
          ? techStack.backend.frameworks 
          : [],
        tools: Array.isArray(techStack.backend.tools) 
          ? techStack.backend.tools 
          : []
      };
    }

    // Collaboration 정규화 (Git/GitHub는 무조건 포함)
    if (techStack.collaboration) {
      const git = Array.isArray(techStack.collaboration.git) 
        ? techStack.collaboration.git 
        : ['Git', 'GitHub'];
      
      // Git, GitHub가 없으면 추가
      if (!git.includes('Git')) git.unshift('Git');
      if (!git.includes('GitHub')) git.push('GitHub');
      
      normalized.collaboration = {
        git,
        tools: Array.isArray(techStack.collaboration.tools) 
          ? techStack.collaboration.tools 
          : []
      };
    }

    return normalized;
  }

  /**
   * 점수 객체를 배열로 변환
   * {React: 7, Vue: 5} → [{name: 'React', score: 7}, {name: 'Vue', score: 5}]
   */
  static scoreObjectToArray(scores: Record<string, number>): Array<{name: string; score: number}> {
    return Object.entries(scores).map(([name, score]) => ({
      name,
      score
    }));
  }

  /**
   * 점수 배열을 객체로 변환
   * [{name: 'React', score: 7}] → {React: 7}
   */
  static scoreArrayToObject(scores: Array<{name: string; score: number}>): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const item of scores) {
      result[item.name] = item.score;
    }
    
    return result;
  }

  /**
   * 팀 구성 역할 분배 정규화
   * AI가 생성한 역할 분배를 검증하고 수정
   */
  static normalizeTeamComposition(composition: any, totalMembers: number): {
    totalMembers: number;
    roleRequirements: {
      backend: number;
      frontend: number;
      fullstack: number;
    };
    hasTeamLead: boolean;
    allowMultipleRoles: boolean;
    description?: string;
  } {
    const { roleRequirements } = composition;
    
    // 역할별 인원 수 검증 및 수정
    const backend = Math.max(0, roleRequirements?.backend || 0);
    const frontend = Math.max(0, roleRequirements?.frontend || 0);
    let fullstack = Math.max(0, roleRequirements?.fullstack || 0);
    
    // 총합이 맞지 않으면 수정
    const currentTotal = backend + frontend + fullstack;
    if (currentTotal !== totalMembers) {
      console.warn(`팀 구성 오류 감지: ${currentTotal}명 배정, ${totalMembers}명 필요`);
      
      // 차이만큼 풀스택에 할당/제거
      const diff = totalMembers - currentTotal;
      fullstack = Math.max(0, fullstack + diff);
    }

    return {
      totalMembers,
      roleRequirements: {
        backend,
        frontend,
        fullstack
      },
      hasTeamLead: true, // 항상 true
      allowMultipleRoles: composition.allowMultipleRoles || false,
      description: composition.description
    };
  }

  /**
   * 날짜를 한국 시간대로 변환
   */
  static toKoreanTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 상대 시간 표시 (예: "2시간 전", "3일 전")
   */
  static timeAgo(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return this.toKoreanTime(d);
    }
  }

  /**
   * JSON 문자열을 안전하게 파싱
   * 파싱 실패 시 기본값 반환
   */
  static safeJsonParse<T>(jsonString: string | null | undefined, defaultValue: T): T {
    if (!jsonString) return defaultValue;
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('JSON 파싱 실패:', error);
      return defaultValue;
    }
  }

  /**
   * 객체를 안전하게 JSON 문자열로 변환
   */
  static safeJsonStringify(obj: any, defaultValue: string = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch (error) {
      console.warn('JSON 직렬화 실패:', error);
      return defaultValue;
    }
  }

  /**
   * 페이지네이션 메타데이터 생성
   */
  static createPaginationMeta(
    total: number,
    page: number,
    limit: number
  ): {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    
    return {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * 배열을 청크 단위로 나누기
   */
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * 객체 배열에서 중복 제거 (특정 키 기준)
   */
  static uniqueByKey<T>(array: T[], key: keyof T): T[] {
    const seen = new Set();
    return array.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }
}