"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, Target, RefreshCw } from "lucide-react";
import { LoadingState, ErrorState, ProjectCard } from "@/components/common";
import { useProjects } from "@/lib/hooks/useProjects";

/**
 * 프로젝트 목록 페이지
 * 사용자가 참여중인 모든 프로젝트를 표시하고 관리
 * 모듈화: useProjects Hook과 ProjectCard 컴포넌트 사용
 */
const ProjectsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Custom Hook 사용 - 모든 프로젝트 관리 로직이 여기에!
  const {
    myProjects,
    loading,
    error,
    pollingEnabled,
    fetchMyProjects,
    setPollingEnabled,
    goToProject,
    createNewProject,
    activeProjectsCount,
    completedProjectsCount
  } = useProjects(true, 5000);

  // 인증 체크
  if (status === "loading") {
    return <LoadingState message="로그인 정보를 확인하는 중..." />;
  }

  if (!session) {
    router.push('/');
    return null;
  }

  // 로딩 상태
  if (loading) {
    return <LoadingState message="프로젝트를 불러오는 중..." />;
  }

  // 에러 상태
  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={fetchMyProjects}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <BackgroundPaths />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">내 프로젝트</h1>
              <p className="text-purple-200">
                {session.user?.name}님이 참여중인 프로젝트 목록입니다
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* 실시간 업데이트 토글 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPollingEnabled(!pollingEnabled)}
                className={`border-white/20 ${
                  pollingEnabled 
                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${pollingEnabled ? 'animate-spin' : ''}`} />
                {pollingEnabled ? '실시간 업데이트 ON' : '실시간 업데이트 OFF'}
              </Button>
              
              {/* 새 프로젝트 버튼 */}
              <Button 
                onClick={createNewProject}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                새 프로젝트 시작
              </Button>
            </div>
          </div>
          
          {/* 통계 */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center text-purple-300">
              <Target className="h-4 w-4 mr-1" />
              <span>진행중: {activeProjectsCount}개</span>
            </div>
            <div className="flex items-center text-green-300">
              <Target className="h-4 w-4 mr-1" />
              <span>완료: {completedProjectsCount}개</span>
            </div>
          </div>
        </motion.div>

        {/* 프로젝트 목록 */}
        {myProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-12 max-w-md mx-auto">
              <Target className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                아직 참여중인 프로젝트가 없습니다
              </h3>
              <p className="text-purple-200 mb-6">
                새로운 프로젝트를 시작하거나 초대 코드로 참여해보세요!
              </p>
              <Button 
                onClick={createNewProject}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                첫 프로젝트 시작하기
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => goToProject(project)}
                index={index}
                showMembers={true}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;