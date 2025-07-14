// lib/utils/validation.ts
// 공통 검증 로직 모듈


/**
 * 입력 검증 유틸리티 클래스
 * 모든 API에서 사용하는 공통 검증 로직을 중앙화
 */
export class ValidationUtils {
  
  /**
   * 필수 필드 검증
   * @param data - 검증할 데이터 객체
   * @param requiredFields - 필수 필드 목록
   * @returns 누락된 필드 목록
   */
  static validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): string[] {
    const missingFields: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        missingFields.push(field);
      }
    }
    
    return missingFields;
  }

  /**
   * 사용자 입력 길이 검증
   * @param input - 검증할 문자열
   * @param minLength - 최소 길이
   * @param maxLength - 최대 길이
   * @param fieldName - 필드명 (에러 메시지용)
   */
  static validateLength(
    input: string,
    minLength: number,
    maxLength: number,
    fieldName: string = '입력값'
  ): string | null {
    if (input.length < minLength) {
      return `${fieldName}은(는) 최소 ${minLength}자 이상이어야 합니다.`;
    }
    if (input.length > maxLength) {
      return `${fieldName}은(는) 최대 ${maxLength}자까지 가능합니다.`;
    }
    return null;
  }

  /**
   * 이메일 형식 검증
   * @param email - 검증할 이메일 주소
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * UUID 형식 검증
   * @param uuid - 검증할 UUID 문자열
   */
  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * 프로젝트명 검증
   * DevMatch 프로젝트명 규칙: 2-50자, 특수문자 제한
   */
  static validateProjectName(name: string): string | null {
    const lengthError = this.validateLength(name, 2, 50, '프로젝트명');
    if (lengthError) return lengthError;

    // 허용되지 않는 특수문자 검사
    const invalidChars = /[<>\/\\|:*?"]/;
    if (invalidChars.test(name)) {
      return '프로젝트명에는 < > / \\ | : * ? " 문자를 사용할 수 없습니다.';
    }

    return null;
  }

  /**
   * 팀 크기 검증
   * DevMatch 팀 크기 규칙: 2-8명
   */
  static validateTeamSize(teamSize: number): string | null {
    if (!Number.isInteger(teamSize)) {
      return '팀 크기는 정수여야 합니다.';
    }
    if (teamSize < 2) {
      return '팀은 최소 2명 이상이어야 합니다.';
    }
    if (teamSize > 8) {
      return '팀은 최대 8명까지 가능합니다.';
    }
    return null;
  }

  /**
   * 기술 스택 점수 검증
   * DevMatch 점수 체계: 1-8점
   */
  static validateSkillScore(score: number, skillName: string = '기술'): string | null {
    if (!Number.isInteger(score)) {
      return `${skillName} 점수는 정수여야 합니다.`;
    }
    if (score < 1 || score > 8) {
      return `${skillName} 점수는 1-8점 사이여야 합니다.`;
    }
    return null;
  }

  /**
   * 역할 적합도 점수 검증
   * DevMatch 역할 적합도: 1-8점
   */
  static validateRoleScore(score: number, roleName: string): string | null {
    return this.validateSkillScore(score, `${roleName} 역할 적합도`);
  }

  /**
   * 초대 코드 형식 검증
   * DevMatch 초대 코드: 8자리 영숫자
   */
  static validateInviteCode(code: string): boolean {
    const codeRegex = /^[a-zA-Z0-9]{8}$/;
    return codeRegex.test(code);
  }

  /**
   * JSON 문자열 검증
   * @param jsonString - 검증할 JSON 문자열
   * @param fieldName - 필드명 (에러 메시지용)
   */
  static validateJSON(jsonString: string, fieldName: string = 'JSON'): string | null {
    try {
      JSON.parse(jsonString);
      return null;
    } catch {
      return `${fieldName} 형식이 올바르지 않습니다.`;
    }
  }

  /**
   * 프로젝트 상태 검증
   * DevMatch 프로젝트 상태: RECRUITING, ACTIVE, COMPLETED, CANCELLED
   */
  static validateProjectStatus(status: string): boolean {
    const validStatuses = ['RECRUITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    return validStatuses.includes(status);
  }

  /**
   * 사용자 닉네임 검증
   * DevMatch 닉네임 규칙: 2-20자, 한글/영문/숫자/일부 특수문자
   */
  static validateNickname(nickname: string): string | null {
    const lengthError = this.validateLength(nickname, 2, 20, '닉네임');
    if (lengthError) return lengthError;

    // 허용되는 문자: 한글, 영문, 숫자, 언더스코어, 하이픈
    const validChars = /^[가-힣a-zA-Z0-9_-]+$/;
    if (!validChars.test(nickname)) {
      return '닉네임은 한글, 영문, 숫자, _, - 만 사용할 수 있습니다.';
    }

    return null;
  }

  /**
   * 종합 검증 결과 객체
   */
  static createValidationResult(
    isValid: boolean,
    errors: string[] = [],
    field?: string
  ): ValidationResult {
    return {
      isValid,
      errors,
      field
    };
  }

  /**
   * 여러 검증 결과를 합치기
   */
  static combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    let isValid = true;
    let field: string | undefined;

    for (const result of results) {
      if (!result.isValid) {
        isValid = false;
        allErrors.push(...result.errors);
        if (result.field && !field) {
          field = result.field;
        }
      }
    }

    return {
      isValid,
      errors: allErrors,
      field
    };
  }
}

