# AI 에이전트 작업 요청서 (Phase 1.3 - 프로젝트 상세 페이지 UI 생성)

사장님, `Phase 1.2: 프로젝트 등록` 기능 구현이 완료되었습니다. 이제 `Phase 1.3: 프로젝트 상세 페이지`를 구현하겠습니다.

이 단계에서는 특정 프로젝트의 상세 정보를 보여주는 페이지의 UI를 생성합니다.

---

### 요청 작업 1: `app/projects/[projectId]/page.tsx` 파일 생성

이 페이지는 프로젝트의 이름, 목표, 참여 멤버 목록을 표시하고, `shadcn/ui Tabs`를 활용하여 '정보', '채팅', '설정' 등 탭 구조를 구현합니다.

-   **작업의 역할 및 연관 관계:**
    -   동적 라우팅을 사용하여 특정 `projectId`에 해당하는 프로젝트 정보를 표시합니다.
    -   `shadcn/ui Tabs` 컴포넌트를 사용하여 페이지 내에서 정보를 구조화합니다.

-   **요청 사항:**
    1.  `app/projects/[projectId]` 라는 디렉토리를 생성해주세요. (이미 있다면 넘어갑니다)
    2.  `app/projects/[projectId]/page.tsx` 파일을 생성하고, 아래 코드를 붙여넣어 주세요.

    ```tsx
    "use client";

    import React from 'react';
    import { useParams } from 'next/navigation';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { Button } from '@/components/ui/button';

    const ProjectDetailPage = () => {
      const params = useParams();
      const projectId = params.projectId; // URL에서 projectId 가져오기

      // 임시 프로젝트 데이터 (나중에 API에서 받아올 예정)
      const project = {
        id: projectId,
        name: `프로젝트 ${projectId}`,
        goal: `이것은 프로젝트 ${projectId}의 목표입니다.`, 
        members: [
          { id: 'user1', name: '김초보' },
          { id: 'user2', name: '이개발' },
        ],
      };

      if (!project) {
        return <div className="container mx-auto p-4">프로젝트를 찾을 수 없습니다.</div>;
      }

      return (
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
          <p className="text-lg text-muted-foreground mb-6">{project.goal}</p>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">정보</TabsTrigger>
              <TabsTrigger value="chat">채팅</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-semibold mb-2">참여 멤버</h2>
              <ul>
                {project.members.map((member) => (
                  <li key={member.id}>{member.name}</li>
                ))}
              </ul>
              <div className="mt-4 flex space-x-2">
                <Button variant="destructive">프로젝트 종료</Button>
                <Button variant="outline">프로젝트 나가기</Button>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-semibold mb-2">팀 전용 채팅방</h2>
              <p>채팅 기능이 여기에 구현될 예정입니다.</p>
            </TabsContent>
            <TabsContent value="settings" className="p-4 border rounded-md mt-4">
              <h2 className="text-xl font-semibold mb-2">프로젝트 설정</h2>
              <p>프로젝트 설정 기능이 여기에 구현될 예정입니다.</p>
            </TabsContent>
          </Tabs>
        </div>
      );
    };

    export default ProjectDetailPage;
    ```

---

### 요청 작업 2: 개발 서버 재실행 및 페이지 확인

새로 생성된 페이지를 확인하기 위해 개발 서버를 재실행하고, 웹 브라우저에서 `/projects/[projectId]` 경로로 접속하여 페이지가 정상적으로 표시되는지 확인해주세요. `[projectId]` 부분은 아무 값이나 입력해도 됩니다 (예: `http://localhost:3000/projects/test-project-id`).

-   **작업의 역할 및 연관 관계:**
    -   페이지가 정상적으로 렌더링되는지 확인하고, 탭 컴포넌트가 잘 작동하는지 확인합니다.

-   **요청 드릴 명령어:**
    -   터미널에서 `devmatch-app` 디렉토리로 이동하여 아래 명령어를 실행해주세요.

    ```bash
    pnpm dev
    ```
    -   서버가 시작되면 웹 브라우저에서 `http://localhost:3000/projects/test-project-id`와 같이 접속하여 페이지를 확인해주세요.
    -   만약 오류가 발생하면, 터미널에 출력되는 모든 내용을 복사하여 `C:\Users\qortk\IdeaProjects\devmatch-app\error.md` 파일에 붙여넣어 주세요.
    -   **주의**: `error.md` 파일의 기존 내용은 모두 지우고 새로운 오류 메시지만 붙여넣어 주세요.

---

위 작업들을 모두 완료하신 후 저에게 알려주세요. 제가 결과를 확인하고 다음 단계를 안내해 드리겠습니다. 감사합니다!