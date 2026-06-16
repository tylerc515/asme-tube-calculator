import { describe, expect, it } from 'vitest';
import { EXPANDED_END_E, inToMm, mmToIn, mpaToPsi, psiToMpa } from './units';

describe('unit conversions', () => {
  it('1 in = 25.4 mm', () => {
    expect(inToMm(1)).toBe(25.4);
  });

  it('25.4 mm = 1 in', () => {
    expect(mmToIn(25.4)).toBe(1);
  });

  it('length round-trip', () => {
    expect(mmToIn(inToMm(2.375))).toBeCloseTo(2.375, 12);
  });

  it('pressure round-trip', () => {
    expect(mpaToPsi(psiToMpa(15600))).toBeCloseTo(15600, 6);
  });
});

describe('EXPANDED_END_E', () => {
  it('US = 0.04 in', () => {
    expect(EXPANDED_END_E.US).toBe(0.04);
  });

  it('SI = 1.0 mm', () => {
    expect(EXPANDED_END_E.SI).toBe(1.0);
  });
});
