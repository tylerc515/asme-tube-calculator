import { describe, expect, it } from 'vitest';
import { lookupStress } from './stress';

describe('lookupStress — exact temperature hit', () => {
  it('returns the tabulated value when tempF matches exactly', () => {
    const r = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 700,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    // SA-178-C @ 700°F = 15.6 ksi = 15600 psi
    if (r.ok) expect(r.value).toBeCloseTo(15600, 0);
  });

  it('SA-178-C @ 1000°F = 2500 psi (not 2100 or 4800)', () => {
    const r = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 1000,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBeCloseTo(2500, 0);
      expect(r.value).not.toBeCloseTo(2100, 0);
    }
  });

  it('SA-209-T1 @ 1000°F = 2500 psi (not 4800)', () => {
    const r = lookupStress({
      materialId: 'SA-209-T1',
      edition: 'asme-2015',
      tempF: 1000,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBeCloseTo(2500, 0);
      expect(r.value).not.toBeCloseTo(4800, 0);
    }
  });
});

describe('lookupStress — interpolation', () => {
  it('interpolates linearly between two tabulated temperatures', () => {
    // SA-213-T22: 700°F = 17.1 ksi, 800°F = 17.1 ksi → midpoint 750°F = 17.1 ksi
    const r = lookupStress({
      materialId: 'SA-213-T22',
      edition: 'asme-2015',
      tempF: 750,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(17100, 0);
  });

  it('result is between the two bracketing values', () => {
    // SA-213-T91: 700°F=20.0ksi, 800°F=19.3ksi → 750°F should be ~19.65ksi
    const r = lookupStress({
      materialId: 'SA-213-T91',
      edition: 'asme-2015',
      tempF: 750,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBeGreaterThan(19300);
      expect(r.value).toBeLessThan(20000);
    }
  });

  it('records interpolation metadata in steps', () => {
    const r = lookupStress({
      materialId: 'SA-213-T91',
      edition: 'asme-2015',
      tempF: 750,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(typeof r.steps['tempLow']).toBe('number');
      expect(typeof r.steps['tempHigh']).toBe('number');
      expect(typeof r.steps['fraction']).toBe('number');
    }
  });
});

describe('lookupStress — out-of-range', () => {
  it('returns ok:false when temp is below lowest tabulated value', () => {
    const r = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 50,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(false);
  });

  it('returns ok:false when temp is above highest tabulated value', () => {
    const r = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 2000,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(false);
  });
});

describe('lookupStress — error cases', () => {
  it('returns ok:false for unknown material', () => {
    const r = lookupStress({
      materialId: 'SA-999-X',
      edition: 'asme-2015',
      tempF: 700,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(false);
  });

  it('returns ok:false for material not in pre-1999 edition', () => {
    // SA-178-D is asme-2015-only, not in pre-1999
    const r = lookupStress({
      materialId: 'SA-178-D',
      edition: 'pre-1999',
      tempF: 700,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(false);
  });

  it('returns ok:false for material with empty curve (T23 not in Table 1A)', () => {
    const r = lookupStress({
      materialId: 'SA-213-T23',
      edition: 'asme-2015',
      tempF: 700,
      unitSystem: 'US',
    });
    expect(r.ok).toBe(false);
  });

  it('returns stress in MPa when unitSystem is SI', () => {
    const us = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 700,
      unitSystem: 'US',
    });
    const si = lookupStress({
      materialId: 'SA-178-C',
      edition: 'asme-2015',
      tempF: 700,
      unitSystem: 'SI',
    });
    expect(us.ok).toBe(true);
    expect(si.ok).toBe(true);
    if (us.ok && si.ok) {
      // SI value should be approximately PSI / 145.038
      expect(si.value).toBeCloseTo(us.value / 145.038, 0);
    }
  });
});
