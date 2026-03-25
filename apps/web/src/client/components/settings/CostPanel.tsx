'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAnastomotic } from '@/lib/anastomotic';
import type { CostSummary, CostBreakdown } from '@anastomotic_ai/agent-core/common';

type TimeRange = '24h' | '7d' | '30d' | 'all';

function getSinceDate(range: TimeRange): string | undefined {
  if (range === 'all') {
    return undefined;
  }
  const now = new Date();
  if (range === '24h') {
    now.setHours(now.getHours() - 24);
  } else if (range === '7d') {
    now.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    now.setDate(now.getDate() - 30);
  }
  return now.toISOString();
}

function formatCost(usd: number): string {
  if (usd < 0.01) {
    return `$${usd.toFixed(4)}`;
  }
  return `$${usd.toFixed(2)}`;
}

function formatTokens(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

export function CostPanel() {
  const api = useMemo(() => getAnastomotic(), []);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const sinceDate = getSinceDate(timeRange);
      const [s, b] = await Promise.all([
        api.getCostSummary(sinceDate),
        api.getCostBreakdown(sinceDate),
      ]);
      setSummary(s);
      setBreakdown(b);
    } catch {
      setError('Failed to load cost data');
    }
  }, [api, timeRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const ranges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground">Cost Tracking</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor your AI model usage and spending
          </p>
        </div>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setTimeRange(r.value)}
              className={`rounded-md px-2.5 py-1 text-xs transition-colors ${
                timeRange === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold text-foreground mt-0.5">
              {formatCost(summary.totalCostUsd)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Input Tokens</p>
            <p className="text-lg font-semibold text-foreground mt-0.5">
              {formatTokens(summary.totalInputTokens)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Output Tokens</p>
            <p className="text-lg font-semibold text-foreground mt-0.5">
              {formatTokens(summary.totalOutputTokens)}
            </p>
          </div>
        </div>
      )}

      {breakdown.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">No cost data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Cost data will appear here as you run tasks
          </p>
        </div>
      )}

      {breakdown.length > 0 && (
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-2">Breakdown by Model</h5>
          <div className="space-y-2">
            {breakdown.map((item) => (
              <div
                key={`${item.provider}-${item.model}`}
                className="rounded-lg border border-border bg-card p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.model}</p>
                  <p className="text-xs text-muted-foreground">{item.provider}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-medium text-foreground">
                    {formatCost(item.totalCostUsd)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTokens(item.totalInputTokens)} in /{' '}
                    {formatTokens(item.totalOutputTokens)} out
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
