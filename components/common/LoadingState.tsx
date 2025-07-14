// components/common/LoadingState.tsx
// 로딩 상태를 표시하는 공통 컴포넌트

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundPaths } from "@/components/ui/background-paths";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  showBackground?: boolean;
  variant?: 'default' | 'inline' | 'fullscreen';
}

/**
 * 로딩 상태 공통 컴포넌트
 * 여러 페이지에서 반복적으로 사용되는 로딩 UI를 통합
 * 
 * @param message - 메인 로딩 메시지 (기본값: "로딩 중...")
 * @param subMessage - 서브 메시지
 * @param showBackground - 배경 표시 여부 (기본값: true)
 * @param variant - 로딩 스타일 변형
 */
export function LoadingState({
  message = "로딩 중...",
  subMessage,
  showBackground = true,
  variant = 'fullscreen'
}: LoadingStateProps) {
  // 인라인 변형 (작은 컴포넌트 내부용)
  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2 text-purple-300 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    );
  }

  // 기본 변형 (카드 형태)
  if (variant === 'default') {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="flex items-center space-x-4 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
          <div>
            <p className="text-xl text-white">{message}</p>
            {subMessage && (
              <p className="text-sm text-purple-200 mt-1">{subMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 화면 변형 (페이지 로딩용)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      {showBackground && <BackgroundPaths />}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="flex items-center space-x-4 p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
          <div>
            <p className="text-xl text-white">{message}</p>
            {subMessage && (
              <p className="text-sm text-purple-200 mt-1">{subMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}