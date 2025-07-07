import React from 'react';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

    // 나중에는 실제 Project 타입 데이터를 props로 받게 됩니다.
    interface ProjectCardProps {
      name: string;
      goal: string;
      memberCount: number;
    }

    const ProjectCard = ({ name, goal, memberCount }: ProjectCardProps) => {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>참여 인원: {memberCount}명</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{goal}</p>
          </CardContent>
          <CardFooter>
            <p>프로젝트 상세 정보 보기</p>
          </CardFooter>
        </Card>
      );
    };

    export default ProjectCard;