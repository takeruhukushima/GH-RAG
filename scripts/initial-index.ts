import { Octokit } from 'octokit';
import { preprocessCode, preprocessDocument, splitIntoChunks } from '../src/lib/preprocessor';
import { createEmbedding } from '../src/lib/embedder';
import { upsertToVectorStore } from '../src/lib/vector-store';
import { prisma } from '../src/lib/prisma';

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

async function indexRepository(owner: string, repo: string) {
  try {
    // リポジトリ情報の取得
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    // リポジトリをDBに登録
    const repository = await prisma.repository.upsert({
      where: { id: repoData.id.toString() },
      create: {
        id: repoData.id.toString(),
        name: repo,
        owner: owner,
        license: repoData.license?.spdx_id ?? undefined,
      },
      update: {
        lastIndexed: new Date(),
      },
    });

    // ファイル一覧の取得
    const { data: tree } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: repoData.default_branch,
      recursive: '1',
    });

    // ファイルの処理
    for (const item of tree.tree) {
      if (item.type !== 'blob') continue;
      if (!item.path) {
        console.warn('Skipping tree item with no path:', item);
        continue;
      }

      try {
        const { data: content } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: item.path,
        });

        if (Array.isArray(content) || !('content' in content)) continue; // ディレクトリやcontentプロパティがない場合はスキップ

        const isCode = item.path.match(/\\.(js|ts|py|java|go|rb|php|cs|cpp|h)$/i);
        const rawContent = Buffer.from(content.content, 'base64').toString();
        
        // 大きなファイルはチャンクに分割
        const chunks = splitIntoChunks(rawContent);
        
        for (const [index, chunk] of chunks.entries()) {
          const preprocessed = isCode
            ? preprocessCode(chunk)
            : preprocessDocument(chunk);

          const embedding = await createEmbedding(preprocessed);
          
          await upsertToVectorStore({
            repoId: repository.id,
            type: isCode ? 'code' : 'document',
            content: preprocessed,
            embedding,
            metadata: {
              path: item.path + (chunks.length > 1 ? ` (part ${index + 1})` : ''),
              license: repoData.license?.spdx_id ?? undefined,
            },
          });
        }
      } catch (error) {
        console.error(`Error processing file ${item.path}:`, error);
        continue;
      }

      // Rate limit対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Issue一覧の取得
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner,
      repo,
      state: 'all',
      per_page: 100,
    });

    // Issueの処理
    for (const issue of issues) {
      if (!issue.body || issue.body.length < 50) continue;

      const preprocessed = preprocessDocument(issue.body);
      const embedding = await createEmbedding(preprocessed);

      await upsertToVectorStore({
        repoId: repository.id,
        type: 'document',
        content: preprocessed,
        embedding,
        metadata: {
          path: `Issue #${issue.number}: ${issue.title}`,
          license: repoData.license?.spdx_id ?? undefined,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Successfully indexed repository: ${owner}/${repo}`);
  } catch (error) {
    console.error(`Error indexing repository ${owner}/${repo}:`, error);
    throw error;
  }
}

// コマンドライン引数からリポジトリ情報を取得
const [owner, repo] = process.argv.slice(2);
if (!owner || !repo) {
  console.error('Usage: ts-node initial-index.ts <owner> <repo>');
  process.exit(1);
}

indexRepository(owner, repo)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
