import { THEME_GLYPH, THEME_LABEL, THEMES, type Theme } from '../theme';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" role="group" aria-label="Color theme">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          className={theme === t ? 'active' : ''}
          onClick={() => setTheme(t)}
          aria-pressed={theme === t}
          aria-label={THEME_LABEL[t]}
          title={THEME_LABEL[t]}
        >
          <span aria-hidden="true">{THEME_GLYPH[t]}</span>
        </button>
      ))}
    </div>
  );
}
