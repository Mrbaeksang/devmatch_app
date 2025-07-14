// components/common/MemberCard.tsx
// 팀원 정보를 표시하는 공통 카드 컴포넌트

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "./MemberAvatar";
import { Crown, CheckCircle2, Calendar, Clock } from "lucide-react";
import { InterviewStatus } from "@/types/project";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    avatar?: string | null;
    role?: string;
    interviewStatus?: InterviewStatus;
    joinedAt?: Date | string;
  };
  isLeader?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  showStatus?: boolean;
  showRole?: boolean;
  customBadge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  children?: ReactNode;
  className?: string;
}

/**
 * 멤버 카드 공통 컴포넌트
 * 팀원 정보를 일관된 형태로 표시
 * 
 * @param member - 멤버 정보
 * @param isLeader - 팀 리더 여부
 * @param onClick - 클릭 핸들러
 * @param isSelected - 선택 상태
 * @param showStatus - 면담 상태 표시 여부
 * @param showRole - 역할 표시 여부
 * @param customBadge - 커스텀 배지
 * @param children - 추가 컨텐츠
 * @param className - 추가 클래스명
 */
export function MemberCard({
  member,
  isLeader = false,
  onClick,
  isSelected = false,
  showStatus = true,
  showRole = false,
  customBadge,
  children,
  className = ""
}: MemberCardProps) {
  const Component = onClick ? 'button' : 'div';
  const isCompleted = member.interviewStatus === InterviewStatus.COMPLETED;
  
  return (
    <Component
      onClick={onClick}
      className={`
        w-full p-3 rounded-lg transition-all
        ${onClick ? 'cursor-pointer' : ''}
        ${isSelected 
          ? 'bg-purple-500/30 border border-purple-500/50' 
          : 'bg-white/5 hover:bg-white/10'
        }
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        {/* 아바타 */}
        <MemberAvatar
          name={member.name}
          avatar={member.avatar}
          size="md"
        />
        
        {/* 멤버 정보 */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{member.name}</p>
            {isLeader && (
              <Crown className="h-4 w-4 text-yellow-400" />
            )}
          </div>
          
          {/* 역할 또는 커스텀 배지 */}
          {(showRole && member.role) || customBadge ? (
            <div className="mt-1">
              {customBadge ? (
                <Badge 
                  variant={customBadge.variant || 'secondary'}
                  className={customBadge.className || 'text-xs'}
                >
                  {customBadge.text}
                </Badge>
              ) : (
                member.role && (
                  <p className="text-purple-300 text-sm">{member.role}</p>
                )
              )}
            </div>
          ) : null}
          
          {/* 면담 상태 */}
          {showStatus && member.interviewStatus && (
            <div className="flex items-center mt-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${
                  isCompleted
                    ? 'bg-green-500/20 text-green-300 border-green-500/50'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    면담 완료
                  </>
                ) : member.interviewStatus === InterviewStatus.IN_PROGRESS ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    면담 진행 중
                  </>
                ) : (
                  <>
                    <Calendar className="h-3 w-3 mr-1" />
                    면담 대기
                  </>
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      {/* 추가 컨텐츠 */}
      {children && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </Component>
  );
}