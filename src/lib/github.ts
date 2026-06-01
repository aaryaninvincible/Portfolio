import type { PortfolioProject } from '../types';

type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  homepage?: string | null;
  updated_at: string;
  fork: boolean;
};

export const fetchGitHubProjects = async (): Promise<PortfolioProject[]> => {
  const response = await fetch('https://api.github.com/users/aaryaninvincible/repos?sort=updated&per_page=100');
  if (!response.ok) throw new Error('Unable to load GitHub projects');

  const repos = (await response.json()) as GitHubRepo[];

  return repos
    .filter((repo) => !repo.fork)
    .map((repo) => ({
      id: `github-${repo.id}`,
      title: repo.name.replace(/[-_]/g, ' '),
      description: repo.description || 'Project details, demo media, and use case will be added soon.',
      technologies: [repo.language, ...(repo.topics || [])].filter(Boolean) as string[],
      category: repo.language || 'Software',
      demoUrl: repo.homepage || undefined,
      source: 'github',
      updatedAt: repo.updated_at,
    }));
};
