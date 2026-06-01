import React, { useEffect, useState } from 'react';
import { Moon, Monitor, Sun } from 'lucide-react';
import type { ThemeMode } from '../types';

const themes: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
  { value: 'amoled', label: 'AMOLED', icon: <Monitor size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
];

export const ThemeSwitcher: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('portfolio-theme') as ThemeMode) || 'amoled');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  return (
    <div className="flex rounded-lg border border-white/10 bg-black/30 p-1" aria-label="Theme selector">
      {themes.map((item) => (
        <button
          key={item.value}
          type="button"
          title={`${item.label} theme`}
          aria-label={`${item.label} theme`}
          onClick={() => setTheme(item.value)}
          className={`inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md px-2 text-xs font-bold transition-colors ${
            theme === item.value ? 'bg-primary text-black' : 'text-light hover:bg-white/10'
          }`}
        >
          {item.icon}
          <span className="hidden lg:inline">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
