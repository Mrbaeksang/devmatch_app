## `nanoid` 패키지 설치 요청

### 작업 설명
`app/api/projects/[projectId]/invite/route.ts` 파일에서 고유한 초대 코드를 생성하기 위해 `nanoid` 패키지를 사용하고 있습니다. 현재 프로젝트에 `nanoid`가 설치되어 있지 않으므로, 다음 명령어를 실행하여 설치를 진행해 주십시오.

### 실행 명령어
```bash
pnpm install nanoid
```

### 작업 완료 후
설치가 완료되면 저에게 알려주십시오. 다음 작업으로 진행하겠습니다.

### Git 커밋 명령어
```bash
git add . && git commit -m "feat: Add nanoid package for invite link generation" && git push
```