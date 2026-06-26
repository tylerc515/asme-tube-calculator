import { describe, expect, it } from 'vitest';
import { inToMm, mmToIn } from './units';
import { solveBend } from './bend';

const TOL_US = 1e-4;
const TOL_ROUNDTRIP = 1e-9;

// Golden vectors from tubewall sheet formula cells P22 and P23 (live formulas, not hardcoded).
// The 2.45 mm value in appm 4 rb G4 is the PG-27.2.1 straight-tube result — not a bend value.
describe('solveBend — golden vectors', () => {
  it('P22: D=1.625in t=0.150in R=4.000in → Y=0.13934in', () => {
    const r = solveBend({ D: 1.625, t: 0.15, R: 4.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(Math.abs(r.value - 0.13934)).toBeLessThan(TOL_US);
  });

  it('P23: D=1.625in t=0.171in R=1.000in → Y=0.13759in', () => {
    const r = solveBend({ D: 1.625, t: 0.171, R: 1.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(Math.abs(r.value - 0.13759)).toBeLessThan(TOL_US);
  });
});

describe('solveBend — SI round-trip', () => {
  it('P22 inputs in mm → result in mm → inches matches US result to 1e-9', () => {
    const usResult = solveBend({ D: 1.625, t: 0.15, R: 4.0 });
    const siResult = solveBend({ D: inToMm(1.625), t: inToMm(0.15), R: inToMm(4.0) });
    expect(usResult.ok).toBe(true);
    expect(siResult.ok).toBe(true);
    if (usResult.ok && siResult.ok) {
      expect(Math.abs(mmToIn(siResult.value) - usResult.value)).toBeLessThan(TOL_ROUNDTRIP);
    }
  });
});

describe('solveBend — invalid inputs', () => {
  it('rejects D = 0', () => expect(solveBend({ D: 0, t: 0.15, R: 4.0 }).ok).toBe(false));
  it('rejects D < 0', () => expect(solveBend({ D: -1, t: 0.15, R: 4.0 }).ok).toBe(false));
  it('rejects t = 0', () => expect(solveBend({ D: 1.625, t: 0, R: 4.0 }).ok).toBe(false));
  it('rejects t < 0', () => expect(solveBend({ D: 1.625, t: -0.1, R: 4.0 }).ok).toBe(false));
  it('rejects R = 0', () => expect(solveBend({ D: 1.625, t: 0.15, R: 0 }).ok).toBe(false));
  it('rejects R < 0', () => expect(solveBend({ D: 1.625, t: 0.15, R: -1 }).ok).toBe(false));
  it('rejects t = D/2', () => expect(solveBend({ D: 1.625, t: 1.625 / 2, R: 4.0 }).ok).toBe(false));
  it('rejects t > D/2', () => expect(solveBend({ D: 1.625, t: 1.0, R: 4.0 }).ok).toBe(false));
});

describe('solveBend — Y < t (outside of bend never needs more wall than straight minimum)', () => {
  it('Y < t for P22 inputs', () => {
    const r = solveBend({ D: 1.625, t: 0.15, R: 4.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeLessThan(0.15);
  });
  it('Y < t for P23 inputs', () => {
    const r = solveBend({ D: 1.625, t: 0.171, R: 1.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeLessThan(0.171);
  });
});

describe('solveBend — steps', () => {
  it('steps.r is a number', () => {
    const r = solveBend({ D: 1.625, t: 0.15, R: 4.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(typeof r.steps['r']).toBe('number');
  });
  it('steps.Y equals result.value', () => {
    const r = solveBend({ D: 1.625, t: 0.15, R: 4.0 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.steps['Y']).toBe(r.value);
  });
});
