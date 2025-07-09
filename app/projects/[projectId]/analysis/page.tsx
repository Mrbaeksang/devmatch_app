"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Users,
  CheckCircle2,
  AlertCircle,
  Star,
  Crown,
  TrendingUp,
  Target,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Award,
  Brain
} from "lucide-react";

import { 
  ProjectStatus, 
  InterviewStatus, 
  MemberProfile, 
  TeamAnalysis, 
  RoleAssignment, 
  LeadershipAnalysis 
} from "@/types/project";

// 팀원 정보 (확장됨)
interface TeamMemberExtended {
  id: string;
  name: string;
  consultationCompleted: boolean;
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
  goal: string;
  status: ProjectStatus;
  inviteCode: string;
  maxMembers: number;
  createdBy: string;
  blueprint?: unknown;
  teamAnalysis?: TeamAnalysis;
  members: TeamMemberExtended[];
  createdAt: Date;
}

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const projectId = params.projectId as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectExtended | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // 프로젝트 데이터 가져오기
  const fetchProject = useCallback(async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // 현재는 임시 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시 프로젝트 데이터 (분석 완료 상태)
      const mockProject: ProjectExtended = {
        id: projectId,
        name: 'DevMatch AI 플랫폼',
        goal: 'AI 기반 팀 빌딩 플랫폼 개발',
        status: ProjectStatus.ACTIVE,
        inviteCode: 'ABC123',
        maxMembers: 4,
        createdBy: 'user1',
        blueprint: {
          aiSuggestedRoles: [
            { roleName: '백엔드 개발자', count: 2, description: 'API 및 데이터베이스 설계' },
            { roleName: '프론트엔드 개발자', count: 1, description: 'React 기반 UI 개발' },
            { roleName: '팀장', count: 1, description: '프로젝트 리더십 및 관리' }
          ]
        },
        teamAnalysis: {
          overallScore: 85,
          strengths: ['다양한 기술 스택', '높은 협업 의지', '균형잡힌 경험 수준'],
          concerns: ['시간 조율 필요', '리더십 역할 경합'],
          recommendations: ['주간 정기 미팅 권장', '역할별 책임 명확화'],
          leadershipAnalysis: {
            recommendedLeader: 'user1',
            leadershipScores: [
              { userId: 'user1', score: 90, reasoning: '풍부한 프로젝트 경험과 리더십 스킬' },
              { userId: 'user2', score: 70, reasoning: '기술적 역량 우수, 리더십 관심 있음' },
              { userId: 'user3', score: 60, reasoning: '협업 능력 좋으나 리더 경험 부족' },
              { userId: 'user4', score: 55, reasoning: '개인 작업 선호, 리더십 관심 낮음' }
            ]
          }
        },
        members: [
          {
            id: '1',
            name: '김개발',
            consultationCompleted: true,
            interviewStatus: InterviewStatus.COMPLETED,
            memberProfile: {
              name: '김개발',
              skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
              experience: '백엔드 개발 3년',
              leadershipLevel: 'preferred',
              workStyle: '체계적이고 계획적인 접근',
              communication: '명확한 의사소통 선호',
              motivation: '새로운 기술 도입과 팀 성장',
              availability: '주중 저녁, 주말 가능',
              rolePreference: '백엔드 개발 및 팀장 역할',
              additionalInfo: '이전 스타트업에서 팀장 경험 있음',
              interviewCompletedAt: new Date().toISOString()
            },
            roleAssignment: {
              assignedRole: '팀장 & 백엔드 개발자',
              isLeader: true,
              reasoning: '리더십 경험과 기술 역량을 모두 갖춘 최적의 팀장 후보',
              responsibilities: ['프로젝트 일정 관리', '백엔드 아키텍처 설계', '팀원 코칭'],
              matchScore: 95
            },
            joinedAt: new Date(),
            userId: 'user1'
          },
          {
            id: '2',
            name: '박프론트',
            consultationCompleted: true,
            interviewStatus: InterviewStatus.COMPLETED,
            memberProfile: {
              name: '박프론트',
              skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
              experience: '프론트엔드 개발 2년',
              leadershipLevel: 'interested',
              workStyle: '사용자 중심의 UI/UX 접근',
              communication: '시각적 자료 활용한 소통',
              motivation: '사용자 경험 개선',
              availability: '주중 저녁, 주말 일부 가능',
              rolePreference: '프론트엔드 개발',
              additionalInfo: '디자인 툴 사용 가능',
              interviewCompletedAt: new Date().toISOString()
            },
            roleAssignment: {
              assignedRole: '프론트엔드 개발자',
              isLeader: false,
              reasoning: '프론트엔드 전문성과 디자인 감각을 갖춘 UI 담당자',
              responsibilities: ['React 컴포넌트 개발', 'UI/UX 구현', '반응형 디자인'],
              matchScore: 92
            },
            joinedAt: new Date(),
            userId: 'user2'
          },
          {
            id: '3',
            name: '이백엔드',
            consultationCompleted: true,
            interviewStatus: InterviewStatus.COMPLETED,
            memberProfile: {
              name: '이백엔드',
              skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
              experience: '백엔드 개발 1.5년',
              leadershipLevel: 'experienced',
              workStyle: '꼼꼼한 코드 리뷰와 테스트',
              communication: '문서화를 통한 체계적 소통',
              motivation: '안정적인 시스템 구축',
              availability: '주중 저녁, 주말 가능',
              rolePreference: '백엔드 개발',
              additionalInfo: '대학교 동아리 팀장 경험',
              interviewCompletedAt: new Date().toISOString()
            },
            roleAssignment: {
              assignedRole: '백엔드 개발자',
              isLeader: false,
              reasoning: '백엔드 전문성과 체계적 접근으로 안정적인 시스템 구축',
              responsibilities: ['데이터베이스 설계', 'API 개발', '시스템 최적화'],
              matchScore: 88
            },
            joinedAt: new Date(),
            userId: 'user3'
          },
          {
            id: '4',
            name: '최테스트',
            consultationCompleted: true,
            interviewStatus: InterviewStatus.COMPLETED,
            memberProfile: {
              name: '최테스트',
              skills: ['Jest', 'Cypress', 'Selenium', 'AWS'],
              experience: '테스트 엔지니어 2년',
              leadershipLevel: 'none',
              workStyle: '세밀한 테스트와 품질 관리',
              communication: '이슈 기반 소통',
              motivation: '높은 품질의 소프트웨어 제작',
              availability: '주중 저녁 가능',
              rolePreference: 'QA 및 테스트',
              additionalInfo: '자동화 테스트 전문',
              interviewCompletedAt: new Date().toISOString()
            },
            roleAssignment: {
              assignedRole: 'QA 엔지니어',
              isLeader: false,
              reasoning: '테스트 전문성으로 프로젝트 품질 보장',
              responsibilities: ['테스트 계획 수립', '자동화 테스트 구현', '품질 관리'],
              matchScore: 90
            },
            joinedAt: new Date(),
            userId: 'user4'
          }
        ],
        createdAt: new Date(),
      };

      setProject(mockProject);
      setAnalysisComplete(true);
      
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
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

  // 분석 시작
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('분석 시작 실패');
      }

      const result = await response.json();
      
      // 분석 완료 후 프로젝트 데이터 새로고침
      await fetchProject();
      setAnalysisComplete(true);
      toast.success('팀 분석이 완료되었습니다!');
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 프로젝트 시작
  const startProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('프로젝트 시작 실패');
      }

      toast.success('프로젝트가 시작되었습니다!');
      router.push(`/projects/${projectId}`);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '프로젝트 시작 중 오류가 발생했습니다.');
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    router.push(`/projects/join/${project?.inviteCode}`);
  };

  // 리더십 레벨 표시
  const getLeadershipBadge = (level: string) => {
    switch (level) {
      case 'preferred':
        return <Badge className="bg-yellow-600"><Crown className="w-3 h-3 mr-1" />리더 선호</Badge>;
      case 'experienced':
        return <Badge className="bg-blue-600"><Award className="w-3 h-3 mr-1" />리더 경험</Badge>;
      case 'interested':
        return <Badge className="bg-green-600"><Star className="w-3 h-3 mr-1" />리더 관심</Badge>;
      default:
        return <Badge variant="outline">팀원</Badge>;
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
            <p className="text-white">분석 결과 로딩 중...</p>
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
              <Button onClick={() => router.push('/projects')} className="w-full">
                프로젝트 목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                <Brain className="h-8 w-8 text-purple-500" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                  <p className="text-zinc-400">팀 구성 분석 결과</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-600">
                {analysisComplete ? '분석 완료' : '분석 대기'}
              </Badge>
            </div>
          </motion.div>

          {/* 분석 시작 카드 */}
          {!analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">팀 분석 시작</h3>
                  <p className="text-zinc-400 mb-4">
                    모든 팀원의 면담이 완료되었습니다. AI가 최적의 팀 구성을 분석하겠습니다.
                  </p>
                  <Button 
                    onClick={startAnalysis}
                    disabled={isAnalyzing}
                    className="w-full max-w-md"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        팀 분석 시작하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 분석 결과 */}
          {analysisComplete && project.teamAnalysis && (
            <div className="space-y-6">
              {/* 전체 점수 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="h-5 w-5" />
                      팀 매칭 점수
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-green-400">
                        {project.teamAnalysis.overallScore}
                      </div>
                      <div className="flex-1">
                        <Progress 
                          value={project.teamAnalysis.overallScore} 
                          className="h-3"
                        />
                        <p className="text-sm text-zinc-400 mt-1">
                          매우 우수한 팀 구성입니다!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 강점 & 우려사항 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-zinc-700/50 bg-zinc-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-400">
                        <CheckCircle2 className="h-5 w-5" />
                        팀 강점 & 우려사항
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-green-400 mb-2">강점</h4>
                        <ul className="space-y-1">
                          {project.teamAnalysis.strengths.map((strength, index) => (
                            <li key={index} className="text-sm text-zinc-300 flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-amber-400 mb-2">우려사항</h4>
                        <ul className="space-y-1">
                          {project.teamAnalysis.concerns.map((concern, index) => (
                            <li key={index} className="text-sm text-zinc-300 flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-amber-500" />
                              {concern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* 권장사항 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="border-zinc-700/50 bg-zinc-800/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-400">
                        <Target className="h-5 w-5" />
                        권장사항
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {project.teamAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-zinc-300 flex items-start gap-2">
                            <Star className="h-3 w-3 text-purple-500 mt-0.5" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* 리더십 분석 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <Crown className="h-5 w-5" />
                      리더십 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {project.teamAnalysis.leadershipAnalysis.leadershipScores.map((score, index) => {
                        const member = project.members.find(m => m.userId === score.userId);
                        const isRecommended = score.userId === project.teamAnalysis!.leadershipAnalysis.recommendedLeader;
                        
                        return (
                          <div key={index} className={`p-4 rounded-lg border ${
                            isRecommended ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-zinc-700/50 bg-zinc-800/30'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {member?.name?.[0] || '?'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-white font-medium">{member?.name || '알 수 없음'}</span>
                                  {isRecommended && (
                                    <Badge className="ml-2 bg-yellow-600">
                                      <Crown className="w-3 h-3 mr-1" />
                                      추천 리더
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-yellow-400">{score.score}</div>
                                <div className="text-xs text-zinc-400">점수</div>
                              </div>
                            </div>
                            <p className="text-sm text-zinc-300">{score.reasoning}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 팀원 역할 배정 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-zinc-700/50 bg-zinc-800/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                      <Users className="h-5 w-5" />
                      팀원 역할 배정
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.members.map((member, index) => (
                        <div key={index} className="p-4 bg-zinc-800/50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">{member.name[0]}</span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{member.name}</div>
                                <div className="text-sm text-zinc-400">
                                  {member.roleAssignment?.assignedRole || '역할 미정'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-400">
                                {member.roleAssignment?.matchScore || 0}
                              </div>
                              <div className="text-xs text-zinc-400">적합도</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getLeadershipBadge(member.memberProfile?.leadershipLevel || 'none')}
                              {member.roleAssignment?.isLeader && (
                                <Badge className="bg-yellow-600">
                                  <Crown className="w-3 h-3 mr-1" />
                                  팀장
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {member.memberProfile?.skills?.slice(0, 3).map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            
                            <p className="text-sm text-zinc-300">
                              {member.roleAssignment?.reasoning || '역할 분석 중...'}
                            </p>
                            
                            {member.roleAssignment?.responsibilities && (
                              <div>
                                <h5 className="text-xs font-medium text-zinc-400 mb-1">주요 책임</h5>
                                <ul className="text-xs text-zinc-300 space-y-1">
                                  {member.roleAssignment.responsibilities.slice(0, 2).map((resp, respIndex) => (
                                    <li key={respIndex} className="flex items-center gap-1">
                                      <UserCheck className="h-2 w-2 text-green-500" />
                                      {resp}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 프로젝트 시작 버튼 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">팀 구성 완료!</h3>
                    <p className="text-zinc-400 mb-4">
                      최적의 팀 구성이 완료되었습니다. 이제 프로젝트를 시작할 수 있습니다.
                    </p>
                    <Button 
                      onClick={startProject}
                      className="w-full max-w-md"
                      size="lg"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      프로젝트 시작하기
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}