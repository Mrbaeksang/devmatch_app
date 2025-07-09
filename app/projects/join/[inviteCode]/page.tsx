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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users,
  CheckCircle2,
  Clock,
  Copy,
  UserPlus,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  Link
} from "lucide-react";

// 프로젝트 상태 정의
enum ProjectStatus {
  RECRUITING = 'RECRUITING',
  CONSULTING = 'CONSULTING', 
  ANALYZING = 'ANALYZING',
  ACTIVE = 'ACTIVE',
}

// 팀원 데이터 타입
interface TeamMember {
  id: string;
  name: string;
  consultationCompleted: boolean;
  joinedAt: Date;
  userId?: string;
}

// 프로젝트 데이터 타입
interface Project {
  id: string;
  name: string;
  goal: string;
  status: ProjectStatus;
  inviteCode: string;
  maxMembers: number;
  createdBy: string;
  consultationData: any;
  members: TeamMember[];
  createdAt: Date;
}

export default function JoinProjectPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joiningProject, setJoiningProject] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');

  // 자동 새로고침을 위한 인터벌
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 초대 코드 유효성 검사 및 프로젝트 정보 가져오기
  const fetchProject = useCallback(async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 임시 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      
      // 임시 프로젝트 데이터
      const mockProject: Project = {
        id: '1',
        name: 'DevMatch AI 플랫폼',
        goal: 'AI 기반 팀 빌딩 플랫폼 개발',
        status: ProjectStatus.RECRUITING,
        inviteCode: inviteCode,
        maxMembers: 4,
        createdBy: 'user1',
        consultationData: {
          projectName: 'DevMatch AI 플랫폼',
          projectGoal: 'AI 기반 팀 빌딩 플랫폼 개발',
          techStack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI API'],
          teamMembersCount: 4,
        },
        members: [
          {
            id: '1',
            name: '김개발',
            consultationCompleted: true,
            joinedAt: new Date(),
            userId: 'user1'
          },
          {
            id: '2', 
            name: '박프론트',
            consultationCompleted: false,
            joinedAt: new Date(),
            userId: 'user2'
          },
        ],
        createdAt: new Date(),
      };

      // 현재 사용자 (임시)
      const mockCurrentUser: TeamMember = {
        id: '2',
        name: '박프론트',
        consultationCompleted: false,
        joinedAt: new Date(),
        userId: 'user2'
      };

      setProject(mockProject);
      setCurrentUser(mockCurrentUser);
      setInviteUrl(`${window.location.origin}/projects/join/${inviteCode}`);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [inviteCode]);

  // 초기 데이터 로드
  useEffect(() => {
    if (inviteCode) {
      fetchProject();
    }
  }, [inviteCode, fetchProject]);

  // 실시간 업데이트 (폴링)
  useEffect(() => {
    if (project && project.status === ProjectStatus.RECRUITING) {
      intervalRef.current = setInterval(() => {
        fetchProject();
      }, 5000); // 5초마다 업데이트
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [project, fetchProject]);

  // 프로젝트 참여하기
  const handleJoinProject = async () => {
    if (!project) return;
    
    setJoiningProject(true);
    try {
      // TODO: 실제 API 호출로 대체
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시로 참여 성공 처리
      toast.success('프로젝트에 참여했습니다!');
      
      // 새로고침하여 업데이트된 팀원 목록 표시
      await fetchProject();
      
    } catch (error) {
      toast.error('프로젝트 참여 중 오류가 발생했습니다.');
    } finally {
      setJoiningProject(false);
    }
  };

  // 초대링크 복사
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('초대링크가 복사되었습니다!');
    } catch (error) {
      toast.error('복사에 실패했습니다.');
    }
  };

  // AI 상담하러 가기
  const goToConsultation = () => {
    router.push('/projects/new');
  };

  // 진행률 계산
  const calculateProgress = () => {
    if (!project) return 0;
    const completedMembers = project.members.filter(m => m.consultationCompleted).length;
    return (completedMembers / project.maxMembers) * 100;
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
            <p className="text-white">초대 코드 확인 중...</p>
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
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">프로젝트 초대</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                {error || '유효하지 않거나 만료된 초대 코드입니다.'}
              </p>
              <p className="text-sm text-zinc-500">
                초대 코드: <span className="font-mono font-bold text-red-400">{inviteCode}</span>
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

  const progress = calculateProgress();
  const completedMembers = project.members.filter(m => m.consultationCompleted).length;
  const isUserInProject = project.members.some(m => m.userId === currentUser?.userId);

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-full bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
          
          {/* 헤더 */}
          <ExpandableChatHeader className="flex items-center justify-between p-4 border-b border-zinc-800">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              <div>
                <h1 className="text-lg md:text-xl font-semibold text-white">
                  {project.name}
                </h1>
                <p className="text-sm text-zinc-400">팀원 모집 중</p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-zinc-400">진행률</div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-20 md:w-32 h-2" />
                  <Badge variant="secondary" className="text-xs">
                    {completedMembers}/{project.maxMembers}
                  </Badge>
                </div>
              </div>
            </div>
          </ExpandableChatHeader>

          {/* 본문 */}
          <ExpandableChatBody>
            <div className="p-6 space-y-6">
              
              {/* 프로젝트 정보 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-zinc-700/50 bg-zinc-800/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      프로젝트 개요
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 mb-4">{project.goal}</p>
                    {project.consultationData?.techStack && (
                      <div className="flex flex-wrap gap-2">
                        {project.consultationData.techStack.map((tech: string) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      팀원 현황 ({project.members.length}/{project.maxMembers})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">{member.name[0]}</span>
                            </div>
                            <div>
                              <span className="text-white font-medium">{member.name}</span>
                              <div className="text-xs text-zinc-400">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Badge variant={member.consultationCompleted ? "default" : "secondary"}>
                            {member.consultationCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                상담 완료
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                대기 중
                              </>
                            )}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* 빈 슬롯 표시 */}
                      {Array.from({ length: project.maxMembers - project.members.length }).map((_, index) => (
                        <div key={`empty-${index}`} className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg border-2 border-dashed border-zinc-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                              <UserPlus className="w-4 h-4 text-zinc-500" />
                            </div>
                            <span className="text-zinc-500">팀원 모집 중...</span>
                          </div>
                          <Badge variant="outline" className="text-zinc-500">
                            대기 중
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 사용자 액션 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {!isUserInProject ? (
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="p-6 text-center">
                      <UserPlus className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">프로젝트에 참여하시겠습니까?</h3>
                      <p className="text-zinc-400 mb-4">
                        팀에 합류하여 함께 프로젝트를 만들어보세요!
                      </p>
                      <Button 
                        onClick={handleJoinProject}
                        disabled={joiningProject}
                        className="w-full"
                      >
                        {joiningProject ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            참여 중...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            프로젝트 참여하기
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ) : currentUser && !currentUser.consultationCompleted ? (
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">AI 상담을 완료해주세요</h3>
                      <p className="text-zinc-400 mb-4">
                        프로젝트 시작을 위해 개인 상담을 완료해주세요.
                      </p>
                      <Button onClick={goToConsultation} className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        AI 상담하러 가기
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="p-6 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">상담 완료!</h3>
                      <p className="text-zinc-400 mb-4">
                        다른 팀원들의 상담 완료를 기다리고 있습니다.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <RefreshCw className="w-4 h-4" />
                        실시간 업데이트 중...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </ExpandableChatBody>

          {/* 하단 초대링크 */}
          <ExpandableChatFooter>
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Link className="w-4 h-4" />
                  <span className="text-sm">초대링크 공유</span>
                </div>
                <div className="flex-1 flex gap-2">
                  <input 
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white font-mono"
                    readOnly
                  />
                  <Button 
                    onClick={copyInviteLink}
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </ExpandableChatFooter>
        </div>
      </div>
    </div>
  );
}