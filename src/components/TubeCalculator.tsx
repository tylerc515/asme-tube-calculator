import { useState, useMemo } from 'react';
import { getMaterials, lookupStress } from '../engine/stress';
import { solveThickness, solveMAWP } from '../engine/tube';
import { EXPANDED_END_E } from '../engine/units';
import type { UnitSystem } from '../engine/units';
import { BendCalculator } from './BendCalculator';
import { Tooltip } from './Tooltip';

type Edition = 'pre-1999' | 'asme-2015';
type SolveMode = 'thickness' | 'mawp';

export function TubeCalculator() {
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
  const [showWork, setShowWork] = useState(false);

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

  const lastT: number | undefined =
    solveMode === 'thickness' && calcResult !== null && calcResult.ok
      ? calcResult.value
      : undefined;

  const pUnit = unitSystem === 'US' ? 'psi' : 'MPa';
  const lUnit = unitSystem === 'US' ? 'in' : 'mm';

  const resultPrecision =
    solveMode === 'thickness' ? (unitSystem === 'US' ? 4 : 2) : unitSystem === 'US' ? 0 : 2;

  const minWall = unitSystem === 'US' ? 0.125 : 3.2;

  return (
    <div className="calculator">
      <div className="global-inputs">
        <div className="field-subheading">
          <span>Units</span>
          <Tooltip text="Sets the unit system for all inputs and outputs. US uses psi and inches; SI uses MPa and mm. The e constant (expanded tube ends) is 0.04 in or 1.0 mm — these are independent code values, not conversions of each other." />
        </div>
        <div className="unit-toggle" role="group" aria-label="Unit system">
          <button
            type="button"
            aria-pressed={unitSystem === 'US'}
            className={unitSystem === 'US' ? 'active' : ''}
            onClick={() => setUnitSystem('US')}
          >
            US (psi / in)
          </button>
          <button
            type="button"
            aria-pressed={unitSystem === 'SI'}
            className={unitSystem === 'SI' ? 'active' : ''}
            onClick={() => setUnitSystem('SI')}
          >
            SI (MPa / mm)
          </button>
        </div>

        <label className="field">
          <span className="field-label">
            Edition
            <Tooltip text="Code year governing allowable stresses. Post-1999 editions use a 3.5:1 design factor; pre-1999 used 4:1." />
          </span>
          <select
            value={edition}
            onChange={(ev) => handleEditionChange(ev.target.value as Edition)}
          >
            <option value="asme-2015">ASME 2015 (post-1999)</option>
            <option value="pre-1999">Pre-1999</option>
          </select>
        </label>
      </div>

      <section className="calc-section">
        <h2 className="section-heading">Tube Properties</h2>

        <label className="field">
          <span className="field-label">
            Material
            <Tooltip text="Tube specification and grade. Determines the allowable stress S from Table 1A of Section II-D." />
          </span>
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
          <span className="field-label">
            Outside diameter D ({lUnit})
            <Tooltip text="Tube outside diameter as ordered or measured." />
          </span>
          <input
            type="number"
            value={D}
            onChange={(ev) => setD(ev.target.value)}
            placeholder="e.g. 2.375"
          />
        </label>
      </section>

      <section className="calc-section">
        <h2 className="section-heading">Service Conditions</h2>

        <label className="field">
          <span className="field-label">
            Design temperature (°F)
            <Tooltip text="Temperature at which the tube operates at full pressure. Determines S from Table 1A." />
          </span>
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
            <span className="field-label">
              Design pressure P ({pUnit})
              <Tooltip text="Maximum allowable working pressure (gauge). For boilers, this can be found on the boiler nameplate or in the original design documentation. Must be positive." />
            </span>
            <input
              type="number"
              value={P}
              onChange={(ev) => setP(ev.target.value)}
              placeholder="e.g. 1200"
            />
          </label>
        ) : (
          <label className="field">
            <span className="field-label">
              Wall thickness t ({lUnit})
              <Tooltip text="Nominal outside-to-inside wall thickness being checked against MAWP." />
            </span>
            <input
              type="number"
              value={t}
              onChange={(ev) => setT(ev.target.value)}
              placeholder="e.g. 0.165"
            />
          </label>
        )}

        <label className="field">
          <span className="field-label">
            Joint efficiency w
            <Tooltip text="Ligament efficiency or weld joint efficiency per PG-27.4.5. 1.0 for seamless tubes; less for ligamented drums." />
          </span>
          <input
            type="number"
            value={w}
            onChange={(ev) => setW(ev.target.value)}
            min="0.05"
            max="1"
            step="0.05"
          />
        </label>

        <div className="checkbox-row">
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={expandedEnd}
              onChange={(ev) => setExpandedEnd(ev.target.checked)}
            />
            Expanded tube end (e = {EXPANDED_END_E[unitSystem]} {lUnit})
          </label>
          <Tooltip text="Adds 0.04 in (1.0 mm) per PG-27.4.4 for tubes expanded into headers or drums." />
        </div>
      </section>

      {calcResult && (
        <div className="result-block">
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

          {solveMode === 'thickness' && calcResult.ok && calcResult.value < minWall && (
            <p className="min-wall-note">
              Below typical manufacturing minimum ({unitSystem === 'US' ? '0.125 in' : '3.2 mm'})
            </p>
          )}

          {calcResult.ok && (
            <div className="show-work">
              <button type="button" onClick={() => setShowWork((v) => !v)}>
                {showWork ? 'Hide work' : 'Show work'}
              </button>
              {showWork && (
                <dl className="steps">
                  {solveMode === 'thickness' ? (
                    <>
                      <dt>PD / (2Sw + P)</dt>
                      <dd>
                        {calcResult.steps['pressureTerm'].toFixed(resultPrecision)} {lUnit}
                      </dd>
                      <dt>0.005D</dt>
                      <dd>
                        {calcResult.steps['correctionTerm'].toFixed(resultPrecision)} {lUnit}
                      </dd>
                      <dt>e (input)</dt>
                      <dd>
                        {e.toFixed(resultPrecision)} {lUnit}
                      </dd>
                    </>
                  ) : (
                    <>
                      <dt>2t − 0.01D − 2e</dt>
                      <dd>
                        {calcResult.steps['numerator'].toFixed(resultPrecision)} {lUnit}
                      </dd>
                      <dt>D − (t − 0.005D − e)</dt>
                      <dd>
                        {calcResult.steps['denominator'].toFixed(resultPrecision)} {lUnit}
                      </dd>
                      <dt>Sw</dt>
                      <dd>
                        {calcResult.steps['Sw'].toFixed(0)} {pUnit}
                      </dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          )}
        </div>
      )}

      <BendCalculator unitSystem={unitSystem} lastT={lastT} />
    </div>
  );
}
