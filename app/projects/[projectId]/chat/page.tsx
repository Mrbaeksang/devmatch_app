"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Users,
  Send,
  MessageSquare
} from "lucide-react";

import { ProjectStatus } from "@/types/project";
import { useChat } from "@/lib/hooks/useChat";
import { LoadingState, ErrorState, PageHeader, MemberCard, ChatMessage } from "@/components/common";

export default function ProjectChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  // Custom Hook 사용 - 모든 채팅 로직이 여기에!
  const {
    project,
    messages,
    newMessage,
    loading,
    sending,
    error,
    messagesEndRef,
    chatContainerRef,
    setNewMessage,
    sendMessage,
    currentMember,
    canChat,
  } = useChat(projectId);

  const handleGoBack = () => {
    router.push(`/projects/${projectId}`);
  };

  // 로딩 상태
  if (loading) {
    return <LoadingState message="채팅방을 불러오는 중..." />;
  }

  // 에러 상태
  if (error || !project) {
    return (
      <ErrorState 
        error={error || '프로젝트를 찾을 수 없습니다.'}
        onGoBack={handleGoBack}
      />
    );
  }

  // 권한 체크
  if (!currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackgroundPaths />
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-yellow-300 mb-4">이 프로젝트의 멤버가 아닙니다.</p>
            <Button onClick={handleGoBack} variant="secondary">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 채팅 불가 상태
  if (!canChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackgroundPaths />
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <p className="text-xl text-yellow-300 mb-4">
              {project.status === ProjectStatus.RECRUITING && '팀 구성이 완료되면 채팅을 시작할 수 있습니다.'}
              {project.status === ProjectStatus.ANALYZING && '팀 분석이 완료되면 채팅을 시작할 수 있습니다.'}
              {project.status === ProjectStatus.COMPLETED && '프로젝트가 완료되었습니다.'}
            </p>
            <Button onClick={handleGoBack} variant="secondary">
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 메인 채팅 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <BackgroundPaths />
      
      {/* 헤더 */}
      <PageHeader
        title={project.name}
        subtitle={project.description}
        onBack={handleGoBack}
        badge={{
          text: "팀 채팅 활성화",
          icon: <MessageSquare className="h-4 w-4" />,
          className: "bg-green-500/20 text-green-300 border-green-500/50"
        }}
      />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 flex gap-4">
        {/* 채팅 영역 */}
        <Card className="flex-1 bg-white/10 backdrop-blur-md border-white/20 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center justify-between">
              <span>팀 채팅</span>
              <span className="text-sm font-normal text-purple-200">
                {messages.length}개의 메시지
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* 메시지 목록 */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="text-center text-purple-200 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>아직 메시지가 없습니다.</p>
                  <p className="text-sm mt-2">첫 메시지를 보내보세요!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = message.user?.id === session?.user?.id;
                  const messageUser = message.user || { name: '시스템', nickname: '시스템', avatar: undefined };
                  
                  return (
                    <ChatMessage
                      key={message.id}
                      message={{
                        id: message.id,
                        role: message.type === 'SYSTEM' ? 'system' : 'user',
                        content: message.content,
                        timestamp: message.createdAt,
                        user: messageUser
                      }}
                      isMyMessage={isMyMessage}
                      variant="chat"
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300"
                  disabled={sending}
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 팀원 목록 */}
        <Card className="w-80 bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              팀원 ({project.members.length}/{project.teamSize})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.members.map((member) => {
              const memberUser = member.user;
              const displayName = memberUser.nickname || memberUser.name;
              const isLeader = member.role === 'TEAMLEAD' || 
                (project.teamAnalysis?.leadershipAnalysis?.recommendedLeader === member.id);
              
              return (
                <MemberCard
                  key={member.id}
                  member={{
                    id: member.id,
                    name: displayName,
                    avatar: memberUser.avatar,
                    interviewStatus: member.interviewStatus
                  }}
                  isLeader={isLeader}
                  showStatus={true}
                  className="bg-white/5"
                />
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}