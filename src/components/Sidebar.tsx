"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Repository {
  id: string;
  name: string;
  owner: string;
  url: string;
}

const Sidebar = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await fetch('/api/repositories');
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const data = await response.json();
        setRepositories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, []);

  if (loading) {
    return <div className="p-4">Loading repositories...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-64 h-full bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4">Repositories</h2>
      <ul>
        {repositories.map((repo) => (
          <li key={repo.id} className="mb-2">
            <Link href={`/repository/${repo.owner}/${repo.name}`} className="hover:text-gray-300">
              {repo.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
