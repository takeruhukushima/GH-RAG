import { StreamingTextResponse } from 'ai';
import { GoogleGenAI } from '@google/genai';
import { searchContent } from '@/lib/search';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // シンプルなテキスト検索を実行
  const relevantChunks = await searchContent(lastMessage.content);
  
  // Geminiモデルの初期化
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // コンテキストの構築
  const context = relevantChunks.map(chunk => {
    return `${chunk.content}\nSource: ${chunk.metadata.path}`;
  }).join('\n\n');

  // プロンプトの構築
  const prompt = `以下のGitHubリポジトリのコンテキストに基づいて質問に答えてください：

コンテキスト:
${context}

質問: ${lastMessage.content}

回答は簡潔に、かつ正確にお願いします。`;

  try {
    // Geminiの応答をストリーミング
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro-exp-03-25',
      contents: prompt
    });

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(response.text));
        controller.close();
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error generating response:', error);
    return new Response('Error generating response', { status: 500 });
  }
}
