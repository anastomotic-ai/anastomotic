import { useState } from 'react';
import { Brain, Search, Trash2, X } from 'lucide-react';
import { useMemory } from './useMemory';

export function MemoryPanel() {
  const {
    memories,
    stats,
    preferences,
    isLoading,
    searchQuery,
    searchResults,
    search,
    deleteMemory,
    deletePreference,
    clearAll,
  } = useMemory();
  const [searchInput, setSearchInput] = useState('');
  const [activeTab, setActiveTab] = useState<'memories' | 'preferences'>('memories');

  const displayItems = searchQuery ? searchResults : memories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Deep Memory</h3>
        </div>
        {stats && (
          <span className="text-sm text-muted-foreground">
            {stats.totalEntries} memories · {stats.preferences} preferences
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        The agent automatically learns from your tasks — building long-term memory of your
        preferences, patterns, and project context across sessions.
      </p>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full rounded-md border bg-background px-10 py-2 text-sm"
          placeholder="Search memories..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            search(e.target.value);
          }}
        />
        {searchInput && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSearchInput('');
              search('');
            }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'memories' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('memories')}
        >
          Memories ({memories.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preferences' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences ({preferences.length})
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : activeTab === 'memories' ? (
        <MemoryList items={displayItems} onDelete={deleteMemory} />
      ) : (
        <PreferenceList items={preferences} onDelete={deletePreference} />
      )}

      {(memories.length > 0 || preferences.length > 0) && (
        <button className="text-sm text-destructive hover:underline" onClick={clearAll}>
          Clear all memories
        </button>
      )}
    </div>
  );
}

function MemoryList({
  items,
  onDelete,
}: {
  items: Array<{ id: string; category: string; content: string; scope: string; createdAt: string }>;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No memories yet. Complete some tasks and the agent will start learning.
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {items.map((mem) => (
        <div key={mem.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {mem.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-muted-foreground">{mem.scope}</span>
            </div>
            <p className="text-sm text-foreground">{mem.content}</p>
          </div>
          <button
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(mem.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function PreferenceList({
  items,
  onDelete,
}: {
  items: Array<{ id: string; key: string; label: string; value: string; confidence: number }>;
  onDelete: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No preferences learned yet. The agent will pick up your patterns over time.
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {items.map((pref) => (
        <div key={pref.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{pref.label}</span>
              <span className="text-xs text-muted-foreground">
                {Math.round(pref.confidence * 100)}% confident
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{pref.value}</p>
          </div>
          <button
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => onDelete(pref.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
