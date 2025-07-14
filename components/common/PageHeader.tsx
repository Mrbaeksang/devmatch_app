// components/common/PageHeader.tsx
// 페이지 헤더를 표시하는 공통 컴포넌트

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  badge?: {
    text: string;
    icon?: ReactNode;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
    className?: string;
  };
  className?: string;
}

/**
 * 페이지 헤더 공통 컴포넌트
 * 여러 페이지에서 반복적으로 사용되는 헤더 UI를 통합
 * 
 * @param title - 페이지 제목
 * @param subtitle - 페이지 부제목
 * @param onBack - 뒤로가기 핸들러
 * @param badge - 상태 배지 정보
 * @param action - 액션 버튼 정보
 * @param className - 추가 클래스명
 */
export function PageHeader({
  title,
  subtitle,
  onBack,
  badge,
  action,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`bg-white/10 backdrop-blur-md border-b border-white/20 p-4 ${className}`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* 왼쪽: 뒤로가기 버튼과 제목 */}
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-purple-200 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* 오른쪽: 배지 또는 액션 버튼 */}
        <div className="flex items-center gap-3">
          {badge && (
            <Badge 
              variant={badge.variant}
              className={badge.className || "bg-purple-500/20 text-purple-300 border-purple-500/50"}
            >
              {badge.icon && <span className="mr-1">{badge.icon}</span>}
              {badge.text}
            </Badge>
          )}
          
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={action.className || "bg-purple-500 hover:bg-purple-600"}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}