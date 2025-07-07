# 작업 요청: 배포 오류 수정 (재검토 및 재작성)

안녕하세요, 사장님. 배포 시 발생한 컴파일 오류 및 ESLint 경고들을 해결하기 위한 수정 사항들입니다. 이전 `ORDER.md`의 불찰에 대해 다시 한번 사과드립니다. 이번에는 각 파일의 현재 상태를 정확히 반영하여 지침을 작성했습니다.

아래 지침에 따라 각 파일을 수정해 주세요.

---

### 1. `app/projects/[projectId]/page.tsx` 수정

`ProjectMemberWithUser` 인터페이스에서 `project: any;` 라인을 제거합니다. 이 인터페이스는 멤버의 사용자 정보를 정의하는 데 중점을 두며, `project` 객체 자체는 이 컨텍스트에서 필요하지 않습니다.

**수정 전:**
```typescript
interface ProjectMemberWithUser {
  userId: string;
  joinedAt: Date;
  project: any; // 또는 Project 타입 (필요시 정의)
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
```

**수정 후:**
```typescript
interface ProjectMemberWithUser {
  userId: string;
  joinedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}
```

### 2. `app/projects/new/page.tsx` 수정

`onError` 콜백 함수 내 `error` 변수가 사용되지 않는다는 ESLint 오류를 해결하기 위해, 해당 라인에 `// eslint-disable-next-line @typescript-eslint/no-unused-vars` 주석을 추가합니다. 이 변수는 `console.error`에서 사용되고 있으나, ESLint가 이를 감지하지 못하는 경우입니다.

**수정 전:**
```typescript
    onError: (error: Error) => {
      console.error("AI chat error:", error);
      toast.error("AI와 대화 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
```

**수정 후:**
```typescript
    onError: (error: Error) => { // eslint-disable-next-line @typescript-eslint/no-unused-vars
      console.error("AI chat error:", error);
      toast.error("AI와 대화 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
```

### 3. `app/projects/page.tsx` 수정

`useState` 훅이 임포트되었지만 사용되지 않는다는 오류를 해결하기 위해, 해당 임포트 문을 제거합니다. 현재 파일 내용에는 `useState` 임포트가 주석 처리되어 있으므로, 이 주석을 완전히 제거하여 깔끔하게 정리합니다.

**수정 전 (파일 상단):**
```typescript
//import React, { useState } from "react";
```

**수정 후 (해당 라인 제거):**
```typescript
// 이 라인을 완전히 제거합니다.
```

### 4. `app/auth/page.tsx` 수정

`<img>` 태그 대신 `next/image` 컴포넌트를 사용하도록 수정하여 성능 경고를 해결합니다. `next/image`를 임포트하고, `<img>` 태그를 `<Image>` 컴포넌트로 교체합니다.

**수정 전 (파일 상단):**
```typescript
// ... 다른 임포트
```

**수정 후 (파일 상단에 추가):**
```typescript
import Image from "next/image";
// ... 다른 임포트
```

**수정 전 (파일 내용 중 `<img>` 태그):**
```html
<img src="/google-icon.svg" alt="Google" class="w-5 h-5 mr-2" />
```

**수정 후 (해당 `<img>` 태그를 `<Image>`로 교체):**
```html
<Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
```

**수정 전 (파일 내용 중 다른 `<img>` 태그):**
```html
<img src="/kakao-icon.svg" alt="Kakao" class="w-5 h-5 mr-2" />
```

**수정 후 (해당 `<img>` 태그를 `<Image>`로 교체):**
```html
<Image src="/kakao-icon.svg" alt="Kakao" width={20} height={20} className="mr-2" />
```

### 5. `lib/db.ts` 수정

사용되지 않는 `eslint-disable` 지시문을 제거합니다.

**수정 전 (파일 상단):**
```typescript
/* eslint-disable no-var */
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
```

**수정 후 (해당 라인 제거):**
```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
```

---

### 6. 커밋 명령어

모든 수정이 완료되면, 아래 명령어를 사용하여 커밋해 주세요.

```bash
git add . && git commit -m "fix: Resolve build errors and ESLint warnings for deployment"
```
