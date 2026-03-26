import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createLogger } from '@/lib/logger';

const logger = createLogger('MarketplacePanel');

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  githubUrl: string;
  downloads: number;
  stars: number;
  tags: string[];
  verified: boolean;
}

type CategoryFilter =
  | 'all'
  | 'development'
  | 'productivity'
  | 'data'
  | 'devops'
  | 'research'
  | 'writing';

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: 'All Categories',
  development: 'Development',
  productivity: 'Productivity',
  data: 'Data',
  devops: 'DevOps',
  research: 'Research',
  writing: 'Writing',
};

interface MarketplacePanelProps {
  onSkillInstalled?: () => void;
}

export function MarketplacePanel({ onSkillInstalled }: MarketplacePanelProps) {
  const [catalog, setCatalog] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!window.anastomotic?.getMarketplaceCatalog) {
      setLoading(false);
      return;
    }
    window.anastomotic
      .getMarketplaceCatalog()
      .then(setCatalog)
      .catch((err: unknown) => logger.error('Failed to load marketplace:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let results = catalog;
    if (category !== 'all') {
      results = results.filter((s) => s.category === category);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((tag) => tag.includes(q)),
      );
    }
    return results;
  }, [catalog, category, searchQuery]);

  const handleInstall = useCallback(
    async (item: MarketplaceItem) => {
      if (!window.anastomotic?.installMarketplaceSkill || installingId) {
        return;
      }
      setInstallingId(item.id);
      try {
        await window.anastomotic.installMarketplaceSkill(item.githubUrl);
        setInstalledIds((prev) => new Set(prev).add(item.id));
        onSkillInstalled?.();
      } catch (err) {
        logger.error('Failed to install skill:', err);
      } finally {
        setInstallingId(null);
      }
    },
    [installingId, onSkillInstalled],
  );

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="mb-4 flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-[170px] items-center justify-between gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted">
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-3.5 w-3.5 text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
                {CATEGORY_LABELS[category]}
              </div>
              <svg
                className="h-3 w-3 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[180px]">
            {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((cat) => (
              <DropdownMenuItem key={cat} onClick={() => setCategory(cat)}>
                {CATEGORY_LABELS[cat]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <Input
            type="text"
            placeholder="Search marketplace skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="max-h-[480px] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, index) => {
              const isInstalled = installedIds.has(item.id);
              const isInstalling = installingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    layout: { duration: 0.2 },
                    opacity: { duration: 0.15 },
                    scale: { duration: 0.15 },
                    delay: index * 0.02,
                  }}
                >
                  <div className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{item.name}</span>
                        {item.verified && (
                          <svg
                            className="h-4 w-4 text-blue-500"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {item.category}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {item.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {item.stars}
                        </span>
                        <span>by {item.author}</span>
                      </div>

                      <button
                        onClick={() => handleInstall(item)}
                        disabled={isInstalled || isInstalling}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          isInstalled
                            ? 'bg-green-500/10 text-green-500 cursor-default'
                            : isInstalling
                              ? 'bg-muted text-muted-foreground cursor-wait'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                      >
                        {isInstalled ? 'Installed' : isInstalling ? 'Installing...' : 'Install'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            No skills found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
