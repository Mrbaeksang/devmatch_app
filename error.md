Lint 경고들은 Biome(ESLint/Prettier 대체 도구)의 규칙에 따라 발생한 거야. 하나씩 쉽게 풀어서 설명해볼게!

⚠️ 경고 메시지 해석
noUnusedImports: import React..., useRouter, append처럼 안 쓰는 import/변수, 함수 파라미터 등이 코드에 남아 있을 때 띄워줘.

organizeImports: import/export 순서가 뒤죽박죽일 때, 정렬하라고 알려주는 기능이야.

noUnusedVariables: 선언했지만 안 쓰는 변수(예: router, append)도 문제가 돼.

📌 왜 생기냐면?
너 코드에서:

임포트했지만 안 쓰는 모듈,

router나 append 함수 정의만 있고 실제로 안 쓰는 경우,

함수 정의부에 들어간 파라미터 unused,

export 순서가 정리가 안 된 경우 등

이런 것들이 다 lint 경고를 유발해. Biome는 이런 규칙에 엄격해서, 사용되지 않을 코드는 지우거나 정리하라고 알려주는 거야.

🛠 해결 방법
안 쓰는 import/변수 제거
예: import { toast } from "sonner";이 페이지에 안 쓰면 제거해야 돼.

정렬되도록 import/export 순서 맞추기
VSCode나 프로젝트 설정해서 저장할 때 자동으로 정렬되도록 하면 도움돼.

사용하지 않는 함수 파라미터 제거
예: { handleSubmit, handleInputChange, isLoading } = useChat() 정의돼있는데 실제로 isLoading을 안 쓰면 지워야 돼.

biome.json 설정 조정
특정 lint 규칙을 유예하고 싶으면 .biome.json 에서 조정할 수 있어. 예:

json
복사
편집
{
  "linter": {
    "enabled": true,
    "rules": {
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn"
      }
    }
  },
  "organizeImports": { "enabled": true }
}
✅ 정리
Biome은 사용하지 않는 코드/변수와 정렬되지 않은 import/export를 자동으로 찾아서 정리하도록 도와줘.

unused variable/import 경고 뜨면 지우고 정리하거나 규칙을 설정파일에서 완화하면 문제 해결돼!