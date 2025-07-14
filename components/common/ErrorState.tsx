// components/common/ErrorState.tsx
// 에러 상태를 표시하는 공통 컴포넌트

import { AlertCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackgroundPaths } from "@/components/ui/background-paths";

interface ErrorStateProps {
  error?: string | null;
  title?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showBackground?: boolean;
  variant?: 'default' | 'inline' | 'fullscreen';
}

/**
 * 에러 상태 공통 컴포넌트
 * 여러 페이지에서 반복적으로 사용되는 에러 UI를 통합
 * 
 * @param error - 에러 메시지
 * @param title - 에러 제목 (기본값: "오류 발생")
 * @param onRetry - 재시도 핸들러
 * @param onGoBack - 뒤로가기 핸들러
 * @param showBackground - 배경 표시 여부 (기본값: true)
 * @param variant - 에러 표시 스타일 변형
 */
export function ErrorState({
  error,
  title = "오류 발생",
  onRetry,
  onGoBack,
  showBackground = true,
  variant = 'fullscreen'
}: ErrorStateProps) {
  const errorMessage = error || '알 수 없는 오류가 발생했습니다.';

  // 인라인 변형 (작은 컴포넌트 내부용)
  if (variant === 'inline') {
    return (
      <div className="flex items-center space-x-2 text-red-400 p-4">
        <XCircle className="h-4 w-4" />
        <span className="text-sm">{errorMessage}</span>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="ghost">
            재시도
          </Button>
        )}
      </div>
    );
  }

  // 기본 변형 (카드 형태)
  if (variant === 'default') {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">{title}</h3>
          <p className="text-red-300 mb-4">{errorMessage}</p>
          <div className="flex justify-center gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="secondary" size="sm">
                재시도
              </Button>
            )}
            {onGoBack && (
              <Button onClick={onGoBack} variant="secondary" size="sm">
                돌아가기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 전체 화면 변형 (페이지 에러용)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      {showBackground && <BackgroundPaths />}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-xl text-red-300 mb-6">{errorMessage}</p>
          <div className="flex justify-center gap-3">
            {onRetry && (
              <Button onClick={onRetry} variant="secondary">
                재시도
              </Button>
            )}
            {onGoBack && (
              <Button onClick={onGoBack} variant="secondary">
                돌아가기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}