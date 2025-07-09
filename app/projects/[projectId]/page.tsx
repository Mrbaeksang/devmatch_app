"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { 
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { 
  ChatBubble, 
  ChatBubbleAvatar, 
  ChatBubbleMessage 
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users,
  CheckCircle2,
  Target,
  Calendar,
  Send,
  MessageSquare,
  Bot,
  Settings,
  Star,
  GitBranch,
  Clock,
  Trophy
} from "lucide-react";

// 프로젝트 상태 정의
enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

// 팀원 데이터 타입
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  userId?: string;
  isActive: boolean;
}

// 채팅 메시지 타입
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'system';
}

// 프로젝트 데이터 타입
interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  members: TeamMember[];
  techStack: string[];
  createdAt: Date;
  aiAnalysis?: {
    strengths: string[];
    recommendations: string[];
    nextSteps: string[];
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  // 프로젝트 데이터 로드
  const fetchProject = useCallback(async () => {
    try {
      // TODO: 실제 API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시 프로젝트 데이터
      const mockProject: Project = {
        id: projectId,
        name: 'DevMatch AI 플랫폼',
        description: 'AI 기반 팀 빌딩 플랫폼으로 개발자들이 적합한 팀을 찾고 프로젝트를 진행할 수 있도록 돕는 서비스',
        status: ProjectStatus.ACTIVE,
        progress: 75,
        members: [
          {
            id: '1',
            name: '김개발',
            role: 'Frontend Developer',
            avatar: '👨‍💻',
            userId: 'user1',
            isActive: true
          },
          {
            id: '2',
            name: '박백엔드',
            role: 'Backend Developer',
            avatar: '👩‍💻',
            userId: 'user2',
            isActive: true
          },
          {
            id: '3',
            name: '이디자인',
            role: 'UI/UX Designer',
            avatar: '🎨',
            userId: 'user3',
            isActive: false
          },
        ],
        techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI API', 'PostgreSQL'],
        createdAt: new Date(),
        aiAnalysis: {
          strengths: ['강력한 기술 스택', '경험 많은 팀원', '명확한 목표 설정'],
          recommendations: ['사용자 피드백 수집', '성능 최적화', '보안 강화'],
          nextSteps: ['MVP 배포', '사용자 테스트', '피드백 반영']
        }
      };

      // 임시 채팅 메시지
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'system',
          senderName: 'AI 프로젝트 매니저',
          content: '🎉 프로젝트가 성공적으로 시작되었습니다! 팀원들과 함께 목표를 향해 나아가세요.',
          timestamp: new Date(Date.now() - 86400000),
          type: 'system'
        },
        {
          id: '2',
          senderId: 'user1',
          senderName: '김개발',
          content: '안녕하세요! 프론트엔드 개발을 맡은 김개발입니다. 잘 부탁드립니다!',
          timestamp: new Date(Date.now() - 43200000),
          type: 'user'
        },
        {
          id: '3',
          senderId: 'user2',
          senderName: '박백엔드',
          content: '백엔드 개발 담당입니다. API 설계부터 시작해볼까요?',
          timestamp: new Date(Date.now() - 21600000),
          type: 'user'
        },
      ];

      setProject(mockProject);
      setChatMessages(mockMessages);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  // 채팅 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    const messageContent = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);

    try {
      // 사용자 메시지 추가
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'current-user',
        senderName: '나',
        content: messageContent,
        timestamp: new Date(),
        type: 'user'
      };

      setChatMessages(prev => [...prev, userMessage]);

      // TODO: 실제 채팅 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 시스템 응답 (예시)
      const systemResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: 'system',
        senderName: 'AI 프로젝트 매니저',
        content: '메시지가 팀원들에게 전달되었습니다. 곧 답변이 올 것입니다.',
        timestamp: new Date(),
        type: 'system'
      };

      setChatMessages(prev => [...prev, systemResponse]);

    } catch (error) {
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setSendingMessage(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-white">프로젝트 정보 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !project) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">프로젝트를 찾을 수 없습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                {error || '요청하신 프로젝트를 찾을 수 없습니다.'}
              </p>
              <Button onClick={() => router.push('/projects')} className="w-full">
                프로젝트 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusColor = {
    [ProjectStatus.ACTIVE]: 'bg-green-500/20 text-green-400',
    [ProjectStatus.COMPLETED]: 'bg-blue-500/20 text-blue-400',
    [ProjectStatus.PAUSED]: 'bg-yellow-500/20 text-yellow-400',
  };

  const statusText = {
    [ProjectStatus.ACTIVE]: '진행 중',
    [ProjectStatus.COMPLETED]: '완료됨',
    [ProjectStatus.PAUSED]: '일시정지',
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          
          {/* 헤더 */}
          <ExpandableChatHeader className="flex items-center justify-between p-4 border-b border-zinc-800">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-white">
                  {project.name}
                </h1>
                <p className="text-sm text-zinc-400">
                  {project.members.length}명의 팀원 · {project.techStack.length}개 기술
                </p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <Badge className={`${statusColor[project.status]} text-xs`}>
                {statusText[project.status]}
              </Badge>
              <div className="text-right">
                <div className="text-sm text-zinc-400">진행률</div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="w-20 md:w-32 h-2" />
                  <span className="text-xs text-zinc-400">{project.progress}%</span>
                </div>
              </div>
            </div>
          </ExpandableChatHeader>

          {/* 메인 컨텐츠 영역 */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* 왼쪽 프로젝트 정보 */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* 프로젝트 개요 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-zinc-700/50 bg-zinc-800/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        프로젝트 개요
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-300 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 팀원 현황 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-zinc-700/50 bg-zinc-800/30">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        팀원 현황
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                                <span className="text-lg">{member.avatar}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-medium">{member.name}</span>
                                  {member.isActive && (
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-zinc-400">{member.role}</p>
                              </div>
                            </div>
                            <Badge variant={member.isActive ? "default" : "secondary"}>
                              {member.isActive ? "활성" : "비활성"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* AI 분석 */}
                {project.aiAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-blue-500/20 bg-blue-500/5">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Bot className="h-5 w-5" />
                          AI 프로젝트 분석
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-400 mb-2">강점</h4>
                          <ul className="text-sm text-zinc-300 space-y-1">
                            {project.aiAnalysis.strengths.map((strength, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-medium text-blue-400 mb-2">추천사항</h4>
                          <ul className="text-sm text-zinc-300 space-y-1">
                            {project.aiAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <GitBranch className="w-3 h-3 text-blue-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </div>

            {/* 오른쪽 팀 채팅 */}
            <div className="w-96 border-l border-zinc-800 flex flex-col">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  팀 채팅
                </h3>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <ChatMessageList className="h-full p-4">
                  {chatMessages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      variant={message.senderId === 'current-user' ? 'sent' : 'received'}
                    >
                      <ChatBubbleAvatar 
                        fallback={message.type === 'system' ? 'AI' : message.senderName[0]}
                      />
                      <ChatBubbleMessage
                        variant={message.senderId === 'current-user' ? 'sent' : 'received'}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{message.senderName}</span>
                            <span className="text-xs text-zinc-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                      </ChatBubbleMessage>
                    </ChatBubble>
                  ))}
                  <div ref={messagesEndRef} />
                </ChatMessageList>
              </div>

              <div className="p-4 border-t border-zinc-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <ChatInput
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="팀원들과 대화하기..."
                    disabled={sendingMessage}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    type="submit" 
                    disabled={sendingMessage || !chatInput.trim()}
                    size="sm"
                  >
                    {sendingMessage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}