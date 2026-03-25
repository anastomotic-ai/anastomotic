import { getAnastomotic } from './anastomotic';
import { type ThemePreference, THEME_KEY, resolveTheme, applyClass } from './theme-core';

let mediaQuery: MediaQueryList | null = null;
let mediaListener: ((e: MediaQueryListEvent) => void) | null = null;
let themeChangeCleanup: (() => void) | null = null;

function cleanupSystemListener(): void {
  if (mediaQuery && mediaListener) {
    mediaQuery.removeEventListener('change', mediaListener);
    mediaQuery = null;
    mediaListener = null;
  }
}

function setupSystemListener(): void {
  cleanupSystemListener();
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaListener = (e: MediaQueryListEvent) => {
    applyClass(e.matches ? 'dark' : 'light');
  };
  mediaQuery.addEventListener('change', mediaListener);
}

export function applyTheme(preference: string): void {
  const validated = (
    ['system', 'light', 'dark'].includes(preference) ? preference : 'system'
  ) as ThemePreference;

  localStorage.setItem(THEME_KEY, validated);

  const resolved = resolveTheme(validated);
  applyClass(resolved);

  if (validated === 'system') {
    setupSystemListener();
  } else {
    cleanupSystemListener();
  }
}

export function initTheme(): void {
  const api = getAnastomotic();

  api.getTheme().then((preference) => {
    applyTheme(preference);
  });

  if (api.onThemeChange) {
    themeChangeCleanup = api.onThemeChange(({ theme }) => {
      applyTheme(theme);
    });
  }
}

export function cleanupTheme(): void {
  cleanupSystemListener();
  if (themeChangeCleanup) {
    themeChangeCleanup();
    themeChangeCleanup = null;
  }
}
