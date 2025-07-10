"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthRedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // 세션 로딩 중이면 대기

    if (status === "unauthenticated") {
      // 인증되지 않은 경우 홈으로
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user) {
      // 프로필 완성 여부 체크
      if (session.user.isCompleted) {
        // 프로필이 완성된 경우 프로젝트 페이지로
        router.push("/projects");
      } else {
        // 프로필이 미완성인 경우 프로필 완성 페이지로
        router.push("/auth/complete-profile");
      }
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p className="text-white">로그인 처리 중...</p>
      </div>
    </div>
  );
}