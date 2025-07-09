// types/chat.ts
// 채팅 관련 타입 정의

/**
 * 메시지 타입 열거형
 */
export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  AI = 'AI'
}

/**
 * 채팅 메시지 인터페이스
 */
export interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string; // 답장 대상 메시지 ID
}

/**
 * 메시지 생성 데이터
 */
export interface CreateMessageData {
  content: string;
  type?: MessageType;
  replyTo?: string;
}

/**
 * 메시지 수정 데이터
 */
export interface UpdateMessageData {
  content: string;
}

/**
 * 타이핑 상태 정보
 */
export interface TypingStatus {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

/**
 * 채팅방 참여자 정보
 */
export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
  role?: string;
}

/**
 * 채팅방 정보
 */
export interface ChatRoom {
  id: string;
  projectId: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 메시지 페이지네이션 파라미터
 */
export interface MessagePaginationParams {
  limit?: number;
  offset?: number;
  before?: string; // 특정 메시지 ID 이전 메시지들
  after?: string; // 특정 메시지 ID 이후 메시지들
}

/**
 * 채팅 이벤트 타입
 */
export enum ChatEventType {
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_EDITED = 'MESSAGE_EDITED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  TYPING_START = 'TYPING_START',
  TYPING_STOP = 'TYPING_STOP',
  USER_ONLINE = 'USER_ONLINE',
  USER_OFFLINE = 'USER_OFFLINE',
}

/**
 * 채팅 이벤트 데이터
 */
export interface ChatEvent {
  type: ChatEventType;
  projectId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

/**
 * WebSocket 메시지 형식
 */
export interface WebSocketMessage {
  type: 'chat' | 'typing' | 'status' | 'error';
  event: ChatEventType;
  data: any;
  timestamp: Date;
}

/**
 * 채팅 설정
 */
export interface ChatSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  showTypingIndicator: boolean;
  messagePreview: boolean;
  autoScroll: boolean;
  theme: 'light' | 'dark' | 'system';
}

/**
 * 파일 첨부 정보
 */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

/**
 * 확장된 채팅 메시지 (첨부 파일 포함)
 */
export interface ExtendedChatMessage extends ChatMessage {
  attachments?: MessageAttachment[];
  mentions?: string[]; // 멘션된 사용자 ID들
  reactions?: MessageReaction[];
}

/**
 * 메시지 반응 (이모지)
 */
export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // 반응한 사용자 ID들
}

/**
 * 채팅 통계
 */
export interface ChatStats {
  totalMessages: number;
  totalParticipants: number;
  activeUsers: number;
  messagesPerDay: { date: string; count: number }[];
  topUsers: { userId: string; userName: string; messageCount: number }[];
}

/**
 * 채팅 검색 결과
 */
export interface ChatSearchResult {
  message: ChatMessage;
  highlights: string[];
  context: {
    before: ChatMessage[];
    after: ChatMessage[];
  };
}

/**
 * 채팅 검색 파라미터
 */
export interface ChatSearchParams {
  query: string;
  projectId: string;
  userId?: string;
  type?: MessageType;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

// ======================
// AI 상담 관련 타입들
// ======================

/**
 * AI 상담 단계
 */
export enum ConsultationStep {
  NAME_COLLECTION = 'NAME_COLLECTION',
  PROJECT_INFO_COLLECTION = 'PROJECT_INFO_COLLECTION',
  TEAM_STRUCTURE_PROPOSAL = 'TEAM_STRUCTURE_PROPOSAL',
  SUMMARY_CONFIRMATION = 'SUMMARY_CONFIRMATION',
  COMPLETED = 'COMPLETED',
}

/**
 * AI 상담 데이터
 */
export interface ConsultationData {
  userName?: string;
  projectName?: string;
  projectGoal?: string;
  projectScope?: string; // 프론트엔드/백엔드 구현 범위
  techStack?: string[];
  mainFeatures?: string[];
  projectDuration?: string; // 프로젝트 기간
  duration?: string; // AI가 저장하는 기간 필드 (하위 호환성)
  communicationSkills?: string[];
  teamMembersCount?: number;
  aiSuggestedRoles?: Array<{ role: string; count: number; note?: string }>;
}

/**
 * AI 상담 메시지
 */
export interface ConsultationMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

/**
 * AI 응답 형식
 */
export interface AIResponse {
  displayMessage?: string;
  nextStep?: ConsultationStep;
  consultationData?: ConsultationData;
  isConsultationComplete?: boolean;
}