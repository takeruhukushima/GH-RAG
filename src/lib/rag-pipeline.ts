import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchVectorStore } from './vector-store';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateResponse(query: string) {
  // 関連するチャンクを検索
  const relevantChunks = await searchVectorStore(query);

  // コンテキストの構築
  const context = relevantChunks.map(chunk => {
    const citation = chunk.metadata.license 
      ? `\nSource: ${chunk.metadata.path} (License: ${chunk.metadata.license})`
      : `\nSource: ${chunk.metadata.path}`;
    return chunk.content + citation;
  }).join('\n\n');

  // プロンプトの構築
  const prompt = `以下のGitHubリポジトリのコンテキストに基づいて質問に答えてください：

コンテキスト:
${context}

質問: ${query}

回答は簡潔に、かつ正確にお願いします。コードの引用元とライセンス情報も含めてください。`;

  // Geminiモデルの生成
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
