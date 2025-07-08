"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProjectCard from "@/app/components/project/ProjectCard";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { motion } from "framer-motion";
import { Plus, Users, Target, Bot, Rocket } from "lucide-react";

const ProjectsPage = () => {
  // isModalOpen 상태는 더 이상 필요하지 않으므로 제거

  // 임시 프로젝트 데이터 (나중에 API에서 받아올 예정)
  const projects = [
    { id: '1', name: '팀 시너지 게시판', goal: 'Spring Boot와 JPA, React를 사용하여 기본적인 CRUD 기능과 로그인 기능이 있는 게시판 웹사이트를 4주 안에 완성한다.', memberCount: 3 },
    { id: '2', name: 'AI 면접 도우미', goal: 'AI를 활용하여 모의 면접을 진행하고 피드백을 제공하는 웹 서비스 개발', memberCount: 2 },
  ];

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeInOut",
      },
    }),
  };

  // Bento Grid 아이템들
  const bentoItems = [
    {
      name: "새 프로젝트 만들기",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
      ),
      Icon: Plus,
      description: "AI 상담을 통해 최적의 팀을 구성해보세요",
      href: "/projects/new",
      cta: "시작하기",
    },
    {
      name: "팀 매칭 AI",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20" />
      ),
      Icon: Bot,
      description: "프로젝트에 맞는 최적의 역할분배를 제안합니다",
      href: "/projects/join/validcode123",
      cta: "팀원 기다리기",
    },
    {
      name: "내 프로젝트들",
      className: "col-span-1 row-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20" />
      ),
      Icon: Target,
      description: "역할 분담이 완료된 프로젝트들을 확인하세요",
      href: "/projects/my-projects",
      cta: "이동하기",
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 font-inter">
      {/* Background Paths */}
      <div className="absolute inset-0">
        <BackgroundPaths title="" />
      </div>

      <div className="relative z-10 container mx-auto p-8">

        {/* Bento Grid Section - 중앙에 크게 배치 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center"
        >
          <BentoGrid className="max-w-6xl mx-auto">
            {bentoItems.map((item, index) => (
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
      </div>
    </div>
  );
};

export default ProjectsPage;