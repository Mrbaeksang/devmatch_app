// components/common/ProjectCard.tsx
// 프로젝트 카드 공통 컴포넌트

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MemberAvatar } from "./MemberAvatar";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  Target,
  Play
} from "lucide-react";
import { ProjectStatus, InterviewStatus } from "@/types/project";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    teamSize: number;
    currentMembers: number;
    joinedAt?: Date;
    myRole?: string;
    myInterviewStatus?: InterviewStatus;
    inviteCode?: string;
    members?: Array<{
      id: string;
      name: string;
      avatar?: string;
      interviewStatus?: InterviewStatus;
      role?: string;
    }>;
    createdAt: Date;
  };
  onClick?: () => void;
  variant?: 'default' | 'compact';
  showMembers?: boolean;
  showActions?: boolean;
  index?: number;
}

/**
 * 프로젝트 카드 공통 컴포넌트
 * 프로젝트 목록에서 개별 프로젝트를 표시
 * 
 * @param project - 프로젝트 정보
 * @param onClick - 클릭 핸들러
 * @param variant - 카드 변형 (기본값: 'default')
 * @param showMembers - 멤버 목록 표시 여부 (기본값: true)
 * @param showActions - 액션 버튼 표시 여부 (기본값: true)
 * @param index - 애니메이션용 인덱스
 */
export function ProjectCard({
  project,
  onClick,
  variant = 'default',
  showMembers = true,
  showActions = true,
  index = 0
}: ProjectCardProps) {
  // 상태별 스타일 정의
  const statusConfig = {
    [ProjectStatus.RECRUITING]: {
      badge: { text: '팀원 모집 중', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
      icon: <Users className="h-3 w-3" />,
      actionText: '대기실 입장',
      actionIcon: <ArrowRight className="h-4 w-4" />
    },
    [ProjectStatus.INTERVIEWING]: {
      badge: { text: '면담 진행 중', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
      icon: <Clock className="h-3 w-3" />,
      actionText: project.myInterviewStatus === InterviewStatus.COMPLETED ? '면담 완료' : '면담 시작',
      actionIcon: project.myInterviewStatus === InterviewStatus.COMPLETED ? <CheckCircle2 className="h-4 w-4" /> : <Play className="h-4 w-4" />
    },
    [ProjectStatus.ANALYZING]: {
      badge: { text: 'AI 분석 중', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      actionText: '분석 진행 중',
      actionIcon: <Loader2 className="h-4 w-4 animate-spin" />
    },
    [ProjectStatus.ACTIVE]: {
      badge: { text: '프로젝트 진행 중', className: 'bg-green-500/20 text-green-300 border-green-500/50' },
      icon: <MessageSquare className="h-3 w-3" />,
      actionText: '팀 채팅',
      actionIcon: <MessageSquare className="h-4 w-4" />
    },
    [ProjectStatus.COMPLETED]: {
      badge: { text: '완료됨', className: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
      icon: <CheckCircle2 className="h-3 w-3" />,
      actionText: '프로젝트 보기',
      actionIcon: <ArrowRight className="h-4 w-4" />
    },
    [ProjectStatus.CANCELLED]: {
      badge: { text: '취소됨', className: 'bg-red-500/20 text-red-300 border-red-500/50' },
      icon: <AlertCircle className="h-3 w-3" />,
      actionText: '상세 보기',
      actionIcon: <ArrowRight className="h-4 w-4" />
    },
    [ProjectStatus.PAUSED]: {
      badge: { text: '일시 정지', className: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
      icon: <AlertCircle className="h-3 w-3" />,
      actionText: '상세 보기',
      actionIcon: <ArrowRight className="h-4 w-4" />
    }
  };

  const config = statusConfig[project.status] || statusConfig[ProjectStatus.RECRUITING];
  const isActionDisabled = project.status === ProjectStatus.ANALYZING || 
    (project.status === ProjectStatus.INTERVIEWING && project.myInterviewStatus === InterviewStatus.COMPLETED);

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card 
          className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer"
          onClick={onClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-white text-lg">{project.name}</CardTitle>
              <Badge variant="secondary" className={config.badge.className}>
                {config.icon}
                <span className="ml-1">{config.badge.text}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-purple-200 text-sm line-clamp-2 mb-3">{project.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-purple-300 text-sm">
                <Users className="h-4 w-4 mr-1" />
                {project.currentMembers}/{project.teamSize}
              </div>
              {showActions && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-purple-300 hover:text-white"
                  disabled={isActionDisabled}
                >
                  {config.actionText}
                  {config.actionIcon}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card 
        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer h-full"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-400" />
              <CardTitle className="text-white text-xl">{project.name}</CardTitle>
            </div>
            <Badge variant="secondary" className={config.badge.className}>
              {config.icon}
              <span className="ml-1">{config.badge.text}</span>
            </Badge>
          </div>
          <p className="text-purple-200 text-sm line-clamp-2">{project.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 프로젝트 정보 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-purple-300">
              <Users className="h-4 w-4 mr-2" />
              <span>팀원: {project.currentMembers}/{project.teamSize}</span>
            </div>
            <div className="flex items-center text-purple-300">
              <Calendar className="h-4 w-4 mr-2" />
              <span>생성: {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* 멤버 목록 */}
          {showMembers && project.members && project.members.length > 0 && (
            <div className="space-y-2">
              <p className="text-purple-300 text-sm font-medium">참여 멤버</p>
              <div className="flex flex-wrap gap-2">
                {project.members.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center">
                    <MemberAvatar
                      name={member.name}
                      avatar={member.avatar}
                      size="sm"
                    />
                  </div>
                ))}
                {project.members.length > 5 && (
                  <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-xs text-purple-200">
                    +{project.members.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 내 상태 */}
          {project.myRole && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-purple-300 text-sm">내 역할: {project.myRole}</span>
              {project.myInterviewStatus && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    project.myInterviewStatus === InterviewStatus.COMPLETED
                      ? 'bg-green-500/20 text-green-300 border-green-500/50'
                      : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                  }`}
                >
                  {project.myInterviewStatus === InterviewStatus.COMPLETED ? '면담 완료' : '면담 대기'}
                </Badge>
              )}
            </div>
          )}
          
          {/* 액션 버튼 */}
          {showActions && (
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              disabled={isActionDisabled}
            >
              {config.actionText}
              {config.actionIcon}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}