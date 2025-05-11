interface Repository {
  owner: string;
  name: string;
}

// 環境変数から対象リポジトリを取得
export function getTargetRepositories(): Repository[] {
  const repoString = process.env.TARGET_REPOSITORIES || '';
  return repoString.split(',').map(repo => {
    const [owner, name] = repo.trim().split('/');
    return { owner, name };
  }).filter(repo => repo.owner && repo.name);
}
