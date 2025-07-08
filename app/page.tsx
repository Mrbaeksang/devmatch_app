"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/projects");
    }
  }, [status, router]);

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <HeroGeometric 
      badge="AI 기반 팀 빌딩 플랫폼"
      title1="AI가 추천하는"
      title2="최적의 팀 빌딩"
      showAuthButtons={true}
    />
  );
}