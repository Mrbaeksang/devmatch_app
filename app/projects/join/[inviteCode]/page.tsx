'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Users, Clock, CheckCircle } from 'lucide-react';

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
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 font-inter">
        <div className="absolute inset-0">
          <BackgroundPaths title="" />
        </div>
        <div className="relative z-10 flex items-center">
          <LoadingSpinner />
          <p className="ml-2 text-white">초대 코드 확인 중...</p>
        </div>
      </div>
    );
  }

  const waitingCards = [
    {
      name: "팀원 모집 중",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
      ),
      Icon: Users,
      description: "현재 프로젝트에 참여할 팀원을 모집하고 있습니다",
      href: "#",
      cta: "대기 중",
    },
    {
      name: "프로젝트 정보",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20" />
      ),
      Icon: CheckCircle,
      description: projectName || "프로젝트 정보를 확인하세요",
      href: "#",
      cta: "확인하기",
    },
    {
      name: "대기 시간",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
      ),
      Icon: Clock,
      description: "평균 대기 시간은 5-10분입니다",
      href: "#",
      cta: "알림 받기",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 font-inter">
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 container mx-auto p-8">
        {isValid ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <BentoGrid className="max-w-6xl mx-auto">
              {waitingCards.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <BentoCard {...item} />
                </motion.div>
              ))}
            </BentoGrid>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-2xl text-white">프로젝트 초대</CardTitle>
                <CardDescription className="text-zinc-400">
                  유효하지 않거나 만료된 초대 코드입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-zinc-400">
                  초대 코드: <span className="font-mono font-bold text-red-400">{inviteCode}</span>
                </p>
                <Button onClick={() => router.push('/projects')} className="w-full" variant="outline">
                  프로젝트 목록으로 돌아가기
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}