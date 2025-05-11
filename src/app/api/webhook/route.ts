import { headers } from 'next/headers';
import { Octokit } from 'octokit';
import { processGitHubEvent } from '@/lib/github-fetch';

export const runtime = 'edge';

export async function POST(req: Request) {
  const payload = await req.json();
  const headersList = headers();
  const githubEvent = headersList.get('x-github-event');
  const signature = headersList.get('x-hub-signature-256');

  // シグネチャの検証（実装必要）
  if (!signature) {
    return new Response('Unauthorized', { status: 401 });
  }

  // GitHubイベントの処理
  if (githubEvent === 'push' || githubEvent === 'pull_request' || githubEvent === 'issues') {
    try {
      const octokit = new Octokit({
        auth: process.env.GITHUB_PAT
      });

      await processGitHubEvent(octokit, githubEvent, payload);
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Webhook processing error:', error);
      // エラー時はDead Letter Queueに格納（実装必要）
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  return new Response('Unsupported Event Type', { status: 400 });
}
