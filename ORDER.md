## 파일 수정 요청: `app/projects/join/[inviteCode]/page.tsx`

### 목적
`app/projects/join/[inviteCode]/page.tsx` 파일에서 `LoadingSpinner` 컴포넌트의 임포트 경로가 잘못되어 빌드 오류가 발생하고 있습니다. 올바른 경로로 수정하여 빌드 오류를 해결해야 합니다.

### 작업 내용
`app/projects/join/[inviteCode]/page.tsx` 파일에서 `LoadingSpinner` 컴포넌트의 임포트 경로를 다음과 같이 수정해 주세요:

**기존 코드:**
```typescript
import { LoadingSpinner } from '@/components/loading-spinner';
```

**수정할 코드:**
```typescript
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
```

### 완료 후
파일 수정을 완료하시면 저에게 알려주세요. 빌드 재시도를 통해 문제가 해결되었는지 확인하겠습니다.

### Git 커밋 명령어
```bash
git add . && git commit -m "Fix: LoadingSpinner 임포트 경로 수정 in app/projects/join/[inviteCode]/page.tsx" && git push
```