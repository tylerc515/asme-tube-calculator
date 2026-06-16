export type UnitSystem = 'US' | 'SI';

export const MM_PER_IN = 25.4;

// 1 lbf = 4.4482216152605 N (exact); 1 in = 0.0254 m (exact)
// => 1 psi = 6894.757293168361 Pa
export const PSI_PER_MPA = 1e6 / 6894.757293168361;

// PG-27.4.4 tabulates e separately for each unit edition; 1.0 mm != 0.04 in * 25.4.
// See docs/decisions/001-e-constant-units.md
export const EXPANDED_END_E: Record<UnitSystem, number> = {
  US: 0.04,
  SI: 1.0,
};

export function inToMm(inches: number): number {
  return inches * MM_PER_IN;
}

export function mmToIn(mm: number): number {
  return mm / MM_PER_IN;
}

export function psiToMpa(psi: number): number {
  return psi / PSI_PER_MPA;
}

export function mpaToPsi(mpa: number): number {
  return mpa * PSI_PER_MPA;
}
