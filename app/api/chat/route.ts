import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, convertToCoreMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY!,
      headers: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Team Building Manager",
      },
    });

    const result = streamText({
      model: openrouter('mistralai/mistral-7b-instruct'),
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
    // 또는 클라이언트 훅과 연동하려면:
    // return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error("API 오류 발생:", error);
    return new Response(error instanceof Error ? error.message : 'Unknown error', { status: 500 });
  }
}
