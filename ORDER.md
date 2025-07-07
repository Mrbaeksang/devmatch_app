# `app/api/projects/initial-setup/route.ts` 구현 요청 (AI 상담 결과 저장 API)

안녕하세요, 사장님.

`GEMINI.md`의 **Phase 1.2: 프로젝트 초기 설정 (AI 상담 기반)**의 백엔드 구현을 진행하겠습니다. 이 API는 AI 상담을 통해 얻은 프로젝트의 초기 정보를 데이터베이스에 저장하는 역할을 합니다.

## 변경 목표

`app/api/projects/initial-setup/route.ts` 파일을 생성하고, AI 상담을 통해 전달된 데이터를 받아 `Project` 모델의 `consultationData` 필드에 저장하고, `status`를 `INITIAL_CONSULTATION`으로 설정하는 API를 구현합니다.

## 구현 요청 사항

### 1. 데이터베이스 스키마 변경 적용

`prisma/schema.prisma` 파일을 수정하셨으므로, 반드시 다음 명령어를 실행하여 데이터베이스에 변경 사항을 적용해야 합니다.

```bash
pnpm prisma db push
```

### 2. `app/api/projects/initial-setup/route.ts` 파일 생성 및 코드 추가

`app/api/projects/initial-setup/route.ts` 파일을 생성하고, 아래의 코드 블록을 파일 전체에 붙여넣어 주십시오.

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { projectGoal, consultationData } = await req.json();

    if (!projectGoal || !consultationData) {
      return NextResponse.json({ message: 'Project goal and consultation data are required' }, { status: 400 });
    }

    // 프로젝트 초기 정보 저장 (status는 INITIAL_CONSULTATION으로 설정)
    const project = await db.project.create({
      data: {
        name: "새로운 프로젝트 (임시)", // 초기에는 임시 이름 사용
        goal: projectGoal,
        ownerId: session.user.id,
        status: ProjectStatus.INITIAL_CONSULTATION,
        consultationData: consultationData,
        members: {
          create: {
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error('프로젝트 초기 설정 API 오류:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}
```

### 주요 변경 사항

1.  **API 라우트 생성**: `app/api/projects/initial-setup/route.ts` 파일을 생성합니다.
2.  **사용자 인증**: `getServerSession`을 사용하여 현재 로그인된 사용자를 확인합니다.
3.  **데이터 유효성 검사**: 요청 본문에서 `projectGoal`과 `consultationData`를 추출하고 유효성을 검사합니다.
4.  **프로젝트 생성**: `db.project.create`를 사용하여 새로운 프로젝트를 생성합니다. 이때 `status`는 `ProjectStatus.INITIAL_CONSULTATION`으로 설정하고, `consultationData`를 저장합니다.
5.  **응답**: 생성된 프로젝트 정보를 반환합니다.

이 수정이 완료되면, AI 상담을 통해 얻은 프로젝트 초기 정보를 백엔드에 저장할 수 있게 됩니다.

수정이 완료되면 알려주세요. 다음 단계로 넘어가겠습니다.

---

`git add . && git commit -m "feat(api): AI 상담 결과 저장 API 구현"`