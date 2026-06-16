import { useState, useMemo } from 'react';
import './App.css';
import { getMaterials, lookupStress } from './engine/stress';
import { solveThickness, solveMAWP } from './engine/tube';
import { EXPANDED_END_E } from './engine/units';
import type { UnitSystem } from './engine/units';

type Edition = 'pre-1999' | 'asme-2015';
type SolveMode = 'thickness' | 'mawp';

function App() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('US');
  const [edition, setEdition] = useState<Edition>('asme-2015');
  const [materialId, setMaterialId] = useState('');
  const [tempF, setTempF] = useState('');
  const [solveMode, setSolveMode] = useState<SolveMode>('thickness');
  const [P, setP] = useState('');
  const [t, setT] = useState('');
  const [D, setD] = useState('');
  const [w, setW] = useState('1');
  const [expandedEnd, setExpandedEnd] = useState(false);

  const materials = useMemo(() => getMaterials(edition), [edition]);

  function handleEditionChange(next: Edition) {
    setEdition(next);
    const nextMaterials = getMaterials(next);
    if (!nextMaterials.some((m) => m.id === materialId)) {
      setMaterialId('');
    }
  }

  const e = expandedEnd ? EXPANDED_END_E[unitSystem] : 0;

  const stressResult = useMemo(() => {
    if (!materialId || !tempF) return null;
    const temp = parseFloat(tempF);
    if (Number.isNaN(temp)) return null;
    return lookupStress({ materialId, edition, tempF: temp, unitSystem });
  }, [materialId, tempF, edition, unitSystem]);

  const calcResult = useMemo(() => {
    if (!stressResult?.ok) return null;
    const S = stressResult.value;
    const Dval = parseFloat(D);
    const wVal = parseFloat(w);
    if (Number.isNaN(Dval) || Dval <= 0 || Number.isNaN(wVal) || wVal <= 0 || wVal > 1) return null;
    if (solveMode === 'thickness') {
      const Pval = parseFloat(P);
      if (Number.isNaN(Pval) || Pval <= 0) return null;
      return solveThickness({ P: Pval, D: Dval, S, w: wVal, e });
    }
    const tVal = parseFloat(t);
    if (Number.isNaN(tVal) || tVal <= 0) return null;
    return solveMAWP({ t: tVal, D: Dval, S, w: wVal, e });
  }, [stressResult, D, w, P, t, solveMode, e]);

  const pUnit = unitSystem === 'US' ? 'psi' : 'MPa';
  const lUnit = unitSystem === 'US' ? 'in' : 'mm';

  const resultPrecision =
    solveMode === 'thickness' ? (unitSystem === 'US' ? 4 : 2) : unitSystem === 'US' ? 0 : 2;

  return (
    <main className="calc">
      <header className="calc-header">
        <h1>ASME Boiler Tube Calculator</h1>
        <p className="subtitle">Section I PG-27.2.1 — Minimum Wall Thickness</p>
      </header>

      <div className="calc-body">
        <section className="panel">
          <h2>Material</h2>

          <div className="toggle-group" role="group" aria-label="Unit system">
            <button
              type="button"
              className={unitSystem === 'US' ? 'active' : ''}
              onClick={() => setUnitSystem('US')}
            >
              US (psi / in)
            </button>
            <button
              type="button"
              className={unitSystem === 'SI' ? 'active' : ''}
              onClick={() => setUnitSystem('SI')}
            >
              SI (MPa / mm)
            </button>
          </div>

          <label className="field">
            Edition
            <select
              value={edition}
              onChange={(ev) => handleEditionChange(ev.target.value as Edition)}
            >
              <option value="asme-2015">ASME 2015 (post-1999)</option>
              <option value="pre-1999">Pre-1999</option>
            </select>
          </label>

          <label className="field">
            Material
            <select value={materialId} onChange={(ev) => setMaterialId(ev.target.value)}>
              <option value="">— select —</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.spec}
                  {m.grade ? ` ${m.grade}` : ''}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            Design temperature (°F)
            <input
              type="number"
              value={tempF}
              onChange={(ev) => setTempF(ev.target.value)}
              placeholder="e.g. 700"
              disabled={!materialId}
            />
          </label>

          {stressResult && (
            <div className={`stress-badge ${stressResult.ok ? 'ok' : 'err'}`}>
              {stressResult.ok
                ? `S = ${unitSystem === 'US' ? Math.round(stressResult.value) : stressResult.value.toFixed(2)} ${pUnit}`
                : stressResult.error}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Calculation</h2>

          <div className="toggle-group" role="group" aria-label="Solve for">
            <button
              type="button"
              className={solveMode === 'thickness' ? 'active' : ''}
              onClick={() => setSolveMode('thickness')}
            >
              Thickness t
            </button>
            <button
              type="button"
              className={solveMode === 'mawp' ? 'active' : ''}
              onClick={() => setSolveMode('mawp')}
            >
              MAWP P
            </button>
          </div>

          {solveMode === 'thickness' ? (
            <label className="field">
              Design pressure P ({pUnit})
              <input
                type="number"
                value={P}
                onChange={(ev) => setP(ev.target.value)}
                placeholder="e.g. 1200"
              />
            </label>
          ) : (
            <label className="field">
              Wall thickness t ({lUnit})
              <input
                type="number"
                value={t}
                onChange={(ev) => setT(ev.target.value)}
                placeholder="e.g. 0.165"
              />
            </label>
          )}

          <label className="field">
            Outside diameter D ({lUnit})
            <input
              type="number"
              value={D}
              onChange={(ev) => setD(ev.target.value)}
              placeholder="e.g. 2.375"
            />
          </label>

          <label className="field">
            Joint efficiency w
            <input
              type="number"
              value={w}
              onChange={(ev) => setW(ev.target.value)}
              min="0.05"
              max="1"
              step="0.05"
            />
          </label>

          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={expandedEnd}
              onChange={(ev) => setExpandedEnd(ev.target.checked)}
            />
            Expanded tube end (e = {EXPANDED_END_E[unitSystem]} {lUnit})
          </label>

          {calcResult && (
            <div className={`result ${calcResult.ok ? 'ok' : 'err'}`}>
              {calcResult.ok ? (
                <>
                  <span className="result-label">{solveMode === 'thickness' ? 't' : 'P'} =</span>
                  <span className="result-value">{calcResult.value.toFixed(resultPrecision)}</span>
                  <span className="result-unit">{solveMode === 'thickness' ? lUnit : pUnit}</span>
                </>
              ) : (
                calcResult.error
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;
