"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Users,
  CheckCircle2,
  AlertCircle,
  Star,
  Crown,
  Target,
  ArrowLeft,
  Calendar,
  Code,
  Zap,
  Award,
  BookOpen,
  Settings,
  ExternalLink
} from "lucide-react";

import { ProjectStatus } from "@/types/project";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 데이터 가져오기
  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('프로젝트 정보를 불러올 수 없습니다.');
      }

      const projectData = await response.json();
      setProject(projectData);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error instanceof Error ? error.message : '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  // 뒤로 가기
  const handleGoBack = () => {
    router.push('/projects');
  };

  // 프로젝트 상태 표시
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.RECRUITING:
        return <Badge className="bg-blue-600">팀원 모집 중</Badge>;
      case ProjectStatus.INTERVIEWING:
        return <Badge className="bg-yellow-600">면담 진행 중</Badge>;
      case ProjectStatus.ANALYZING:
        return <Badge className="bg-purple-600">분석 중</Badge>;
      case ProjectStatus.ACTIVE:
        return <Badge className="bg-green-600">진행 중</Badge>;
      case ProjectStatus.COMPLETED:
        return <Badge className="bg-gray-600">완료</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
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
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-white">오류 발생</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-zinc-400">
                {error || '프로젝트 정보를 불러올 수 없습니다.'}
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

  const isOwner = project.owner.id === session?.user?.id;

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
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
                <Target className="h-8 w-8 text-green-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                  <p className="text-zinc-400">{project.goal}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              {isOwner && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  <Crown className="w-3 h-3 mr-1" />
                  소유자
                </Badge>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메인 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 프로젝트 개요 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-zinc-700/50 bg-zinc-800/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <BookOpen className="h-5 w-5" />
                      프로젝트 개요
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-zinc-300 mb-2">목표</h4>
                      <p className="text-zinc-400">{project.goal}</p>
                    </div>
                    
                    {project.description && (
                      <div>
                        <h4 className="font-medium text-zinc-300 mb-2">설명</h4>
                        <p className="text-zinc-400">{project.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium text-zinc-300 mb-2">기술 스택</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack?.map((tech: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Code className="w-3 h-3" />
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-zinc-300 mb-1">생성일</h4>
                        <p className="text-zinc-400 text-sm flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {project.startedAt && (
                        <div>
                          <h4 className="font-medium text-zinc-300 mb-1">시작일</h4>
                          <p className="text-zinc-400 text-sm flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {new Date(project.startedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 팀 분석 결과 */}
              {project.teamAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-400">
                        <Award className="h-5 w-5" />
                        팀 분석 결과
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-green-400">
                          {project.teamAnalysis.overallScore}
                        </div>
                        <div className="flex-1">
                          <p className="text-zinc-300">팀 매칭 점수</p>
                          <p className="text-sm text-zinc-400">
                            매우 우수한 팀 구성입니다!
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-400 mb-2">주요 강점</h4>
                          <ul className="space-y-1">
                            {project.teamAnalysis.strengths.slice(0, 3).map((strength: string, index: number) => (
                              <li key={index} className="text-sm text-zinc-300 flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-amber-400 mb-2">권장사항</h4>
                          <ul className="space-y-1">
                            {project.teamAnalysis.recommendations.slice(0, 3).map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-zinc-300 flex items-center gap-2">
                                <Star className="h-3 w-3 text-amber-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => router.push(`/projects/${projectId}/analysis`)}
                        variant="outline"
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        상세 분석 보기
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* 사이드바 - 팀원 정보 */}
            <div className="space-y-6">
              {/* 팀원 목록 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-zinc-700/50 bg-zinc-800/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Users className="h-5 w-5" />
                      팀원 ({project.members.length}/{project.maxMembers})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.members.map((member: { user: { name?: string; email?: string }; role?: string; joinedAt?: string }, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {member.user.name?.[0] || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{member.user.name}</div>
                            <div className="text-xs text-zinc-400">
                              {member.roleAssignment?.assignedRole || '역할 미정'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {member.roleAssignment?.isLeader && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}
                            {member.user.id === session?.user?.id && (
                              <Badge variant="outline" className="text-xs">나</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 빠른 액션 */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-zinc-700/50 bg-zinc-800/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Zap className="h-5 w-5" />
                      빠른 액션
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => router.push(`/projects/join/${project.inviteCode}`)}
                      variant="outline"
                      className="w-full"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      팀원 대기실 보기
                    </Button>
                    
                    {project.teamAnalysis && (
                      <Button 
                        onClick={() => router.push(`/projects/${projectId}/analysis`)}
                        variant="outline"
                        className="w-full"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        팀 분석 보기
                      </Button>
                    )}
                    
                    {isOwner && (
                      <Button 
                        onClick={() => toast.info('프로젝트 설정 기능은 준비 중입니다.')}
                        variant="outline"
                        className="w-full"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        프로젝트 설정
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}