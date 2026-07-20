import { useEffect, useState } from 'react';
import './App.css';
import { TubeCalculator } from './components/TubeCalculator';
import { ReferenceTab } from './components/ReferenceTab';
import { ThemeToggle } from './components/ThemeToggle';
import { THEMES, type Theme } from './theme';

type Tab = 'calc' | 'reference';

const THEME_KEY = 'theme';

// localStorage throws rather than returning null when storage is blocked, which
// happens in private browsing and in embedded frames with third-party cookies
// off. The theme is a preference, not state we cannot run without, so a failure
// to read or write it falls back to the system setting instead of breaking.
function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return THEMES.includes(saved as Theme) ? (saved as Theme) : 'system';
  } catch {
    // Storage blocked, so there is no saved preference to honour.
    return 'system';
  }
}

function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked, so the choice will not survive a reload. The attribute
    // is already applied, so the current page still themes correctly.
  }
}

function App() {
  const [tab, setTab] = useState<Tab>('calc');
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    storeTheme(theme);
  }, [theme]);

  return (
    <main className="calc">
      <header className="calc-header">
        <img
          src={`${import.meta.env.BASE_URL}tc_software_logo.png`}
          alt="TC Software"
          className="tc-logo"
          width={172}
          height={34}
        />
        <h1>ASME Boiler Tube Calculator</h1>
        <p className="subtitle">Section I PG-27.2.1 — Minimum Wall Thickness</p>
        <div className="header-controls">
          <nav className="tab-nav" role="tablist">
            <button role="tab" aria-selected={tab === 'calc'} onClick={() => setTab('calc')}>
              Calculator
            </button>
            <button
              role="tab"
              aria-selected={tab === 'reference'}
              onClick={() => setTab('reference')}
            >
              Reference
            </button>
          </nav>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>
      {tab === 'calc' ? <TubeCalculator /> : <ReferenceTab />}
      <footer className="app-footer">
        <p>
          Built by{' '}
          <a href="https://github.com/tylerc515" target="_blank" rel="noopener noreferrer">
            Tyler Chambers
          </a>
          . Calculations based solely on ASME BPVC Section I and Section II Part D (2015 edition).
          Not a substitute for engineering judgment or a licensed inspector.{' '}
          <a
            href="https://github.com/tylerc515/asme-tube-calculator/wiki"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
          .
        </p>
      </footer>
    </main>
  );
}

export default App;
