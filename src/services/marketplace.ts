// Skill Marketplace — curated catalog of community skills

export interface MarketplaceSkill {
  id: string;
  name: string;
  description: string;
  author: string;
  category: MarketplaceCategory;
  githubUrl: string;
  downloads: number;
  stars: number;
  tags: string[];
  verified: boolean;
}

export type MarketplaceCategory =
  | 'development'
  | 'productivity'
  | 'data'
  | 'devops'
  | 'research'
  | 'writing'
  | 'other';

const CATALOG: MarketplaceSkill[] = [
  {
    id: 'mp-code-review',
    name: 'Code Review',
    description: 'Automated code review with best-practice checks and improvement suggestions.',
    author: 'Anastomotic',
    category: 'development',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/code-review',
    downloads: 4200,
    stars: 38,
    tags: ['code-quality', 'review', 'best-practices'],
    verified: true,
  },
  {
    id: 'mp-git-commit',
    name: 'Smart Git Commit',
    description: 'Generate conventional commit messages from staged changes automatically.',
    author: 'Anastomotic',
    category: 'development',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/git-commit',
    downloads: 3800,
    stars: 32,
    tags: ['git', 'commit', 'conventional-commits'],
    verified: true,
  },
  {
    id: 'mp-web-research',
    name: 'Web Research',
    description: 'Deep web research with source extraction, summarization, and citation tracking.',
    author: 'Anastomotic',
    category: 'research',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/web-research',
    downloads: 5100,
    stars: 45,
    tags: ['research', 'web', 'summarization'],
    verified: true,
  },
  {
    id: 'mp-download-file',
    name: 'Download File',
    description: 'Download files from URLs with progress tracking and integrity verification.',
    author: 'Anastomotic',
    category: 'productivity',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/download-file',
    downloads: 2900,
    stars: 20,
    tags: ['download', 'files', 'http'],
    verified: true,
  },
  {
    id: 'mp-google-sheets',
    name: 'Google Sheets',
    description: 'Read, write, and manipulate Google Sheets spreadsheets with natural language.',
    author: 'Anastomotic',
    category: 'data',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/google-sheets',
    downloads: 3200,
    stars: 28,
    tags: ['google-sheets', 'spreadsheet', 'data'],
    verified: true,
  },
  {
    id: 'mp-skill-creator',
    name: 'Skill Creator',
    description: 'Build new skills with AI assistance — generates SKILL.md from a description.',
    author: 'Anastomotic',
    category: 'development',
    githubUrl:
      'https://github.com/anastomotic-ai/anastomotic/tree/main/apps/desktop/bundled-skills/skill-creator',
    downloads: 2100,
    stars: 22,
    tags: ['meta', 'skill-builder', 'ai'],
    verified: true,
  },
  {
    id: 'mp-docker-manager',
    name: 'Docker Manager',
    description: 'Manage Docker containers, images, and compose stacks via natural language.',
    author: 'community',
    category: 'devops',
    githubUrl: 'https://github.com/anastomotic-ai/skills-docker-manager',
    downloads: 1800,
    stars: 15,
    tags: ['docker', 'containers', 'devops'],
    verified: false,
  },
  {
    id: 'mp-api-tester',
    name: 'API Tester',
    description: 'Test REST and GraphQL APIs interactively — send requests, inspect responses.',
    author: 'community',
    category: 'development',
    githubUrl: 'https://github.com/anastomotic-ai/skills-api-tester',
    downloads: 1500,
    stars: 12,
    tags: ['api', 'rest', 'graphql', 'testing'],
    verified: false,
  },
  {
    id: 'mp-readme-generator',
    name: 'README Generator',
    description: 'Generate professional README.md files from your project structure and code.',
    author: 'community',
    category: 'writing',
    githubUrl: 'https://github.com/anastomotic-ai/skills-readme-generator',
    downloads: 2400,
    stars: 19,
    tags: ['readme', 'documentation', 'markdown'],
    verified: false,
  },
  {
    id: 'mp-db-explorer',
    name: 'Database Explorer',
    description:
      'Query and explore SQL databases with natural language. Supports Postgres, MySQL, SQLite.',
    author: 'community',
    category: 'data',
    githubUrl: 'https://github.com/anastomotic-ai/skills-db-explorer',
    downloads: 1900,
    stars: 17,
    tags: ['database', 'sql', 'postgres', 'mysql'],
    verified: false,
  },
  {
    id: 'mp-ci-debugger',
    name: 'CI Debugger',
    description: 'Analyze failed CI/CD pipeline logs and suggest fixes for build errors.',
    author: 'community',
    category: 'devops',
    githubUrl: 'https://github.com/anastomotic-ai/skills-ci-debugger',
    downloads: 1100,
    stars: 9,
    tags: ['ci-cd', 'debugging', 'github-actions'],
    verified: false,
  },
  {
    id: 'mp-changelog-writer',
    name: 'Changelog Writer',
    description: 'Generate changelogs from git history following Keep a Changelog format.',
    author: 'community',
    category: 'writing',
    githubUrl: 'https://github.com/anastomotic-ai/skills-changelog-writer',
    downloads: 1300,
    stars: 11,
    tags: ['changelog', 'git', 'release-notes'],
    verified: false,
  },
];

export function getMarketplaceCatalog(): MarketplaceSkill[] {
  return CATALOG;
}

export function searchMarketplace(
  query: string,
  category?: MarketplaceCategory,
): MarketplaceSkill[] {
  let results = CATALOG;

  if (category) {
    results = results.filter((s) => s.category === category);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((tag) => tag.includes(q)),
    );
  }

  return results;
}
