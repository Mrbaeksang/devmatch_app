"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Users,
  ArrowLeft,
  Send,
  MessageSquare,
  Crown,
  CheckCircle2,
  Calendar,
  RefreshCw
} from "lucide-react";

import { ProjectStatus, InterviewStatus } from "@/types/project";
import { generateAvatarDataUrl, deserializeAvatarConfig } from "@/lib/avatar";
import Image from "next/image";

// 채팅 메시지 타입
interface ChatMessage {
  id: string;
  projectId: string;
  userId?: string;
  content: string;
  type: 'USER' | 'SYSTEM' | 'AI';
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
  };
}

// 프로젝트 정보 타입
interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamSize: number;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    interviewStatus: InterviewStatus;
    role?: string;
    user: {
      id: string;
      name: string;
      nickname?: string;
      avatar?: string;
    };
  }>;
  teamAnalysis?: {
    overallScore: number;
    leadershipAnalysis?: {
      recommendedLeader: string;
    };
  };
  createdAt: Date;
}

export default function ProjectChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 메시지 끝으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 프로젝트 정보 가져오기
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      const data = await response.json();
      setProject(data);
    } catch (error) {
      console.error('프로젝트 정보 조회 오류:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, [projectId]);

  // 채팅 메시지 가져오기
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/chat`);
      if (!response.ok) {
        throw new Error('채팅 메시지를 불러올 수 없습니다.');
      }
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('채팅 메시지 조회 오류:', error);
      setError(error instanceof Error ? error.message : '채팅 메시지를 불러오는 중 오류가 발생했습니다.');
    }
  }, [projectId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId && session?.user?.id) {
      Promise.all([fetchProject(), fetchMessages()]).finally(() => {
        setLoading(false);
      });
    }
  }, [projectId, session?.user?.id, fetchProject, fetchMessages]);

  // 메시지 변경 시 스크롤
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 실시간 업데이트 (폴링)
  useEffect(() => {
    if (project && project.status === ProjectStatus.ACTIVE) {
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000); // 3초마다 업데이트

      return () => clearInterval(interval);
    }
  }, [project, fetchMessages]);

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage.trim() })
      });

      if (!response.ok) {
        throw new Error('메시지 전송에 실패했습니다.');
      }

      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    router.push('/projects');
  };

  // 팀장 여부 확인
  const isLeader = (memberId: string) => {
    if (!project?.teamAnalysis?.leadershipAnalysis?.recommendedLeader) return false;
    return project.teamAnalysis.leadershipAnalysis.recommendedLeader === memberId;
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
            <p className="text-white">프로젝트 채팅 로딩 중...</p>
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
              <CardTitle className="text-2xl text-white">프로젝트 채팅</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                {error || '프로젝트를 찾을 수 없습니다.'}
              </p>
              <Button onClick={handleGoBack} className="w-full">
                프로젝트 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 비활성 프로젝트인 경우
  if (project.status !== ProjectStatus.ACTIVE) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">채팅 불가</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                프로젝트가 진행 중이 아니어서 채팅을 사용할 수 없습니다.
              </p>
              <Button onClick={() => router.push(`/projects/${projectId}`)} className="w-full">
                프로젝트 페이지로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* 헤더 */}
        <div className="flex-shrink-0 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-green-500" />
                <div>
                  <h1 className="text-lg font-semibold text-white">{project.name}</h1>
                  <p className="text-sm text-zinc-400">팀 채팅</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                진행 중
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMessages()}
                className="text-zinc-400"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 채팅 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
                    <p className="text-zinc-400">아직 메시지가 없습니다.</p>
                    <p className="text-zinc-500 text-sm">첫 번째 메시지를 보내보세요!</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  // 시스템 메시지 처리
                  if (message.type === 'SYSTEM') {
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center my-4"
                      >
                        <div className="bg-zinc-800/30 rounded-full px-4 py-2 text-sm text-zinc-400">
                          {message.content}
                        </div>
                      </motion.div>
                    );
                  }

                  // 일반 사용자 메시지
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      {/* 아바타 */}
                      <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {message.user?.avatar ? (
                          <Image
                            src={generateAvatarDataUrl(deserializeAvatarConfig(message.user.avatar))}
                            alt={`${message.user.name} avatar`}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium text-sm">
                            {message.user?.name?.[0] || message.user?.nickname?.[0] || '?'}
                          </span>
                        )}
                      </div>

                      {/* 메시지 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {message.user?.nickname || message.user?.name || '알 수 없음'}
                          </span>
                          {message.user && isLeader(message.user.id) && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                          <span className="text-zinc-500 text-xs">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-200 text-sm break-words">{message.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="flex-shrink-0 border-t border-zinc-800 bg-zinc-900/50 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400"
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* 사이드바 - 팀원 목록 */}
          <div className="w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                팀원 ({project.members.length}/{project.teamSize})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {project.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/30">
                  <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                    {member.user.avatar ? (
                      <Image
                        src={generateAvatarDataUrl(deserializeAvatarConfig(member.user.avatar))}
                        alt={`${member.user.name} avatar`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {member.user.name?.[0] || member.user.nickname?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm font-medium truncate">
                        {member.user.nickname || member.user.name}
                      </span>
                      {isLeader(member.user.id) && (
                        <Badge variant="default" className="ml-1 h-5 px-1.5 bg-yellow-600 hover:bg-yellow-600">
                          <Crown className="w-3 h-3 mr-0.5" />
                          <span className="text-xs">팀장</span>
                        </Badge>
                      )}
                    </div>
                    {member.role && (
                      <p className="text-zinc-400 text-xs truncate">{member.role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <Calendar className="h-3 w-3" />
                <span>시작일: {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}