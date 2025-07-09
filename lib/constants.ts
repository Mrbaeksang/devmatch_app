// lib/constants.ts
// 프로젝트 전역 상수 정의

/**
 * API 관련 상수
 */
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  USERS: '/api/users',
  CHAT: '/api/chat',
  UPLOAD: '/api/upload',
  AUTH: '/api/auth',
} as const;

/**
 * 프로젝트 설정 상수
 */
export const PROJECT_SETTINGS = {
  DEFAULT_MAX_MEMBERS: 4,
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 10,
  INVITE_CODE_LENGTH: 8,
  INVITE_CODE_EXPIRY_DAYS: 7,
  
  // 프로젝트 이름 제한
  MIN_PROJECT_NAME_LENGTH: 2,
  MAX_PROJECT_NAME_LENGTH: 50,
  
  // 프로젝트 설명 제한
  MIN_PROJECT_DESCRIPTION_LENGTH: 10,
  MAX_PROJECT_DESCRIPTION_LENGTH: 500,
  
  // 기술 스택 제한
  MAX_TECH_STACK_COUNT: 10,
  
  // 역할 제한
  MAX_ROLES_COUNT: 8,
} as const;

/**
 * 사용자 설정 상수
 */
export const USER_SETTINGS = {
  // 이름 제한
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 30,
  
  // 자기소개 제한
  MAX_BIO_LENGTH: 200,
  
  // 스킬 제한
  MAX_SKILLS_COUNT: 20,
  
  // 포트폴리오 제한
  MAX_PORTFOLIO_ITEMS: 10,
} as const;

/**
 * 채팅 설정 상수
 */
export const CHAT_SETTINGS = {
  MESSAGE_MAX_LENGTH: 1000,
  MESSAGES_PER_PAGE: 50,
  TYPING_TIMEOUT: 3000, // 3초
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_DELAY: 1000, // 1초
} as const;

/**
 * 파일 업로드 상수
 */
export const UPLOAD_SETTINGS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  
  // 이미지 최대 크기
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
} as const;

/**
 * 애니메이션 상수
 */
export const ANIMATION_SETTINGS = {
  // 페이지 전환 시간
  PAGE_TRANSITION_DURATION: 0.3,
  
  // 모달 애니메이션
  MODAL_ANIMATION_DURATION: 0.2,
  
  // 카드 호버 애니메이션
  CARD_HOVER_SCALE: 1.02,
  
  // 스크롤 애니메이션
  SCROLL_ANIMATION_THRESHOLD: 0.1,
  
  // 타이핑 애니메이션
  TYPING_ANIMATION_SPEED: 20, // ms per character
} as const;

/**
 * 색상 상수
 */
export const COLORS = {
  PRIMARY: '#3b82f6', // blue-500
  SECONDARY: '#6b7280', // gray-500
  SUCCESS: '#10b981', // green-500
  WARNING: '#f59e0b', // yellow-500
  ERROR: '#ef4444', // red-500
  INFO: '#06b6d4', // cyan-500
  
  // 배경 색상
  BACKGROUND_PRIMARY: '#0a0a0a', // zinc-950
  BACKGROUND_SECONDARY: '#1a1a1a', // zinc-900
  BACKGROUND_TERTIARY: '#2a2a2a', // zinc-800
  
  // 텍스트 색상
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#d4d4d8', // zinc-300
  TEXT_MUTED: '#a1a1aa', // zinc-400
  TEXT_DISABLED: '#71717a', // zinc-500
} as const;

/**
 * 브레이크포인트 상수
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  THEME: 'devmatch-theme',
  LANGUAGE: 'devmatch-language',
  RECENT_PROJECTS: 'devmatch-recent-projects',
  DRAFT_MESSAGE: 'devmatch-draft-message',
  USER_PREFERENCES: 'devmatch-user-preferences',
  NOTIFICATION_SETTINGS: 'devmatch-notification-settings',
} as const;

/**
 * 알림 타입
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * 프로젝트 상태별 설정
 */
export const PROJECT_STATUS_CONFIG = {
  RECRUITING: {
    label: '팀원 모집 중',
    color: 'blue',
    description: '프로젝트 팀원을 모집하고 있습니다',
  },
  CONSULTING: {
    label: '상담 진행 중',
    color: 'orange',
    description: '팀원들의 AI 상담이 진행 중입니다',
  },
  ANALYZING: {
    label: 'AI 분석 중',
    color: 'purple',
    description: 'AI가 팀 구성을 분석하고 있습니다',
  },
  ACTIVE: {
    label: '진행 중',
    color: 'green',
    description: '프로젝트가 활발히 진행 중입니다',
  },
  COMPLETED: {
    label: '완료됨',
    color: 'gray',
    description: '프로젝트가 성공적으로 완료되었습니다',
  },
  PAUSED: {
    label: '일시 정지',
    color: 'yellow',
    description: '프로젝트가 일시적으로 중단되었습니다',
  },
} as const;

/**
 * 기본 기술 스택 목록
 */
export const DEFAULT_TECH_STACKS = [
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
  'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS',
  
  // Backend
  'Node.js', 'Python', 'Java', 'Spring Boot', 'Django', 'FastAPI',
  'Express.js', 'NestJS', 'PHP', 'Laravel', 'Ruby on Rails',
  
  // Database
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase',
  
  // Mobile
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Ionic',
  
  // DevOps
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify',
  
  // Tools
  'Git', 'GitHub', 'GitLab', 'Figma', 'Postman', 'Jest', 'Cypress',
] as const;

/**
 * 기본 역할 목록
 */
export const DEFAULT_ROLES = [
  {
    name: 'Frontend Developer',
    description: '사용자 인터페이스 개발을 담당합니다',
    skills: ['React', 'TypeScript', 'CSS', 'HTML'],
  },
  {
    name: 'Backend Developer',
    description: '서버 사이드 로직 개발을 담당합니다',
    skills: ['Node.js', 'Python', 'Database', 'API'],
  },
  {
    name: 'Full Stack Developer',
    description: '프론트엔드와 백엔드 모두 개발합니다',
    skills: ['React', 'Node.js', 'Database', 'API'],
  },
  {
    name: 'UI/UX Designer',
    description: '사용자 경험 및 인터페이스 디자인을 담당합니다',
    skills: ['Figma', 'Sketch', 'Adobe XD', 'Prototyping'],
  },
  {
    name: 'Project Manager',
    description: '프로젝트 관리 및 팀 조율을 담당합니다',
    skills: ['Project Management', 'Communication', 'Planning'],
  },
  {
    name: 'DevOps Engineer',
    description: '개발 및 운영 환경 구축을 담당합니다',
    skills: ['Docker', 'AWS', 'CI/CD', 'Linux'],
  },
] as const;

/**
 * 환경 설정
 */
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

/**
 * 정규 표현식 패턴
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  GITHUB_URL: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+$/,
  LINKEDIN_URL: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+$/,
  PHONE: /^[+]?[\d\s-()]{10,}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

/**
 * 타임아웃 설정
 */
export const TIMEOUT_SETTINGS = {
  API_REQUEST: 30000, // 30초
  WEBSOCKET_RECONNECT: 5000, // 5초
  NOTIFICATION_DURATION: 5000, // 5초
  TYPING_INDICATOR: 3000, // 3초
  IDLE_TIMEOUT: 900000, // 15분
} as const;