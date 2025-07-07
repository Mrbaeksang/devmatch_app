"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import 경로 수정 및 방식 변경
import ProjectCard from "@/app/components/project/ProjectCard"; // default import 유지
import { ProjectForm } from "@/app/components/project/ProjectForm"; // named import로 변경

const ProjectsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 임시 프로젝트 데이터 (나중에 API에서 받아올 예정)
  const projects = [
    { id: '1', name: '팀 시너지 게시판', goal: 'Spring Boot와 JPA, React를 사용하여 기본적인 CRUD 기능과 로그인 기능이 있는 게시판 웹사이트를 4주 안에 완성한다.', memberCount: 3 },
    { id: '2', name: 'AI 면접 도우미', goal: 'AI를 활용하여 모의 면접을 진행하고 피드백을 제공하는 웹 서비스 개발', memberCount: 2 },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">내 프로젝트</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            name={project.name}
            goal={project.goal}
            memberCount={project.memberCount}
          />
        ))}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-auto min-h-[150px] flex flex-col items-center justify-center border-2 border-dashed"
            >
              <span className="text-5xl mb-2">+</span>
              <span className="text-lg">새 프로젝트 시작하기</span>
            </Button>
          </DialogTrigger>
          {/* DialogContent를 조건부 렌더링하여 폼 상태 초기화 보장 */}
          {isModalOpen && (
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새 프로젝트 시작하기</DialogTitle>
              </DialogHeader>
              <ProjectForm />
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectsPage;