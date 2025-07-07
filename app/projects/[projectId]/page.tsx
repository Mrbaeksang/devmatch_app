// app/projects/[projectId]/page.tsx

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // Tabs 컴포넌트 import

// ProjectMemberWithUser 인터페이스 정의
interface ProjectMemberWithUser {
  userId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Avatar 컴포넌트 import

async function getProjectDetails(projectId: string, userId: string) {
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
  return project;
}

export default async function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return notFound();
  }

  const project = await getProjectDetails(params.projectId, session.user.id);

  if (!project) {
    return notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <p className="text-lg text-gray-600 mt-2">{project.goal}</p>
      </header>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="chat">채팅</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="border-t mt-2 pt-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              참여 멤버 ({project.members.length}명)
            </h2>
            <div className="flex flex-wrap gap-4">
              {project.members.map((member: ProjectMemberWithUser) => (
                <div key={member.userId} className="flex items-center gap-2 p-2 border rounded-md">
                  <Avatar>
                    <AvatarImage src={member.user.image || ''} alt={member.user.name || 'avatar'} />
                    <AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{member.user.name}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <p>채팅 기능이 여기에 구현될 예정입니다.</p>
        </TabsContent>
        <TabsContent value="settings">
          <p>설정 기능이 여기에 구현될 예정입니다.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}