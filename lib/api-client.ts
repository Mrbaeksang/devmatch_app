// lib/api-client.ts
// 통합 API 클라이언트 - 모든 API 호출을 표준화하고 에러 처리를 통합 관리

import { ApiResponse, ApiParams } from '@/types/api';
import { Project, CreateProjectData, UpdateProjectData, TeamMember } from '@/types/project';
import { ChatMessage } from '@/types/chat';
import { User, UpdateUserData, UserProfile } from '@/types/user';

/**
 * HTTP 메서드 타입
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API 요청 옵션
 */
interface RequestOptions {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

/**
 * 기본 API 클라이언트 클래스
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 기본 요청 메서드
   */
  private async request<T = unknown>(
    endpoint: string,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, window.location.origin + this.baseURL);
    
    // URL 파라미터 추가
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const config: RequestInit = {
      method: options.method,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // POST, PUT, PATCH 요청에 body 추가
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error [${options.method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * GET 요청
   */
  async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST 요청
   */
  async post<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT 요청
   */
  async put<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH 요청
   */
  async patch<T = unknown>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE 요청
   */
  async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 싱글톤 인스턴스 생성
const apiClient = new ApiClient();

/**
 * 프로젝트 관련 API 클라이언트
 */
export const projectsApi = {
  /**
   * 프로젝트 목록 조회
   */
  getProjects: (params?: ApiParams) => {
    const queryParams: Record<string, string> = {};
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }
    
    return apiClient.get<Project[]>('/projects', queryParams);
  },

  /**
   * 프로젝트 생성
   */
  createProject: (data: CreateProjectData) =>
    apiClient.post<Project>('/projects', data),

  /**
   * 프로젝트 조회
   */
  getProject: (projectId: string) =>
    apiClient.get<Project>(`/projects/${projectId}`),

  /**
   * 프로젝트 수정
   */
  updateProject: (projectId: string, data: UpdateProjectData) =>
    apiClient.put<Project>(`/projects/${projectId}`, data),

  /**
   * 프로젝트 삭제
   */
  deleteProject: (projectId: string) =>
    apiClient.delete(`/projects/${projectId}`),

  /**
   * 프로젝트 참여
   */
  joinProject: (projectId: string) =>
    apiClient.post<TeamMember>(`/projects/${projectId}/join`),

  /**
   * 팀원 목록 조회
   */
  getMembers: (projectId: string) =>
    apiClient.get<TeamMember[]>(`/projects/${projectId}/members`),

  /**
   * 팀원 상태 업데이트
   */
  updateMember: (projectId: string, memberId: string, data: Partial<TeamMember>) =>
    apiClient.put<TeamMember>(`/projects/${projectId}/members/${memberId}`, data),

  /**
   * 초대 코드로 프로젝트 조회
   */
  getProjectByInviteCode: (inviteCode: string) =>
    apiClient.get<Project>(`/projects/invite/${inviteCode}`),

  /**
   * 채팅 메시지 조회
   */
  getChatMessages: (projectId: string, params?: { limit?: number; offset?: number }) => {
    const queryParams: Record<string, string> = {};
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }
    
    return apiClient.get<ChatMessage[]>(`/projects/${projectId}/chat`, queryParams);
  },

  /**
   * 채팅 메시지 전송
   */
  sendChatMessage: (projectId: string, content: string) =>
    apiClient.post<ChatMessage>(`/projects/${projectId}/chat`, { content }),
};

/**
 * 사용자 관련 API 클라이언트
 */
export const usersApi = {
  /**
   * 사용자 프로필 조회
   */
  getProfile: (userId: string) =>
    apiClient.get<UserProfile>(`/users/${userId}`),

  /**
   * 사용자 프로필 수정
   */
  updateProfile: (userId: string, data: UpdateUserData) =>
    apiClient.put<UserProfile>(`/users/${userId}`, data),

  /**
   * 사용자 검색
   */
  searchUsers: (query: string, params?: ApiParams) => {
    const queryParams: Record<string, string> = { query };
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      });
    }
    
    return apiClient.get<User[]>('/users/search', queryParams);
  },

  /**
   * 현재 사용자 정보
   */
  getCurrentUser: () =>
    apiClient.get<User>('/users/me'),
};

/**
 * 파일 업로드 API 클라이언트
 */
export const uploadApi = {
  /**
   * 파일 업로드
   */
  uploadFile: async (file: File, type: 'profile' | 'portfolio' = 'profile') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response.json();
  },
};

/**
 * 기본 API 클라이언트 내보내기
 */
export default apiClient;

/**
 * 에러 처리 유틸리티
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
};

/**
 * API 응답 성공 여부 확인
 */
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};