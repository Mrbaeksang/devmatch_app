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

    // ✅ 모델 이름 수정
    const result = streamText({
      model: openrouter('deepseek/deepseek-r1-0528:free'),
      messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error("API 오류 발생:", error);
    return new Response(
      error instanceof Error ? error.message : 'Unknown error',
      { status: 500 }
    );
  }
}
