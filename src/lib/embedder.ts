import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Creates an embedding for the given text content.
 * @param content The text content to embed.
 * @returns A promise that resolves to the embedding vector.
 */
export async function createEmbedding(content: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'embedding-001' }); // Or any other suitable embedding model

  try {
    const result = await model.embedContent({
      content: { parts: [{ text: content }], role: 'user' },
      taskType: TaskType.RETRIEVAL_DOCUMENT, // Or other task types like RETRIEVAL_QUERY, SEMANTIC_SIMILARITY, etc.
    });
    const embedding = result.embedding;
    if (!embedding || !embedding.values) {
      throw new Error('Failed to generate embedding or embedding values are missing.');
    }
    return embedding.values;
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}
