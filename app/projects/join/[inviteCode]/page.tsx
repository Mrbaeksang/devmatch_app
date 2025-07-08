'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

export default function JoinProjectPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.inviteCode as string;

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    // TODO: 초대 코드 유효성 검사 및 프로젝트 정보 가져오는 API 호출
    // 현재는 임시 로직
    const checkInviteCode = async () => {
      setLoading(true);
      try {
        // 실제 API 호출 대신 임시 데이터 사용
        if (inviteCode === 'validcode123') { // 예시 유효 코드
          setIsValid(true);
          setProjectName('데브매치 프로젝트');
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error('Error checking invite code:', error);
        setIsValid(false);
        toast.error('초대 코드 확인 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) {
      checkInviteCode();
    } else {
      setLoading(false);
      setIsValid(false);
    }
  }, [inviteCode]);

  const handleJoinProject = async () => {
    // TODO: 프로젝트 참여 API 호출
    toast.info('프로젝트 참여 로직 구현 예정');
    // router.push('/projects/' + projectId + '/interview'); // 참여 성공 시 리다이렉트
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2">초대 코드 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">프로젝트 초대</CardTitle>
          <CardDescription>
            {isValid ? (
              `'${projectName}' 프로젝트에 초대되셨습니다.`
            ) : (
              '유효하지 않거나 만료된 초대 코드입니다.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            초대 코드: <span className="font-mono font-bold text-primary">{inviteCode}</span>
          </p>
          {isValid && (
            <Button onClick={handleJoinProject} className="w-full">
              프로젝트 참여하기
            </Button>
          )}
          {!isValid && (
            <Button onClick={() => router.push('/projects')} className="w-full" variant="outline">
              프로젝트 목록으로 돌아가기
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}