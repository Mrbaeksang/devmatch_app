"use client";

import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { motion } from "framer-motion";
import { Users, CheckCircle, Star } from "lucide-react";

const MyProjectsPage = () => {
  // 임시 프로젝트 데이터
  const myProjects = [
    {
      name: "팀 시너지 게시판",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
      ),
      Icon: Users,
      description: "Spring Boot + React 게시판 프로젝트",
      href: "/projects/1",
      cta: "프로젝트 보기",
      status: "진행중",
      members: 3,
      progress: 65
    },
    {
      name: "AI 면접 도우미",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20" />
      ),
      Icon: CheckCircle,
      description: "AI 모의 면접 웹 서비스 개발",
      href: "/projects/2",
      cta: "프로젝트 보기",
      status: "완료",
      members: 2,
      progress: 100
    },
    {
      name: "DevMatch 플랫폼",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
      ),
      Icon: Star,
      description: "AI 기반 팀 빌딩 플랫폼",
      href: "/projects/3",
      cta: "프로젝트 보기",
      status: "모집중",
      members: 1,
      progress: 25
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 font-inter">
      {/* Background Paths */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 container mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            내 프로젝트들
          </h1>
          <p className="text-zinc-400 text-lg">
            참여 중인 프로젝트들을 확인하고 관리해보세요
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <BentoGrid className="max-w-6xl mx-auto">
            {myProjects.map((project, index) => (
              <motion.div
                key={project.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <BentoCard {...project} />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </div>
  );
};

export default MyProjectsPage;