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
  const prompt = `あなたはGitHubリポジトリのコードベースに関する質問に答えるアシスタントです。
以下のコンテキストを使用して、質問に対して正確で具体的な回答を提供してください。

コンテキスト情報:
${context}

質問: ${query}

回答の要件:
1. 提供されたコンテキストに基づいて、具体的かつ正確に回答してください
2. コードを引用する場合は、必ずそのファイルパスを明記してください
3. 該当する場合は、コードのライセンス情報も含めてください
4. コンテキストに含まれていない情報について推測する場合は、その旨を明確に示してください
5. 回答は簡潔にまとめ、箇条書きを活用してください

回答：`;

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
