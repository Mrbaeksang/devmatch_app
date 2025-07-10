"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ProjectStatus, InterviewStatus } from "@/types/project";
import { ConsultationData } from "@/types/chat";
import { 
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { generateAvatarDataUrl, deserializeAvatarConfig } from "@/lib/avatar";
import Image from "next/image";

// 팀원 데이터 타입 (확장됨)
interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  consultationCompleted: boolean;
  joinedAt: Date;
  userId?: string;
  interviewStatus: InterviewStatus;
  canStartInterview: boolean;
}

// 프로젝트 데이터 타입 (확장됨)
interface Project {
  id: string;
  name: string;
  goal: string;
  status: ProjectStatus;
  inviteCode: string;
  maxMembers: number;
  createdBy: string;
  consultationData: ConsultationData;
  blueprint?: unknown;
  members: TeamMember[];
  createdAt: Date;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

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
      // 실제 API 호출로 프로젝트 정보 가져오기
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      
      const data = await response.json();
      setProject(data.project);
      setCurrentUser(data.currentUser);
      setInviteUrl(`${window.location.origin}/projects/${projectId}`);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
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
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '프로젝트 참여 중 오류가 발생했습니다.');
      }
      
      toast.success('프로젝트에 참여했습니다!');
      
      // 새로고침하여 업데이트된 팀원 목록 표시
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '프로젝트 참여 중 오류가 발생했습니다.');
    } finally {
      setJoiningProject(false);
    }
  };

  // 초대링크 복사
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('초대링크가 복사되었습니다!');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  // AI 상담하러 가기 (실제로는 개인 면담으로)
  const goToConsultation = () => {
    // currentUser가 있으면 바로 면담으로
    if (currentUser?.id) {
      startInterview(currentUser.id);
    }
  };

  // 진행률 계산 (상담 완료 + 면담 완료)
  const calculateProgress = () => {
    if (!project) return 0;
    const consultationCompleted = project.members.filter(m => m.consultationCompleted).length;
    const interviewCompleted = project.members.filter(m => m.interviewStatus === InterviewStatus.COMPLETED).length;
    
    // 상담 완료 50% + 면담 완료 50%
    const consultationProgress = (consultationCompleted / project.maxMembers) * 50;
    const interviewProgress = (interviewCompleted / project.maxMembers) * 50;
    
    return consultationProgress + interviewProgress;
  };

  // 면담 시작 함수
  const startInterview = async (memberId: string) => {
    try {
      // 면담 페이지로 이동
      router.push(`/projects/${project?.id}/interview?memberId=${memberId}`);
    } catch {
      toast.error('면담 시작 중 오류가 발생했습니다.');
    }
  };

  // 면담 상태 배지 렌더링
  const renderInterviewBadge = (member: TeamMember) => {
    if (!member.consultationCompleted) {
      return (
        <Badge variant="outline" className="text-zinc-500">
          <Clock className="w-3 h-3 mr-1" />
          상담 대기
        </Badge>
      );
    }

    switch (member.interviewStatus) {
      case InterviewStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            면담 완료
          </Badge>
        );
      case InterviewStatus.IN_PROGRESS:
        return (
          <Badge variant="default" className="bg-blue-600">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            면담 중
          </Badge>
        );
      case InterviewStatus.PENDING:
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            면담 준비
          </Badge>
        );
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
                프로젝트를 찾을 수 없습니다.
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
  const interviewCompletedMembers = project.members.filter(m => m.interviewStatus === InterviewStatus.COMPLETED).length;
  const isUserInProject = project.members.some(m => m.userId === currentUser?.userId);
  const allConsultationCompleted = project.members.length === project.maxMembers && completedMembers === project.maxMembers;
  const allInterviewCompleted = interviewCompletedMembers === project.maxMembers;

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
                <p className="text-sm text-zinc-400">
                  {allConsultationCompleted ? 
                    (allInterviewCompleted ? '팀 구성 완료' : '면담 진행 중') : 
                    '팀원 모집 중'
                  }
                </p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-zinc-400">전체 진행률</div>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-20 md:w-32 h-2" />
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(progress)}%
                  </Badge>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  상담: {completedMembers}/{project.maxMembers} | 면담: {interviewCompletedMembers}/{project.maxMembers}
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
                    {project.consultationData?.techStack && typeof project.consultationData.techStack === 'object' && (
                      <div className="space-y-2">
                        {/* Frontend */}
                        {(project.consultationData.techStack as any)?.frontend && (
                          <div>
                            <span className="text-blue-400 text-xs font-medium">Frontend: </span>
                            {[
                              ...((project.consultationData.techStack as any).frontend.languages || []),
                              ...((project.consultationData.techStack as any).frontend.frameworks || []),
                              ...((project.consultationData.techStack as any).frontend.tools || [])
                            ].map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs mr-1 mb-1 bg-blue-600/10 text-blue-300 border-blue-600/30">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Backend */}
                        {(project.consultationData.techStack as any)?.backend && (
                          <div>
                            <span className="text-green-400 text-xs font-medium">Backend: </span>
                            {[
                              ...((project.consultationData.techStack as any).backend.languages || []),
                              ...((project.consultationData.techStack as any).backend.frameworks || []),
                              ...((project.consultationData.techStack as any).backend.tools || [])
                            ].map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs mr-1 mb-1 bg-green-600/10 text-green-300 border-green-600/30">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Collaboration */}
                        {(project.consultationData.techStack as any)?.collaboration && (
                          <div>
                            <span className="text-yellow-400 text-xs font-medium">협업: </span>
                            {[
                              ...((project.consultationData.techStack as any).collaboration.git || []),
                              ...((project.consultationData.techStack as any).collaboration.tools || [])
                            ].map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs mr-1 mb-1 bg-yellow-600/10 text-yellow-300 border-yellow-600/30">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
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
                            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                              {member.avatar ? (
                                <Image
                                  src={generateAvatarDataUrl(deserializeAvatarConfig(member.avatar))}
                                  alt={`${member.name} avatar`}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium">{member.name?.[0] || '?'}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-white font-medium">{member.name}</span>
                              <div className="text-xs text-zinc-400">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderInterviewBadge(member)}
                            {member.consultationCompleted && 
                             member.interviewStatus === InterviewStatus.PENDING && 
                             member.canStartInterview && 
                             currentUser?.userId === member.userId && (
                              <Button 
                                size="sm" 
                                onClick={() => startInterview(member.id)}
                                className="ml-2"
                              >
                                면담 시작
                              </Button>
                            )}
                          </div>
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
                      <h3 className="text-white font-bold text-lg mb-2">개인 면담이 필요합니다</h3>
                      <p className="text-zinc-400 mb-4">
                        역할 분배를 위해 기술 수준을 파악하는 면담을 진행해주세요.
                      </p>
                      <Button 
                        onClick={goToConsultation} 
                        className="w-full text-lg font-bold py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        🎯 개인 면담 시작하기
                      </Button>
                    </CardContent>
                  </Card>
                ) : currentUser && currentUser.consultationCompleted && currentUser.interviewStatus === InterviewStatus.PENDING && currentUser.canStartInterview ? (
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">면담을 시작해주세요</h3>
                      <p className="text-zinc-400 mb-4">
                        팀 구성을 위한 개인 면담을 진행해주세요.
                      </p>
                      <Button onClick={() => startInterview(currentUser.id)} className="w-full">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        면담 시작하기
                      </Button>
                    </CardContent>
                  </Card>
                ) : currentUser && currentUser.interviewStatus === InterviewStatus.COMPLETED ? (
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardContent className="p-6 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">면담 완료!</h3>
                      <p className="text-zinc-400 mb-4">
                        {allInterviewCompleted ? 
                          '모든 팀원의 면담이 완료되었습니다. 곧 팀 분석 결과를 확인할 수 있습니다.' :
                          '다른 팀원들의 면담 완료를 기다리고 있습니다.'
                        }
                      </p>
                      {allInterviewCompleted && (
                        <Button 
                          onClick={() => router.push(`/projects/${project.id}/analysis`)}
                          className="w-full mb-4 text-lg font-bold py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200 transform hover:scale-[1.02]"
                        >
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          🎯 프로젝트 최종 분석 시작
                        </Button>
                      )}
                      <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-medium">실시간 업데이트 중...</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">대기 중</h3>
                      <p className="text-zinc-400 mb-4">
                        {!allConsultationCompleted ? 
                          '모든 팀원의 상담이 완료되면 면담을 시작할 수 있습니다.' :
                          '면담 순서를 기다리고 있습니다.'
                        }
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span className="font-medium">실시간 업데이트 중...</span>
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