import type { CalcResult } from './types';

export interface SolveBendParams {
  D: number;
  t: number;
  R: number;
}

export function solveBend(p: SolveBendParams): CalcResult {
  const { D, t, R } = p;
  if (D <= 0) return { ok: false, error: 'D must be positive' };
  if (t <= 0) return { ok: false, error: 't must be positive' };
  if (R <= 0) return { ok: false, error: 'R must be positive' };
  if (t >= D / 2) return { ok: false, error: 'wall thickness must be less than D/2' };

  const r = (D - 2 * t) / 2;
  const Y = (t * (R + r / 2)) / (R + r);

  return {
    ok: true,
    value: Y,
    steps: { r, Y },
    notes: [],
  };
}
