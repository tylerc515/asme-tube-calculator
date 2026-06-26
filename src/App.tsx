import './App.css';
import { TubeCalculator } from './components/TubeCalculator';

function App() {
  return (
    <main className="calc">
      <header className="calc-header">
        <h1>ASME Boiler Tube Calculator</h1>
        <p className="subtitle">Section I PG-27.2.1 — Minimum Wall Thickness</p>
      </header>
      <TubeCalculator />
    </main>
  );
}

export default App;
