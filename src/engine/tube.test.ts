import { describe, expect, it } from 'vitest';
import { inToMm, mmToIn, psiToMpa } from './units';
import { solveMAWP, solveThickness } from './tube';

function relErr(actual: number, expected: number): number {
  return Math.abs(actual - expected) / Math.abs(expected);
}

const TOL = 1e-9;

describe('solveThickness — golden vectors', () => {
  it('vector 1: P=970, D=2.375, S=15600, w=1, e=0', () => {
    const r = solveThickness({ P: 970, D: 2.375, S: 15600, w: 1, e: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(relErr(r.value, 0.0834867500777122)).toBeLessThan(TOL);
  });

  it('vector 2: P=1200, D=3, S=11500, w=1, e=0', () => {
    const r = solveThickness({ P: 1200, D: 3, S: 11500, w: 1, e: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(relErr(r.value, 0.163760330578512)).toBeLessThan(TOL);
  });
});

describe('solveMAWP — golden vectors', () => {
  it('vector 3: S=14400, t=0.173, D=2.5, w=1, e=0', () => {
    const r = solveMAWP({ t: 0.173, D: 2.5, S: 14400, w: 1, e: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(relErr(r.value, 1975.806796324)).toBeLessThan(TOL);
  });
});

describe('round-trip: solveThickness → solveMAWP', () => {
  it('solveMAWP recovers original P from solveThickness result', () => {
    const inputs = { P: 970, D: 2.375, S: 15600, w: 1, e: 0 };
    const tResult = solveThickness(inputs);
    expect(tResult.ok).toBe(true);
    if (!tResult.ok) return;
    const pResult = solveMAWP({
      t: tResult.value,
      D: inputs.D,
      S: inputs.S,
      w: inputs.w,
      e: inputs.e,
    });
    expect(pResult.ok).toBe(true);
    if (pResult.ok) expect(relErr(pResult.value, inputs.P)).toBeLessThan(TOL);
  });
});

describe('US/SI cross-unit agreement (e=0)', () => {
  it('solveThickness gives the same physical result in both unit systems', () => {
    const usResult = solveThickness({ P: 970, D: 2.375, S: 15600, w: 1, e: 0 });
    const siResult = solveThickness({
      P: psiToMpa(970),
      D: inToMm(2.375),
      S: psiToMpa(15600),
      w: 1,
      e: 0,
    });
    expect(usResult.ok).toBe(true);
    expect(siResult.ok).toBe(true);
    if (usResult.ok && siResult.ok) {
      expect(relErr(mmToIn(siResult.value), usResult.value)).toBeLessThan(TOL);
    }
  });
});

describe('CalcResult steps', () => {
  it('solveThickness steps include pressureTerm and correctionTerm', () => {
    const r = solveThickness({ P: 970, D: 2.375, S: 15600, w: 1, e: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(typeof r.steps['pressureTerm']).toBe('number');
      expect(typeof r.steps['correctionTerm']).toBe('number');
    }
  });

  it('solveMAWP steps include numerator and denominator', () => {
    const r = solveMAWP({ t: 0.173, D: 2.5, S: 14400, w: 1, e: 0 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(typeof r.steps['numerator']).toBe('number');
      expect(typeof r.steps['denominator']).toBe('number');
    }
  });
});

describe('solveThickness — input validation', () => {
  it('rejects P = 0', () => {
    expect(solveThickness({ P: 0, D: 2.375, S: 15600, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects P < 0', () => {
    expect(solveThickness({ P: -1, D: 2.375, S: 15600, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects D <= 0', () => {
    expect(solveThickness({ P: 970, D: 0, S: 15600, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects S <= 0', () => {
    expect(solveThickness({ P: 970, D: 2.375, S: 0, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects w <= 0', () => {
    expect(solveThickness({ P: 970, D: 2.375, S: 15600, w: 0, e: 0 }).ok).toBe(false);
  });

  it('rejects e < 0', () => {
    expect(solveThickness({ P: 970, D: 2.375, S: 15600, w: 1, e: -0.01 }).ok).toBe(false);
  });
});

describe('solveMAWP — input validation', () => {
  it('rejects t <= 0', () => {
    expect(solveMAWP({ t: 0, D: 2.5, S: 14400, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects D <= 0', () => {
    expect(solveMAWP({ t: 0.173, D: 0, S: 14400, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects S <= 0', () => {
    expect(solveMAWP({ t: 0.173, D: 2.5, S: 0, w: 1, e: 0 }).ok).toBe(false);
  });

  it('rejects w <= 0', () => {
    expect(solveMAWP({ t: 0.173, D: 2.5, S: 14400, w: 0, e: 0 }).ok).toBe(false);
  });

  it('rejects e < 0', () => {
    expect(solveMAWP({ t: 0.173, D: 2.5, S: 14400, w: 1, e: -0.01 }).ok).toBe(false);
  });

  it('rejects wall too thin: 2t - 0.01D - 2e <= 0', () => {
    // t exactly equal to the correction terms → numerator = 0
    expect(solveMAWP({ t: 0.005 * 2.5, D: 2.5, S: 14400, w: 1, e: 0 }).ok).toBe(false);
  });
});
