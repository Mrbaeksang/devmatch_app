# `app/api/chat/route.ts` 구현 요청 (Vercel AI SDK + OpenRouter 연동)

안녕하세요, 사장님.

새로운 프로젝트 생성 플로우의 AI 상담 기능을 위해, Vercel AI SDK와 OpenRouter를 연동하는 API 라우트를 구현하겠습니다. 이 API는 `app/projects/new/page.tsx`에서 AI 모델과의 통신을 담당하게 됩니다.

## 변경 목표

`app/api/chat/route.ts` 파일을 생성하고, Vercel AI SDK의 `streamText` 함수와 `@openrouter/ai-sdk-provider`를 사용하여 AI 모델과의 대화 및 스트리밍 응답을 처리하는 백엔드 로직을 구현합니다.

## 구현 요청 사항

### 1. OpenRouter AI SDK Provider 설치

먼저, OpenRouter를 Vercel AI SDK와 함께 사용하기 위한 패키지를 설치해야 합니다. 다음 명령어를 실행해 주십시오.

```bash
pnpm add @openrouter/ai-sdk-provider
```

### 2. 환경 변수 설정

OpenRouter API 키를 `.env.local` 파일에 추가해야 합니다. OpenRouter 웹사이트에서 API 키를 발급받아 아래와 같이 추가해 주십시오.

```
OPENROUTER_API_KEY="YOUR_OPENROUTER_API_KEY"
```

### 3. `app/api/chat/route.ts` 파일 생성 및 코드 추가

`app/api/chat/route.ts` 파일을 생성하고, 아래의 코드 블록을 파일 전체에 붙여넣어 주십시오.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Create an OpenRouter provider instance
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
      // Optional: Add headers for site identification
      headers: {
        "HTTP-Referer": "http://localhost:3000", // Replace with your site URL
        "X-Title": "AI Team Building Manager", // Replace with your site name
      },
    });

    // 2. Call the model
    const result = await streamText({
      // Find model names on openrouter.ai/models
      model: openrouter('mistralai/mistral-7b-instruct'), // 초기 모델 설정, 필요에 따라 변경 가능
      messages: convertToCoreMessages(messages),
    });

    // 3. Respond with the stream
    return result.toAIStreamResponse();

  } catch (error) {
    console.error("API 오류 발생:", error);
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response('An unknown error occurred', { status: 500 });
  }
}
```

### 주요 변경 사항

1.  **`@openrouter/ai-sdk-provider` 임포트**: OpenRouter 모델을 사용하기 위한 프로바이더를 임포트합니다.
2.  **`createOpenRouter` 인스턴스 생성**: 환경 변수에서 `OPENROUTER_API_KEY`를 가져와 OpenRouter 프로바이더 인스턴스를 생성합니다.
3.  **`streamText` 함수 사용**: Vercel AI SDK의 `streamText` 함수를 사용하여 AI 모델(`mistralai/mistral-7b-instruct`로 초기 설정)과 통신하고, `convertToCoreMessages`를 사용하여 메시지 형식을 변환합니다.
4.  **스트리밍 응답**: `result.toAIStreamResponse()`를 사용하여 클라이언트로 스트리밍 응답을 보냅니다.
5.  **에러 처리**: API 호출 중 발생할 수 있는 오류를 처리하는 로직을 포함했습니다.

이 수정이 완료되면, `app/projects/new/page.tsx`에서 AI 모델과 실제 통신을 시작할 수 있게 됩니다.

수정이 완료되면 알려주세요. 다음 단계로 넘어가겠습니다.

---

`git add . && git commit -m "feat(api): Vercel AI SDK와 OpenRouter 연동 API 구현"`