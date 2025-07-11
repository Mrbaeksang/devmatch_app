"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Plus, 
  Target, 
  Users, 
  Clock, 
  CheckCircle2, 
  Loader2,
  MessageSquare,
  Calendar,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { ProjectStatus, InterviewStatus } from "@/types/project";

// 사용자 프로젝트 타입
interface UserProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamSize: number;
  currentMembers: number;
  joinedAt: Date;
  myRole?: string;
  myInterviewStatus: InterviewStatus;
  inviteCode: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    interviewStatus: InterviewStatus;
    role?: string;
  }>;
  blueprint?: unknown;
  teamAnalysis?: unknown;
  createdAt: Date;
}

const ProjectsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 목록 가져오기
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects/my-projects');
      if (!response.ok) {
        throw new Error('프로젝트 목록을 불러올 수 없습니다.');
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('프로젝트 목록 조회 오류:', error);
      setError(error instanceof Error ? error.message : '프로젝트 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그인 확인 및 프로필 완성 여부 체크
  useEffect(() => {
    if (status === "loading") return; // 로딩 중이면 대기
    if (!session) {
      router.push("/"); // 로그인 안 되어 있으면 홈페이지로
      return;
    }
    
    // 프로필 완성 여부 확인
    if (session.user && !session.user.isCompleted) {
      console.log("프로필 미완성 - 프로필 완성 페이지로 이동");
      router.push("/auth/complete-profile");
      return;
    }

    // 프로젝트 목록 가져오기
    fetchProjects();
  }, [session, status, router, fetchProjects]);

  // 프로젝트 상태별 색상
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.RECRUITING:
        return 'bg-blue-600';
      case ProjectStatus.INTERVIEWING:
        return 'bg-yellow-600';
      case ProjectStatus.ANALYZING:
        return 'bg-purple-600';
      case ProjectStatus.ACTIVE:
        return 'bg-green-600';
      case ProjectStatus.COMPLETED:
        return 'bg-gray-600';
      case ProjectStatus.PAUSED:
        return 'bg-orange-600';
      default:
        return 'bg-zinc-600';
    }
  };

  // 프로젝트 상태별 라벨
  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.RECRUITING:
        return '팀원 모집 중';
      case ProjectStatus.INTERVIEWING:
        return '면담 진행 중';
      case ProjectStatus.ANALYZING:
        return 'AI 분석 중';
      case ProjectStatus.ACTIVE:
        return '프로젝트 진행 중';
      case ProjectStatus.COMPLETED:
        return '완료';
      case ProjectStatus.PAUSED:
        return '일시 정지';
      default:
        return '알 수 없음';
    }
  };

  // 프로젝트 카드 클릭 핸들러
  const handleProjectClick = (project: UserProject) => {
    if (project.status === ProjectStatus.ACTIVE) {
      router.push(`/projects/${project.id}/chat`);
    } else {
      router.push(`/projects/${project.id}`);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 h-screen flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <p className="text-white">프로젝트 목록 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 font-inter">
      {/* Background Paths */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* 헤더 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">내 프로젝트</h1>
              <p className="text-zinc-400">참여 중인 프로젝트들을 확인하고 관리하세요</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => fetchProjects()}
                variant="outline"
                size="sm"
                className="text-zinc-400"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </Button>
              <Button
                onClick={() => router.push('/projects/create')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                새 프로젝트
              </Button>
            </div>
          </motion.div>

          {/* 프로젝트 목록 */}
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-6 text-center">
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button onClick={() => fetchProjects()} variant="outline">
                    다시 시도
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-zinc-700/50 bg-zinc-800/30">
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">참여 중인 프로젝트가 없습니다</h3>
                  <p className="text-zinc-400 mb-6">새로운 프로젝트를 시작하거나 기존 프로젝트에 참여해보세요.</p>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      onClick={() => router.push('/projects/create')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      새 프로젝트 만들기
                    </Button>
                    <Button
                      onClick={() => router.push('/projects/join')}
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      프로젝트 참여하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-zinc-700/50 bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg mb-2 group-hover:text-blue-400 transition-colors">
                            {project.name}
                          </CardTitle>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusLabel(project.status)}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent 
                      className="space-y-4"
                      onClick={() => handleProjectClick(project)}
                    >
                      <p className="text-zinc-300 text-sm line-clamp-2">
                        {project.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Users className="h-4 w-4" />
                          <span>{project.currentMembers}/{project.teamSize}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {project.myRole && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            내 역할: {project.myRole}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.myInterviewStatus === InterviewStatus.COMPLETED ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              면담 완료
                            </Badge>
                          ) : project.myInterviewStatus === InterviewStatus.IN_PROGRESS ? (
                            <Badge className="bg-blue-600">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              면담 중
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              면담 대기
                            </Badge>
                          )}
                        </div>
                        
                        {project.status === ProjectStatus.ACTIVE && (
                          <Badge className="bg-purple-600">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            채팅 가능
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;