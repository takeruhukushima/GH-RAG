export function RepoSidebar() {
  const repos = [{ id: 1, name: 'org/api-server' }, { id: 2, name: 'org/web-ui' }];

  return (
    <aside className="w-64 shrink-0 border-r bg-slate-100 p-4">
      <h2 className="mb-4 text-lg font-semibold">対象リポジトリ</h2>
      <ul className="space-y-2">
        {repos.map((r) => (
          <li
            key={r.id}
            className="truncate rounded-md bg-white p-2 text-sm shadow hover:bg-indigo-50"
          >
            {r.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}
