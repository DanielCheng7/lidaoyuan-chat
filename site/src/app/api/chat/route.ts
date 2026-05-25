import { readFileSync } from "fs";
import { join } from "path";

const API_KEY = process.env.DEEPSEEK_API_KEY!;
const BASE_URL = "https://api.deepseek.com/v1";

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "system-prompt.txt"),
  "utf-8"
);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("DeepSeek API error:", response.status, err);
      if (response.status === 402) {
        return Response.json({ error: "DeepSeek 账户余额不足" }, { status: 402 });
      }
      return Response.json({ error: `API 错误 (${response.status})` }, { status: response.status });
    }

    // Pipe the SSE stream through
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    console.error("Chat API error:", msg);
    return Response.json({ error: "AI 服务暂时不可用" }, { status: 500 });
  }
}
