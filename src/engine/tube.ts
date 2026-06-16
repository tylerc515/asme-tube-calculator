import type { CalcResult } from './types';

export interface SolveThicknessParams {
  P: number;
  D: number;
  S: number;
  w: number;
  e: number;
}

export interface SolveMAWPParams {
  t: number;
  D: number;
  S: number;
  w: number;
  e: number;
}

export function solveThickness(p: SolveThicknessParams): CalcResult {
  const { P, D, S, w, e } = p;
  if (P <= 0) return { ok: false, error: 'P must be positive' };
  if (D <= 0) return { ok: false, error: 'D must be positive' };
  if (S <= 0) return { ok: false, error: 'S must be positive' };
  if (w <= 0) return { ok: false, error: 'w must be positive' };
  if (e < 0) return { ok: false, error: 'e must be non-negative' };

  const pressureTerm = (P * D) / (2 * S * w + P);
  const correctionTerm = 0.005 * D;
  const value = pressureTerm + correctionTerm + e;

  return {
    ok: true,
    value,
    steps: { pressureTerm, correctionTerm, e },
    notes: [],
  };
}

export function solveMAWP(p: SolveMAWPParams): CalcResult {
  const { t, D, S, w, e } = p;
  if (t <= 0) return { ok: false, error: 't must be positive' };
  if (D <= 0) return { ok: false, error: 'D must be positive' };
  if (S <= 0) return { ok: false, error: 'S must be positive' };
  if (w <= 0) return { ok: false, error: 'w must be positive' };
  if (e < 0) return { ok: false, error: 'e must be non-negative' };

  const numerator = 2 * t - 0.01 * D - 2 * e;
  const denominator = D - (t - 0.005 * D - e);

  if (numerator <= 0) return { ok: false, error: 'net thickness is zero or negative' };
  if (denominator <= 0) return { ok: false, error: 'effective diameter term is non-positive' };

  const Sw = S * w;
  const value = Sw * (numerator / denominator);

  return {
    ok: true,
    value,
    steps: { numerator, denominator, Sw },
    notes: [],
  };
}
