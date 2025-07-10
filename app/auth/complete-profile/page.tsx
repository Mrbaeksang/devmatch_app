"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { AvatarSelector } from "@/components/ui/avatar-selector";
import { 
  Sparkles, 
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { 
  generateDefaultAvatar, 
  serializeAvatarConfig,
  type AvatarConfig 
} from "@/lib/avatar";

interface FormData {
  nickname: string;
  avatar: AvatarConfig;
  bio: string;
}

interface FormErrors {
  nickname?: string;
  avatar?: string;
  bio?: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [formData, setFormData] = useState<FormData>({
    nickname: "",
    avatar: generateDefaultAvatar("", "avataaars"),
    bio: ""
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 세션 체크
  useEffect(() => {
    if (status === "loading") return; // 로딩 중이면 대기
    
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    
    // 이미 프로필이 완성된 사용자는 프로젝트 페이지로
    if (status === "authenticated" && session?.user?.isCompleted) {
      console.log("프로필 이미 완성 - 프로젝트 페이지로 이동");
      router.push("/projects");
      return;
    }
  }, [status, session?.user?.isCompleted, router]);

  // 닉네임 검증
  const validateNickname = (nickname: string): string | null => {
    if (!nickname.trim()) {
      return "닉네임을 입력해주세요.";
    }
    if (nickname.length < 2 || nickname.length > 15) {
      return "닉네임은 2-15자 사이여야 합니다.";
    }
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(nickname)) {
      return "닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다.";
    }
    return null;
  };

  // 닉네임 중복 체크
  const checkNicknameAvailability = async (nickname: string) => {
    if (!nickname || validateNickname(nickname)) {
      setNicknameAvailable(null);
      return;
    }

    setIsCheckingNickname(true);
    try {
      const response = await fetch('/api/auth/check-nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      
      const data = await response.json();
      setNicknameAvailable(data.available);
    } catch {
      toast.error('닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 닉네임 변경 핸들러 (메모이제이션)
  const handleNicknameChange = useCallback((value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      nickname: value,
      // 닉네임이 변경되면 아바타 seed도 업데이트
      avatar: generateDefaultAvatar(value, prev.avatar.style)
    }));
    setNicknameAvailable(null);
    
    // 입력 검증
    const error = validateNickname(value);
    setErrors(prev => ({ ...prev, nickname: error || undefined }));
    
    // 디바운스로 중복 체크
    if (!error) {
      setTimeout(() => checkNicknameAvailability(value), 500);
    }
  }, []);

  // 아바타 변경 핸들러 (메모이제이션)
  const handleAvatarChange = useCallback((avatarConfig: AvatarConfig) => {
    setFormData(prev => ({ ...prev, avatar: avatarConfig }));
  }, []);

  // 자기소개 검증
  const validateBio = (bio: string): string | null => {
    if (bio.length > 100) {
      return "자기소개는 100자 이하로 입력해주세요.";
    }
    return null;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 최종 검증
    const nicknameError = validateNickname(formData.nickname);
    const bioError = validateBio(formData.bio);
    
    if (nicknameError || bioError || nicknameAvailable === false) {
      setErrors({
        nickname: nicknameError || (nicknameAvailable === false ? "이미 사용 중인 닉네임입니다." : undefined),
        bio: bioError || undefined
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatar: serializeAvatarConfig(formData.avatar)
        })
      });

      if (response.ok) {
        toast.success('프로필이 완성되었습니다!');
        
        // 세션 업데이트 및 리다이렉션
        await fetch('/api/auth/session?update=true');
        window.location.href = '/projects';
      } else {
        const error = await response.json();
        toast.error(error.message || '프로필 저장 중 오류가 발생했습니다.');
      }
    } catch {
      toast.error('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-zinc-950">
      {/* Background */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-lg p-8"
        >
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-white">
                프로필 완성
              </h1>
            </div>
            <p className="text-zinc-400 text-sm">
              DevMatch에서 사용할 프로필을 설정해주세요
            </p>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 아바타 선택 */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                아바타 선택
              </label>
              <AvatarSelector
                value={formData.avatar}
                onChange={handleAvatarChange}
                seed={formData.nickname || "default"}
              />
            </div>

            {/* 닉네임 입력 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                닉네임 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="2-15자의 닉네임을 입력하세요"
                  className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nickname ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {/* 닉네임 상태 표시 */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isCheckingNickname && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  )}
                  {!isCheckingNickname && nicknameAvailable === true && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {!isCheckingNickname && nicknameAvailable === false && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {errors.nickname && (
                <p className="text-red-500 text-sm mt-1">{errors.nickname}</p>
              )}
              {!errors.nickname && nicknameAvailable === true && (
                <p className="text-green-500 text-sm mt-1">사용 가능한 닉네임입니다.</p>
              )}
              {!errors.nickname && nicknameAvailable === false && (
                <p className="text-red-500 text-sm mt-1">이미 사용 중인 닉네임입니다.</p>
              )}
            </div>

            {/* 자기소개 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                자기소개 (선택)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => {
                  setFormData({ ...formData, bio: e.target.value });
                  const error = validateBio(e.target.value);
                  setErrors({ ...errors, bio: error || undefined });
                }}
                placeholder="간단한 자기소개를 적어주세요 (최대 100자)"
                rows={3}
                className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.bio ? 'border-red-500' : 'border-zinc-700'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-red-500 text-sm">{errors.bio}</p>
                )}
                <p className="text-zinc-500 text-sm ml-auto">
                  {formData.bio.length}/100
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={isSubmitting || !!errors.nickname || !!errors.bio || nicknameAvailable !== true}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  저장 중...
                </>
              ) : (
                '프로필 완성하기'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}