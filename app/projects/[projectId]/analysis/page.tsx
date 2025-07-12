"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare,
  Users
} from "lucide-react";

import { 
  ProjectStatus, 
  InterviewStatus, 
  TeamAnalysis
} from "@/types/project";

// 팀원 정보 (새로운 구조)
interface TeamMemberExtended {
  id: string;
  name: string;
  userId: string;
  interviewStatus: InterviewStatus;
  memberProfile?: {
    skillScores?: Record<string, number>;
    workStyles?: string[];
    strengths?: string[];
    leadershipScore?: number;
  };
  role?: string;
  joinedAt: Date;
}

// 프로젝트 정보 (새로운 구조)
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
  const [selectedMember, setSelectedMember] = useState<TeamMemberExtended | null>(null);
  
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
        members: data.members?.map((member: any) => ({
          id: member.id,
          name: member.user?.nickname || member.user?.name || '알 수 없음',
          userId: member.user?.id,
          interviewStatus: member.interviewStatus,
          memberProfile: member.memberProfile,
          role: member.role,
          joinedAt: new Date(member.joinedAt)
        })) || [],
        createdAt: new Date(data.createdAt)
      };
      
      setProject(projectData);
      
      // 기본 선택된 멤버 설정 (팀장 적합도 가장 높은 사람)
      if (projectData.teamAnalysis && !selectedMember) {
        const leadershipDistribution = projectData.teamAnalysis.leadershipDistribution;
        if (leadershipDistribution) {
          const topLeaderUserId = Object.keys(leadershipDistribution).reduce((a, b) => 
            leadershipDistribution[a] > leadershipDistribution[b] ? a : b
          );
          const topLeaderMember = projectData.members.find(m => m.userId === topLeaderUserId);
          if (topLeaderMember) {
            setSelectedMember(topLeaderMember);
          }
        }
      }
      
      // 분석 중인 경우 계속 폴링
      if (data.status === ProjectStatus.ANALYZING) {
        if (!intervalId) {
          const id = setInterval(() => {
            fetchProject();
          }, 3000);
          setIntervalId(id);
        }
      } else if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, intervalId, selectedMember]);

  // 초기 데이터 로드
  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [projectId, fetchProject, intervalId]);

  // 팀 채팅으로 이동
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
  const leadershipDistribution = analysis.leadershipDistribution || {};

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 팀 강점 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-green-500/20 bg-green-500/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    팀 강점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(analysis.teamStrengths || analysis.strengths || []).map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI 조언 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    AI 조언
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(analysis.aiAdvice || analysis.recommendations || []).map((advice, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* 운영 권장사항 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-500" />
                    운영 권장사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(analysis.operationRecommendations || analysis.concerns || []).map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 팀원 카드 (작은 카드 4개) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">팀원 역할 배정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.members.map((member, index) => {
                const leadershipScore = leadershipDistribution[member.userId] || member.memberProfile?.leadershipScore || 0;
                const isSelected = selectedMember?.id === member.id;
                const isTopLeader = leadershipScore === Math.max(...Object.values(leadershipDistribution));
                
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    onClick={() => setSelectedMember(member)}
                    className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500/50 bg-blue-500/10' 
                        : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                    }`}
                  >
                    {isTopLeader && (
                      <div className="absolute -top-2 -right-2">
                        <Crown className="w-6 h-6 text-yellow-500" />
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        isTopLeader 
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                          : 'bg-zinc-700'
                      }`}>
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded-full bg-zinc-600 flex items-center justify-center">
                          <span className="text-xs text-white">{member.name.charAt(0)}</span>
                        </div>
                        <h3 className="font-semibold text-white">{member.name}</h3>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        {member.role || '미배정'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500">팀장 추천도</span>
                          <span className="text-zinc-400">{leadershipScore}%</span>
                        </div>
                        <Progress 
                          value={leadershipScore} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 선택된 멤버 상세 정보 (큰 카드) */}
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{selectedMember.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-xl">{selectedMember.name}</h3>
                      <p className="text-zinc-400">{selectedMember.role || '미배정'}</p>
                    </div>
                    {leadershipDistribution[selectedMember.userId] === Math.max(...Object.values(leadershipDistribution)) && (
                      <Crown className="w-6 h-6 text-yellow-500 ml-auto" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3">개인 강점</h4>
                      <ul className="space-y-2">
                        {(selectedMember.memberProfile?.strengths || ['기술적 역량', '팀 협업 능력']).map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-zinc-300">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-400 mb-3">팀장 추천도</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-lg font-semibold">
                            {leadershipDistribution[selectedMember.userId] || selectedMember.memberProfile?.leadershipScore || 0}%
                          </span>
                          <Badge variant={
                            (leadershipDistribution[selectedMember.userId] || 0) >= 40 ? "default" : 
                            (leadershipDistribution[selectedMember.userId] || 0) >= 25 ? "secondary" : "outline"
                          }>
                            {(leadershipDistribution[selectedMember.userId] || 0) >= 40 ? "높음" : 
                             (leadershipDistribution[selectedMember.userId] || 0) >= 25 ? "보통" : "낮음"}
                          </Badge>
                        </div>
                        <Progress 
                          value={leadershipDistribution[selectedMember.userId] || selectedMember.memberProfile?.leadershipScore || 0} 
                          className="h-3"
                        />
                        <p className="text-xs text-zinc-500">
                          Git/GitHub 기술, 워크스타일, 리더십 성향 종합 평가
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

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