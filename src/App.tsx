import { useState } from 'react';
import './App.css';
import { TubeCalculator } from './components/TubeCalculator';
import { ReferenceTab } from './components/ReferenceTab';

type Tab = 'calc' | 'reference';

function App() {
  const [tab, setTab] = useState<Tab>('calc');

  return (
    <main className="calc">
      <header className="calc-header">
        <h1>ASME Boiler Tube Calculator</h1>
        <p className="subtitle">Section I PG-27.2.1 — Minimum Wall Thickness</p>
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
      </header>
      {tab === 'calc' ? <TubeCalculator /> : <ReferenceTab />}
      <footer className="app-footer">
        <p>
          Built by Tyler Chambers. Calculations based solely on ASME BPVC Section I and Section II
          Part D (2015 edition). Not a substitute for engineering judgment or a licensed inspector.
        </p>
      </footer>
    </main>
  );
}

export default App;