/**
 * 검증 결과 인터페이스
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  field?: string;
}

/**
 * 검증 데코레이터 함수들
 * API 라우트에서 쉽게 사용할 수 있는 헬퍼 함수들
 */
export class ValidationHelpers {
  
  /**
   * 요청 본문 필수 필드 검증 미들웨어
   */
  static validateRequestBody(requiredFields: string[]) {
    return (data: Record<string, any>): ValidationResult => {
      const missingFields = ValidationUtils.validateRequiredFields(data, requiredFields);
      
      if (missingFields.length > 0) {
        return ValidationUtils.createValidationResult(
          false,
          [`다음 필드가 필요합니다: ${missingFields.join(', ')}`],
          missingFields[0]
        );
      }

      return ValidationUtils.createValidationResult(true);
    };
  }

  /**
   * 프로젝트 생성 데이터 검증
   */
  static validateProjectCreation(data: {
    name: string;
    description: string;
    teamSize: number;
  }): ValidationResult {
    const results: ValidationResult[] = [];

    // 프로젝트명 검증
    const nameError = ValidationUtils.validateProjectName(data.name);
    if (nameError) {
      results.push(ValidationUtils.createValidationResult(false, [nameError], 'name'));
    }

    // 설명 검증
    const descError = ValidationUtils.validateLength(data.description, 10, 500, '프로젝트 설명');
    if (descError) {
      results.push(ValidationUtils.createValidationResult(false, [descError], 'description'));
    }

    // 팀 크기 검증
    const teamSizeError = ValidationUtils.validateTeamSize(data.teamSize);
    if (teamSizeError) {
      results.push(ValidationUtils.createValidationResult(false, [teamSizeError], 'teamSize'));
    }

    if (results.length === 0) {
      return ValidationUtils.createValidationResult(true);
    }

    return ValidationUtils.combineValidationResults(...results);
  }

  /**
   * 면담 데이터 검증
   */
  static validateInterviewData(data: {
    scores: Record<string, number>;
    roleScores: Record<string, number>;
  }): ValidationResult {
    const results: ValidationResult[] = [];

    // 기술 점수 검증
    for (const [skill, score] of Object.entries(data.scores)) {
      const error = ValidationUtils.validateSkillScore(score, skill);
      if (error) {
        results.push(ValidationUtils.createValidationResult(false, [error], `scores.${skill}`));
      }
    }

    // 역할 점수 검증
    for (const [role, score] of Object.entries(data.roleScores)) {
      const error = ValidationUtils.validateRoleScore(score, role);
      if (error) {
        results.push(ValidationUtils.createValidationResult(false, [error], `roleScores.${role}`));
      }
    }

    if (results.length === 0) {
      return ValidationUtils.createValidationResult(true);
    }

    return ValidationUtils.combineValidationResults(...results);
  }
}