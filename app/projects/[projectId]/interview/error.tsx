'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function InterviewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    console.error('Interview page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4 p-8 max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">
          면담 페이지 오류
        </h2>
        <p className="text-zinc-400">
          면담 페이지를 불러오는 중 문제가 발생했습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            다시 시도
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/projects'}
          >
            프로젝트 목록으로
          </Button>
        </div>
      </div>
    </div>
  );
}