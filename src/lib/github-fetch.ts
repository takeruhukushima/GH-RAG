import { Octokit } from 'octokit';
import { preprocessCode, preprocessDocument } from './preprocessor';
import { saveToIndex } from './search';

export async function processGitHubEvent(
  octokit: Octokit,
  eventType: string,
  payload: any
) {
  const { repository } = payload;

  // レート制限の確認
  const { data: rateLimit } = await octokit.rest.rateLimit.get();
  if (rateLimit.resources.core.remaining < rateLimit.resources.core.limit * 0.1) {
    throw new Error('Rate limit is too low');
  }

  switch (eventType) {
    case 'push':
      await handlePushEvent(octokit, payload);
      break;
    case 'pull_request':
      await handlePREvent(octokit, payload);
      break;
    case 'issues':
      await handleIssueEvent(octokit, payload);
      break;
  }
}

async function handlePushEvent(octokit: Octokit, payload: any) {
  const { commits } = payload;
  for (const commit of commits) {
    // 変更されたファイルの取得
    const { data: files } = await octokit.rest.repos.getCommit({
      owner: payload.repository.owner.name,
      repo: payload.repository.name,
      ref: commit.id,
    });

    for (const file of files.files || []) {
      if (file.status === 'removed') {
        continue;
      }

      // ファイルの内容を取得
      const { data: content } = await octokit.rest.repos.getContent({
        owner: payload.repository.owner.name,
        repo: payload.repository.name,
        path: file.filename,
        ref: commit.id,
      });

      const isCode = file.filename.match(/\.(js|ts|py|java|go|rb|php|cs|cpp|h)$/i);
      const preprocessed = isCode
        ? preprocessCode(content)
        : preprocessDocument(content);

      await saveToIndex({
        content: preprocessed,
        metadata: {
          path: file.filename,
          type: isCode ? 'code' : 'document',
        },
      });
    }
  }
}

async function handlePREvent(octokit: Octokit, payload: any) {
  if (payload.action !== 'opened' && payload.action !== 'edited') return;

  const pr = payload.pull_request;
  if (!pr.body || pr.body.length < 50) return; // スパムフィルタ

  const preprocessed = preprocessDocument(pr.body);
  
  await saveToIndex({
    content: preprocessed,
    metadata: {
      path: `PR #${pr.number}: ${pr.title}`,
      type: 'document',
    },
  });
}

async function handleIssueEvent(octokit: Octokit, payload: any) {
  if (payload.action !== 'opened' && payload.action !== 'edited') return;

  const issue = payload.issue;
  if (!issue.body || issue.body.length < 50) return; // スパムフィルタ

  const preprocessed = preprocessDocument(issue.body);

  await saveToIndex({
    content: preprocessed,
    metadata: {
      path: `Issue #${issue.number}: ${issue.title}`,
      type: 'document',
    },
  });
}
