import { useState, useMemo } from 'react';
import { solveBend } from '../engine/bend';
import type { UnitSystem } from '../engine/units';

interface BendCalculatorProps {
  unitSystem: UnitSystem;
  lastT?: number;
}

export function BendCalculator({ unitSystem, lastT }: BendCalculatorProps) {
  const [tInput, setTInput] = useState('');
  const [D, setD] = useState('');
  const [R, setR] = useState('');
  const [showWork, setShowWork] = useState(false);

  const lUnit = unitSystem === 'US' ? 'in' : 'mm';
  const precision = unitSystem === 'US' ? 4 : 2;

  function handleUseLastResult() {
    if (lastT === undefined) return;
    setTInput(lastT.toFixed(precision));
  }

  const result = useMemo(() => {
    const tVal = parseFloat(tInput);
    const dVal = parseFloat(D);
    const rVal = parseFloat(R);
    if (Number.isNaN(tVal) || Number.isNaN(dVal) || Number.isNaN(rVal)) return null;
    return solveBend({ D: dVal, t: tVal, R: rVal });
  }, [tInput, D, R]);

  return (
    <section className="bend-panel">
      <h2>
        Bend Check <span className="bend-label">— Supplementary, not PG-27.2.1</span>
      </h2>

      <div className="section-grid">
        <div className="field">
          <span className="field-label">Straight-tube min wall t ({lUnit})</span>
          <input
            type="number"
            value={tInput}
            onChange={(ev) => setTInput(ev.target.value)}
            placeholder={unitSystem === 'US' ? 'e.g. 0.165' : 'e.g. 4.5'}
          />
          <button
            type="button"
            className="use-last-btn"
            onClick={handleUseLastResult}
            disabled={lastT === undefined}
          >
            Use last result
          </button>
        </div>

        <label className="field">
          <span className="field-label">Outside diameter D ({lUnit})</span>
          <input
            type="number"
            value={D}
            onChange={(ev) => setD(ev.target.value)}
            placeholder={unitSystem === 'US' ? 'e.g. 2.375' : 'e.g. 51'}
          />
        </label>

        <label className="field">
          <span className="field-label">Bend radius to centerline R ({lUnit})</span>
          <input
            type="number"
            value={R}
            onChange={(ev) => setR(ev.target.value)}
            placeholder={unitSystem === 'US' ? 'e.g. 3.0' : 'e.g. 76.5'}
          />
        </label>
      </div>

      {result && (
        <div className={`result ${result.ok ? 'ok' : 'err'}`}>
          {result.ok ? (
            <>
              <span className="result-label">Y =</span>
              <span className="result-value">{result.value.toFixed(precision)}</span>
              <span className="result-unit">{lUnit}</span>
            </>
          ) : (
            result.error
          )}
        </div>
      )}

      {result?.ok && (
        <div className="show-work">
          <button type="button" onClick={() => setShowWork((v) => !v)}>
            {showWork ? 'Hide work' : 'Show work'}
          </button>
          {showWork && (
            <dl className="steps">
              <dt>r</dt>
              <dd>
                {result.steps['r'].toFixed(precision)} {lUnit}
              </dd>
              <dt>Y</dt>
              <dd>
                {result.steps['Y'].toFixed(precision)} {lUnit}
              </dd>
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
