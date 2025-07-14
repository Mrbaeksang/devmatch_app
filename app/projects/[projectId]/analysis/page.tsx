"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  CheckCircle2,
  Star,
  Crown,
  TrendingUp,
  Sparkles,
  UserCheck,
  Brain,
  MessageSquare,
  Users
} from "lucide-react";

import { useAnalysis } from "@/lib/hooks/useAnalysis";
import { LoadingState, ErrorState, PageHeader, MemberCard, MemberAvatar } from "@/components/common";

export default function AnalysisPage() {
  const params = useParams();
  useSession();
  
  const projectId = params.projectId as string;

  // Custom Hook 사용 - 모든 분석 로직이 여기에!
  const {
    project,
    loading,
    error,
    selectedMember,
    setSelectedMember,
    startChatting,
    goBack,
    isAnalyzing,
    isAnalysisComplete,
    canStartChatting,
    analysisProgress,
    totalScore,
    recommendedLeader,
    roleDistribution,
  } = useAnalysis(projectId);

  // 로딩 상태
  if (loading) {
    return <LoadingState message="분석 결과를 불러오는 중..." />;
  }

  // 에러 상태
  if (error || !project) {
    return (
      <ErrorState 
        error={error || '프로젝트를 찾을 수 없습니다.'}
        onGoBack={goBack}
      />
    );
  }

  // 분석 중 상태
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <BackgroundPaths />
        <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Brain className="h-16 w-16 text-purple-400 animate-pulse" />
                <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI가 팀을 분석하고 있습니다</h2>
              <p className="text-purple-200 text-center">
                팀원들의 역량과 성향을 종합적으로 분석하여<br />
                최적의 팀 구성을 제안해드릴게요.
              </p>
              <Progress value={analysisProgress} className="w-full" />
              <div className="flex items-center space-x-2 text-purple-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>잠시만 기다려주세요...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 분석 완료 상태 - 메인 UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <BackgroundPaths />
      
      {/* 헤더 */}
      <PageHeader
        title={project.name}
        subtitle="AI 팀 분석 결과"
        onBack={goBack}
        action={canStartChatting ? {
          label: "팀 채팅 시작하기",
          icon: <MessageSquare className="h-4 w-4" />,
          onClick: startChatting,
          className: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        } : undefined}
      />

      {/* 메인 컨텐츠 */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 전체 점수 및 요약 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 전체 팀 점수 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    팀 종합 점수
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="relative">
                      <div className="text-6xl font-bold text-white">
                        {totalScore}
                      </div>
                      <div className="text-purple-300 text-center mt-2">/ 100</div>
                      <div className="absolute -top-4 -right-4">
                        {totalScore >= 80 && <Star className="h-8 w-8 text-yellow-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">기술 역량</span>
                      <span className="text-white">{project.teamAnalysis?.skillCoverage || 0}%</span>
                    </div>
                    <Progress value={project.teamAnalysis?.skillCoverage || 0} className="h-2" />
                    
                    <div className="flex justify-between text-sm mt-4">
                      <span className="text-purple-200">팀워크 적합도</span>
                      <span className="text-white">{project.teamAnalysis?.teamworkScore || 0}%</span>
                    </div>
                    <Progress value={project.teamAnalysis?.teamworkScore || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 리더십 분석 */}
            {recommendedLeader && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Crown className="h-5 w-5 mr-2 text-yellow-400" />
                      추천 팀 리더
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <MemberAvatar
                        name={recommendedLeader.name}
                        avatar={recommendedLeader.user?.avatar}
                        size="xl"
                        className="bg-gradient-to-br from-yellow-400 to-orange-400"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{recommendedLeader.name}</h3>
                        <p className="text-purple-200">
                          리더십 점수: {recommendedLeader.memberProfile?.leadershipScore || 0}점
                        </p>
                      </div>
                    </div>
                    <p className="text-purple-200 mt-4">
                      {project.teamAnalysis?.leadershipAnalysis?.reason || 
                       '팀원들과의 소통 능력과 기술적 역량을 고려하여 선정되었습니다.'}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* 역할 분배 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    역할 분배
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(roleDistribution).map(([role, members]) => (
                      <div key={role} className="bg-white/5 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2">{role}</h4>
                        <div className="flex flex-wrap gap-2">
                          {members.map(member => (
                            <Badge 
                              key={member.id}
                              variant="secondary"
                              className="bg-purple-500/20 text-purple-300 border-purple-500/50"
                            >
                              {member.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI 분석 요약 */}
            {project.teamAnalysis?.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      AI 종합 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-purple-200 whitespace-pre-wrap">
                      {project.teamAnalysis.summary}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* 오른쪽: 팀원 목록 */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <UserCheck className="h-5 w-5 mr-2" />
                    팀원 상세
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={{
                        id: member.id,
                        name: member.name,
                        avatar: member.user?.avatar,
                        role: (typeof project.teamAnalysis?.roleAssignments === 'object' && !Array.isArray(project.teamAnalysis?.roleAssignments) 
                          ? project.teamAnalysis?.roleAssignments?.[member.id] 
                          : project.teamAnalysis?.roleAssignments?.find((r: any) => r.userId === member.userId)?.assignedRole) || '역할 미정'
                      }}
                      isLeader={member.id === recommendedLeader?.id}
                      onClick={() => setSelectedMember(member)}
                      isSelected={selectedMember?.id === member.id}
                      showRole={true}
                      showStatus={false}
                    />
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* 선택된 멤버 상세 정보 */}
            {selectedMember && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <Card className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">
                      {selectedMember.name}의 프로필
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 기술 점수 */}
                    {selectedMember.memberProfile?.skillScores && (
                      <div>
                        <h4 className="text-purple-300 text-sm mb-2">기술 역량</h4>
                        {Object.entries(selectedMember.memberProfile.skillScores).map(([skill, score]) => (
                          <div key={skill} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-purple-200">{skill}</span>
                              <span className="text-white">{score}/100</span>
                            </div>
                            <Progress value={score} className="h-1" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 업무 스타일 */}
                    {selectedMember.memberProfile?.workStyles && (
                      <div>
                        <h4 className="text-purple-300 text-sm mb-2">업무 스타일</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMember.memberProfile.workStyles.map((style, index) => (
                            <Badge 
                              key={index}
                              variant="secondary"
                              className="bg-blue-500/20 text-blue-300 border-blue-500/50"
                            >
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 강점 */}
                    {selectedMember.memberProfile?.strengths && (
                      <div>
                        <h4 className="text-purple-300 text-sm mb-2">강점</h4>
                        <ul className="text-purple-200 text-sm space-y-1">
                          {selectedMember.memberProfile.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle2 className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}