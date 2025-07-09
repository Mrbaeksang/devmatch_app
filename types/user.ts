// types/user.ts
// 사용자 관련 공통 타입 정의

/**
 * 사용자 역할 열거형
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

/**
 * 사용자 상태 열거형
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

/**
 * 기본 사용자 인터페이스
 */
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  status: UserStatus;
  provider?: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

/**
 * 사용자 프로필 인터페이스
 */
export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills: string[];
  experience?: string;
  availability?: string;
  preferredRoles: string[];
  portfolio?: PortfolioItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 포트폴리오 아이템 인터페이스
 */
export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  image?: string;
  technologies: string[];
  createdAt: Date;
}

/**
 * 사용자 설정 인터페이스
 */
export interface UserSettings {
  id: string;
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    projectInvites: boolean;
    teamUpdates: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showSkills: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 생성 데이터
 */
export interface CreateUserData {
  name: string;
  email: string;
  image?: string;
  provider?: string;
  providerId?: string;
}

/**
 * 사용자 업데이트 데이터
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  image?: string;
  status?: UserStatus;
  role?: UserRole;
}

/**
 * 사용자 프로필 업데이트 데이터
 */
export interface UpdateUserProfileData {
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  experience?: string;
  availability?: string;
  preferredRoles?: string[];
}

/**
 * 사용자 검색 파라미터
 */
export interface UserSearchParams {
  query?: string;
  skills?: string[];
  experience?: string;
  availability?: string;
  location?: string;
  role?: string;
}

/**
 * 사용자 통계 인터페이스
 */
export interface UserStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTeamMembers: number;
  averageRating: number;
  joinDate: Date;
}