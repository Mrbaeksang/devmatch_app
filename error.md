[{
	"resource": "/c:/Users/qortk/IdeaProjects/devmatch-app/app/projects/[projectId]/page.tsx",
	"owner": "typescript",
	"code": "2304",
	"severity": 8,
	"message": "'ProjectMember' 이름을 찾을 수 없습니다.",
	"source": "ts",
	"startLineNumber": 79,
	"startColumn": 45,
	"endLineNumber": 79,
	"endColumn": 58
}]


🎯 문제 분석
@prisma/client는 정의된 모델 타입만 내보냅니다.

members처럼 include된 관계 데이터 타입은 자동 생성되지 않아요.

✅ 해결 방법
1. Prisma 유틸 타입 사용 (권장)
Prisma의 Prisma.<Model>GetPayload 유틸을 사용해서 include된 타입까지 자동으로 가져올 수 있습니다:

ts
복사
편집
import { Prisma } from '@prisma/client';

type ProjectWithMembers = Prisma.ProjectGetPayload<{
  include: {
    members: {
      include: {
        user: true;
      }
    }
  }
}>;
이렇게 하면 project 변수에 이 타입을 지정해 타입 추론을 정확하게 할 수 있습니다.

적용 예시
ts
복사
편집
const project = await getProjectDetails(...) as ProjectWithMembers;

{project.members.map((member) => (
  <div key={member.userId}>
    {/* member.user.name, image 접근 가능 */}
  </div>
))}
이 방식은 타입 선언이 코드와 자동으로 맞아떨어지며, 추후 DB 구조 변경에도 안전합니다.

2. 직접 타입 선언
간단하게 직접 타입을 선언할 수도 있습니다:

ts
복사
편집
type ProjectMember = {
  userId: string;
  user: {
    name: string | null;
    image: string | null;
  };
};
하지만 이 방식은 스키마 변경 시 수동 업데이트 필요합니다.

