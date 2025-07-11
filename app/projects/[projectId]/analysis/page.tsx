"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Star,
  Crown,
  TrendingUp,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Brain,
  MessageSquare
} from "lucide-react";

import { 
  ProjectStatus, 
  InterviewStatus, 
  MemberProfile, 
  TeamAnalysis, 
  RoleAssignment
} from "@/types/project";

// 팀원 정보 (확장됨)
interface TeamMemberExtended {
  id: string;
  name: string;
  interviewStatus: InterviewStatus;
  memberProfile?: MemberProfile;
  roleAssignment?: RoleAssignment;
  joinedAt: Date;
  userId?: string;
}

// 프로젝트 정보 (확장됨)
interface ProjectExtended {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  inviteCode: string;
  teamSize: number;
  blueprint?: unknown;
  teamAnalysis?: TeamAnalysis;
  members: TeamMemberExtended[];
  createdAt: Date;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  useSession();
  
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectExtended | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 자동 새로고침을 위한 인터벌
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // 프로젝트 데이터 가져오기
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('프로젝트를 찾을 수 없습니다.');
      }
      
      const data = await response.json();
      
      // 타입 변환 및 데이터 매핑
      const projectData: ProjectExtended = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        inviteCode: data.inviteCode,
        teamSize: data.teamSize,
        blueprint: data.blueprint,
        teamAnalysis: data.teamAnalysis,
        members: data.members?.map((member: {
          id: string;
          user?: {
            id?: string;
            name?: string;
            nickname?: string;
          };
          interviewStatus: InterviewStatus;
          memberProfile?: unknown;
          role?: string;
          joinedAt: string;
        }) => ({
          id: member.id,
          name: member.user?.nickname || member.user?.name || '알 수 없음',
          interviewStatus: member.interviewStatus,
          memberProfile: member.memberProfile,
          roleAssignment: data.teamAnalysis ? {
            userId: member.user?.id,
            assignedRole: member.role || '미정',
            isLeader: member.role?.includes('팀장') || false,
            reasoning: '',
            responsibilities: [],
            matchScore: 0
          } : undefined,
          joinedAt: new Date(member.joinedAt),
          userId: member.user?.id
        })) || [],
        createdAt: new Date(data.createdAt)
      };
      
      setProject(projectData);
      
      // 분석 중인 경우 계속 폴링
      if (data.status === ProjectStatus.ANALYZING) {
        if (!intervalId) {
          const id = setInterval(() => {
            fetchProject();
          }, 3000); // 3초마다 확인
          setIntervalId(id);
        }
      } else if (intervalId) {
        // 분석 완료 시 폴링 중지
        clearInterval(intervalId);
        setIntervalId(null);
      }
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, intervalId]);

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    
    // 클린업
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [projectId, fetchProject, intervalId]);

  // 프로젝트 채팅으로 이동
  const goToProjectChat = () => {
    router.push(`/projects/${projectId}/chat`);
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
            <p className="text-white">프로젝트 정보를 불러오는 중...</p>
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
              <CardTitle className="text-2xl text-white">오류 발생</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                {error || '프로젝트 정보를 불러올 수 없습니다.'}
              </p>
              <Button onClick={() => router.back()} className="w-full">
                돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 분석 중 상태
  if (project.status === ProjectStatus.ANALYZING) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardHeader className="text-center">
              <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-3xl text-white mb-2">AI가 팀을 분석하고 있습니다</CardTitle>
              <p className="text-zinc-400">
                팀원들의 기술 스택과 경험을 바탕으로 최적의 역할 분배를 계산중입니다...
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-lg text-white">분석 진행 중...</span>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>모든 팀원 면담 데이터 수집 완료</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span>팀원 기술 스택 분석 완료</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>최적 역할 분배 계산 중...</span>
                  </div>
                </div>
                <p className="text-center text-sm text-zinc-500">
                  분석은 보통 1-2분 정도 소요됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 분석 결과가 없는 경우
  if (!project.teamAnalysis) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur border-zinc-800">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">분석 결과 없음</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                아직 팀 분석이 완료되지 않았습니다.
              </p>
              <Button onClick={() => router.push(`/projects/${projectId}`)} className="w-full">
                팀 대기실로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const analysis = project.teamAnalysis;
  const leaderInfo = project.members.find(m => 
    m.userId === analysis.leadershipAnalysis?.recommendedLeader
  );

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* 헤더 */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <Button
              onClick={() => router.push(`/projects/${projectId}`)}
              variant="ghost"
              className="mb-4 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              팀 대기실로 돌아가기
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                <p className="text-zinc-400">{project.description}</p>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                분석 완료
              </Badge>
            </div>
          </motion.div>

          {/* 종합 점수 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                    <span className="text-4xl font-bold text-white">
                      {analysis.overallScore}점
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">팀 종합 점수</h2>
                  <p className="text-zinc-300">
                    AI가 분석한 팀의 전반적인 조화도와 성공 가능성입니다
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* 팀 강점 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    팀의 강점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* 개선 필요사항 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    개선 필요사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.concerns.map((concern, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI 권장사항 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  AI 권장사항
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* 리더십 분석 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="h-6 w-6 text-yellow-500" />
                  추천 팀장
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderInfo && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{leaderInfo.name}</h3>
                        <p className="text-zinc-400">프로젝트 리더로 추천됨</p>
                      </div>
                    </div>
                    
                    <Separator className="bg-zinc-800" />
                    
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3">리더십 평가</h4>
                      <div className="space-y-3">
                        {analysis.leadershipAnalysis?.leadershipScores.map((score) => {
                          const member = project.members.find(m => m.userId === score.userId);
                          return (
                            <div key={score.userId} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-300">
                                  {member?.name || '알 수 없음'}
                                  {score.userId === analysis.leadershipAnalysis?.recommendedLeader && (
                                    <Crown className="inline-block w-4 h-4 ml-2 text-yellow-500" />
                                  )}
                                </span>
                                <span className="text-zinc-400">{score.score}점</span>
                              </div>
                              <Progress value={score.score} className="h-2" />
                              <p className="text-xs text-zinc-500">{score.reasoning}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 프로젝트 시작 버튼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              onClick={goToProjectChat}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold"
            >
              <MessageSquare className="w-6 h-6 mr-3" />
              팀 채팅방으로 이동하기
            </Button>
            <p className="text-sm text-zinc-500 mt-4">
              이제 팀원들과 함께 프로젝트를 시작할 수 있습니다!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}