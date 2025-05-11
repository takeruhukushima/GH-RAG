import { prisma } from './prisma';

interface VectorStoreInput {
  repoId: string;
  type: 'code' | 'document';
  content: string;
  embedding: number[];
  metadata: {
    path: string;
    license?: string;
  };
}

export async function upsertToVectorStore(data: VectorStoreInput) {
  await prisma.document.upsert({
    where: {
      repoId_path: {
        repoId: data.repoId,
        path: data.metadata.path,
      },
    },
    create: {
      repoId: data.repoId,
      type: data.type,
      content: data.content,
      embedding: data.embedding,
      path: data.metadata.path,
      license: data.metadata.license,
    },
    update: {
      content: data.content,
      embedding: data.embedding,
      license: data.metadata.license,
    },
  });
}

export async function searchVectorStore(query: string, limit = 5) {
  const queryEmbedding = await createEmbedding(query);
  
  // pgvectorを使用したコサイン類似度検索
  const results = await prisma.$queryRaw`
    SELECT 
      d.content,
      d.path,
      d.type,
      d.license,
      1 - (d.embedding <=> ${queryEmbedding}::vector) as similarity
    FROM "Document" d
    ORDER BY d.embedding <=> ${queryEmbedding}::vector
    LIMIT ${limit}
  `;

  return results.map((result: any) => ({
    content: result.content,
    metadata: {
      path: result.path,
      type: result.type,
      license: result.license,
    },
  }));
}

// OpenAI APIを使用して埋め込みベクトルを生成
async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small',
    }),
  });

  const data = await response.json();
  return data.data[0].embedding;
}
