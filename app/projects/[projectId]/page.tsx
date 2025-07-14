"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { ProjectStatus, InterviewStatus, TechStackStructure, ProjectBlueprint } from "@/types/project";
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
  joinedAt: Date;
  userId?: string;
  role?: string;
  interviewStatus: InterviewStatus;
  canStartInterview: boolean;
  agreedToAnalysis: boolean;
  user: {
    id: string;
    name: string;
    nickname?: string;
    avatar?: string;
  };
}

// 프로젝트 데이터 타입 (확장됨)
interface Project {
  id: string;
  name: string;
  description: string;  // goal → description
  status: ProjectStatus;
  inviteCode: string;
  teamSize: number;     // maxMembers → teamSize
  blueprint?: ProjectBlueprint;  // 타입 안정성 개선
  teamAnalysis?: unknown;  // 팀 분석 데이터
  members: TeamMember[];
  createdAt: Date;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joiningProject, setJoiningProject] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [agreeingToAnalysis, setAgreeingToAnalysis] = useState(false);
  
  // 테스트용 상태
  const [addingUserIndex, setAddingUserIndex] = useState<number | null>(null);
  const [completingUserName, setCompletingUserName] = useState<string | null>(null);
  const [resettingUserName, setResettingUserName] = useState<string | null>(null);
  const [agreeingUserName, setAgreeingUserName] = useState<string | null>(null);
  const [triggeringAnalysis, setTriggeringAnalysis] = useState(false);
  const [resettingAllInterviews, setResettingAllInterviews] = useState(false);

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
      setProject(data);
      
      // 현재 사용자 정보를 members에서 찾기
      const user = data.members?.find((member: TeamMember) => member.user.id === session?.user?.id) || null;
      setCurrentUser(user);
      setInviteUrl(`${window.location.origin}/projects/${projectId}`);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, session?.user?.id]);

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId && session?.user?.id) {
      fetchProject();
    }
  }, [projectId, session?.user?.id, fetchProject]);

  // refresh 파라미터 감지 (면담 완료 후 강제 새로고침)
  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    if (refreshParam && projectId && session?.user?.id) {
      // 즉시 새로고침
      fetchProject();
      // URL에서 refresh 파라미터 제거
      const newUrl = `/projects/${projectId}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, projectId, session?.user?.id, fetchProject]);

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

  // 개인 면담하러 가기
  const goToInterview = () => {
    // currentUser가 있으면 바로 면담으로
    if (currentUser?.id) {
      startInterview(currentUser.id);
    }
  };


  // 테스트용 사용자 1명 추가
  const addSingleTestUser = async (index: number) => {
    if (!project) return;
    
    setAddingUserIndex(index);
    try {
      const response = await fetch('/api/test/add-single-dummy-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, userIndex: index })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '테스트 사용자 추가 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      toast.success(result.message || '테스트 사용자가 추가되었습니다!');
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '테스트 사용자 추가 중 오류가 발생했습니다.');
    } finally {
      setAddingUserIndex(null);
    }
  };

  // 테스트용 개별 면담 완료
  const completeSingleTestInterview = async (userName: string) => {
    if (!project) return;
    
    setCompletingUserName(userName);
    try {
      const response = await fetch('/api/test/complete-single-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, userName })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '면담 완료 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      toast.success(result.message || '면담이 완료되었습니다!');
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '면담 완료 중 오류가 발생했습니다.');
    } finally {
      setCompletingUserName(null);
    }
  };

  // 테스트용 개별 면담 초기화
  const resetSingleTestInterview = async (userName: string) => {
    if (!project) return;
    
    setResettingUserName(userName);
    try {
      const response = await fetch('/api/test/reset-single-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, userName })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '면담 초기화 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      toast.success(result.message || '면담이 초기화되었습니다!');
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '면담 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingUserName(null);
    }
  };

  // 모든 멤버 면담 초기화
  const resetAllInterviews = async () => {
    if (!project || !confirm('정말로 모든 팀원의 면담을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    setResettingAllInterviews(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/reset-interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '면담 초기화 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      toast.success(result.message || '모든 멤버의 면담이 초기화되었습니다!');
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '면담 초기화 중 오류가 발생했습니다.');
    } finally {
      setResettingAllInterviews(false);
    }
  };


  // 테스트용 개별 분석 동의
  const agreeSingleTestAnalysis = async (userName: string) => {
    if (!project || agreeingUserName) return;
    
    setAgreeingUserName(userName);
    try {
      const response = await fetch('/api/test/agree-analysis-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, userName })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 동의 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      
      if (result.allAgreed) {
        toast.success('모든 팀원이 동의하여 분석을 시작합니다!');
      } else {
        toast.success(`${result.message} (${result.agreedCount}/${result.totalCount}명 동의)`);
      }
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '분석 동의 중 오류가 발생했습니다.');
    } finally {
      setAgreeingUserName(null);
    }
  };

  // 테스트용 수동 분석 트리거
  const triggerAnalysis = async () => {
    if (!project || triggeringAnalysis) return;
    
    setTriggeringAnalysis(true);
    try {
      const response = await fetch('/api/test/trigger-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 트리거 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      toast.success(result.message || '팀 분석이 완료되었습니다!');
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '분석 트리거 중 오류가 발생했습니다.');
    } finally {
      setTriggeringAnalysis(false);
    }
  };

  // 분석 동의하기
  const agreeToAnalysis = async () => {
    if (!project || agreeingToAnalysis) return;
    
    setAgreeingToAnalysis(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/agree-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '분석 동의 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      
      if (result.allAgreed) {
        toast.success('모든 팀원이 동의하여 분석을 시작합니다!');
      } else {
        toast.success(`분석 동의 완료! (${result.agreedCount}/${result.totalCount}명 동의)`);
      }
      
      // 프로젝트 정보 새로고침
      await fetchProject();
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '분석 동의 중 오류가 발생했습니다.');
    } finally {
      setAgreeingToAnalysis(false);
    }
  };

  // 진행률 계산 (면담 완료 기준)
  const calculateProgress = () => {
    if (!project || project.members.length === 0) return 0;
    const detailedInterviewCompleted = project.members.filter(m => m.interviewStatus === InterviewStatus.COMPLETED).length;
    
    // 전체 팀 규모 기준으로 계산 (현재 참여 인원이 아닌 목표 인원 기준)
    return (detailedInterviewCompleted / project.teamSize) * 100;
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
  const interviewCompletedMembers = project.members.filter(m => m.interviewStatus === InterviewStatus.COMPLETED).length;
  const isUserInProject = project.members.some(m => m.user.id === currentUser?.user.id);
  const allInterviewCompleted = interviewCompletedMembers === project.teamSize;
  const agreedMembers = project.members.filter(m => m.agreedToAnalysis).length;
  const userHasAgreed = currentUser?.agreedToAnalysis || false;

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
                  {allInterviewCompleted ? '팀 구성 완료' : '팀원 모집 중'}
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
                  면담 완료: {interviewCompletedMembers}/{project.teamSize}
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
                    <p className="text-zinc-300 mb-4">{project.description}</p>
                    {project.blueprint && typeof project.blueprint.techStack === 'object' && 'frontend' in project.blueprint.techStack && (
                      <div className="space-y-2">
                        {/* Frontend */}
                        {(project.blueprint.techStack as TechStackStructure).frontend && (
                          <div>
                            <span className="text-blue-400 text-xs font-medium">Frontend: </span>
                            {[
                              ...((project.blueprint.techStack as TechStackStructure).frontend?.languages || []),
                              ...((project.blueprint.techStack as TechStackStructure).frontend?.frameworks || []),
                              ...((project.blueprint.techStack as TechStackStructure).frontend?.tools || [])
                            ].map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs mr-1 mb-1 bg-blue-600/10 text-blue-300 border-blue-600/30">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Backend */}
                        {(project.blueprint.techStack as TechStackStructure).backend && (
                          <div>
                            <span className="text-green-400 text-xs font-medium">Backend: </span>
                            {[
                              ...((project.blueprint.techStack as TechStackStructure).backend?.languages || []),
                              ...((project.blueprint.techStack as TechStackStructure).backend?.frameworks || []),
                              ...((project.blueprint.techStack as TechStackStructure).backend?.tools || [])
                            ].map((tech: string) => (
                              <Badge key={tech} variant="outline" className="text-xs mr-1 mb-1 bg-green-600/10 text-green-300 border-green-600/30">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {/* Collaboration */}
                        {(project.blueprint.techStack as TechStackStructure).collaboration && (
                          <div>
                            <span className="text-yellow-400 text-xs font-medium">협업: </span>
                            {[
                              ...((project.blueprint.techStack as TechStackStructure).collaboration?.git || []),
                              ...((project.blueprint.techStack as TechStackStructure).collaboration?.tools || [])
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
                      팀원 현황 ({project.members.length}/{project.teamSize})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center overflow-hidden">
                              {member.user.avatar ? (
                                <Image
                                  src={generateAvatarDataUrl(deserializeAvatarConfig(member.user.avatar))}
                                  alt={`${member.user.name} avatar`}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-medium">{member.user.name?.[0] || member.user.nickname?.[0] || '?'}</span>
                              )}
                            </div>
                            <div>
                              <span className="text-white font-medium">{member.user.nickname || member.user.name}</span>
                              <div className="text-xs text-zinc-400">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderInterviewBadge(member)}
                          </div>
                        </div>
                      ))}
                      
                      {/* 빈 슬롯 표시 */}
                      {Array.from({ length: project.teamSize - project.members.length }).map((_, index) => (
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
                ) : currentUser && currentUser.interviewStatus === InterviewStatus.PENDING ? (
                  <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-white font-bold text-lg mb-2">개인 면담이 필요합니다</h3>
                      <p className="text-zinc-400 mb-4">
                        역할 분배를 위해 기술 수준을 파악하는 면담을 진행해주세요.
                      </p>
                      <Button 
                        onClick={goToInterview} 
                        className="w-full text-lg font-bold py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        🎯 개인 면담 시작하기
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
                        <>
                          {project.status === ProjectStatus.ANALYZING ? (
                            <div className="mb-4">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                <span className="text-white font-medium">분석 중...</span>
                              </div>
                              <p className="text-sm text-zinc-400">
                                AI가 팀 구성을 분석하고 있습니다.
                              </p>
                            </div>
                          ) : project.status === ProjectStatus.ACTIVE && project.teamAnalysis ? (
                            <Button 
                              onClick={() => router.push(`/projects/${project.id}/analysis`)}
                              className="w-full mb-4 text-lg font-bold py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 transform hover:scale-[1.02]"
                            >
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              📊 분석 결과 확인하기
                            </Button>
                          ) : (
                            <div className="mb-4">
                              <Button 
                                onClick={agreeToAnalysis}
                                disabled={userHasAgreed || agreeingToAnalysis}
                                className="w-full text-lg font-bold py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {agreeingToAnalysis ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    동의 처리 중...
                                  </>
                                ) : userHasAgreed ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    분석 동의 완료
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    🎯 프로젝트 분석 시작하기
                                  </>
                                )}
                              </Button>
                              <div className="text-sm text-zinc-400 mt-2">
                                <p>분석 동의 현황: {agreedMembers}/{project.teamSize}명</p>
                                <p className="text-xs mt-1">모든 팀원이 동의해야 분석이 시작됩니다.</p>
                              </div>
                            </div>
                          )}
                        </>
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
                        면담 순서를 기다리고 있습니다.
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

          {/* 개발 테스트 도구 (개발 환경에서만 표시) */}
          {process.env.NODE_ENV === 'development' && project && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
              <div className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>개발 테스트 도구 (개발 환경에서만 표시)</span>
              </div>
              <div className="flex flex-col gap-3">
                {/* 팀원 추가 섹션 */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2">팀원 추가:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['김프론트', '박백엔드', '이풀스택'].map((name, index) => {
                      const isAlreadyInTeam = project.members.some(m => 
                        m.user.name === name || m.user.nickname?.includes(name.replace('김', '').replace('박', '').replace('이', '').toLowerCase())
                      );
                      const isTeamFull = project.members.length >= project.teamSize;
                      
                      return (
                        <Button
                          key={index}
                          onClick={() => addSingleTestUser(index)}
                          disabled={addingUserIndex === index || isAlreadyInTeam || isTeamFull}
                          size="sm"
                          variant="outline"
                          className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-xs"
                        >
                          {addingUserIndex === index ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isAlreadyInTeam ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          <span className="ml-1 truncate">
                            {name}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* 면담 관리 섹션 */}
                <div>
                  <p className="text-xs text-zinc-400 mb-2">면담 관리:</p>
                  {/* 전체 면담 초기화 버튼 */}
                  <Button
                    onClick={resetAllInterviews}
                    disabled={resettingAllInterviews}
                    size="sm"
                    variant="outline"
                    className="w-full mb-2 border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    {resettingAllInterviews ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        초기화 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        🔄 모든 면담 초기화 (개선된 면담 재시작)
                      </>
                    )}
                  </Button>
                  <div className="space-y-2">
                    {['김프론트', '박백엔드', '이풀스택'].map((name) => {
                      const member = project.members.find(m => m.user.name === name);
                      if (!member) return null;
                      
                      const isCompleted = member.interviewStatus === 'COMPLETED';
                      
                      return (
                        <div key={name} className="flex items-center gap-2">
                          <span className="text-xs text-zinc-300 w-16">{name}:</span>
                          {isCompleted ? (
                            <Button
                              onClick={() => resetSingleTestInterview(name)}
                              disabled={resettingUserName === name}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs"
                            >
                              {resettingUserName === name ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                              <span className="ml-1">면담 초기화</span>
                            </Button>
                          ) : (
                            <Button
                              onClick={() => completeSingleTestInterview(name)}
                              disabled={completingUserName === name}
                              size="sm"
                              variant="outline"
                              className="flex-1 border-green-500/20 text-green-400 hover:bg-green-500/10 text-xs"
                            >
                              {completingUserName === name ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span className="ml-1">면담 완료</span>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 분석 동의 섹션 */}
                {allInterviewCompleted && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">분석 동의:</p>
                    <div className="space-y-2">
                      {project.members.map((member) => {
                        const name = member.user.name || member.user.nickname || '익명';
                        const isOwner = member.role === 'owner';
                        const hasAgreed = member.agreedToAnalysis;
                        
                        return (
                          <div key={member.id} className="flex items-center gap-2">
                            <span className="text-xs text-zinc-300 w-16">
                              {name}{isOwner && ' (나)'}:
                            </span>
                            {hasAgreed ? (
                              <div className="flex-1 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-400">
                                ✅ 분석 동의 완료
                              </div>
                            ) : isOwner ? (
                              <Button
                                onClick={agreeToAnalysis}
                                disabled={agreeingToAnalysis}
                                size="sm"
                                variant="outline"
                                className="flex-1 border-blue-500/20 text-blue-400 hover:bg-blue-500/10 text-xs"
                              >
                                {agreeingToAnalysis ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                <span className="ml-1">분석 동의</span>
                              </Button>
                            ) : (
                              <Button
                                onClick={() => agreeSingleTestAnalysis(name)}
                                disabled={agreeingUserName === name}
                                size="sm"
                                variant="outline"
                                className="flex-1 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 text-xs"
                              >
                                {agreeingUserName === name ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                <span className="ml-1">분석 동의</span>
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 수동 분석 트리거 (ANALYZING 상태일 때만) */}
                {project.status === 'ANALYZING' && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-2">분석 상태:</p>
                    <Button
                      onClick={triggerAnalysis}
                      disabled={triggeringAnalysis}
                      size="sm"
                      variant="outline"
                      className="w-full border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
                    >
                      {triggeringAnalysis ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          분석 처리 중...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          🚀 수동 분석 완료 처리
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-zinc-600 mt-1">분석이 멈춘 경우 수동으로 완료 처리</p>
                  </div>
                )}
                
                <div className="text-xs text-zinc-500 mt-1 border-t border-zinc-700 pt-2">
                  <div className="flex justify-between items-center">
                    <span>• 팀원 상태: {project.members.length}/{project.teamSize}명</span>
                    <span>• 면담 완료: {project.members.filter(m => m.interviewStatus === 'COMPLETED').length}명</span>
                  </div>
                  <p className="mt-1 text-zinc-600">💡 면담 완료 시 프로젝트 기술스택에 맞춰 자동으로 점수가 생성됩니다</p>
                </div>
              </div>
            </div>
          )}

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