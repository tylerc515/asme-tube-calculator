import type { CalcResult } from './types';
import type { UnitSystem } from './units';
import { PSI_PER_MPA } from './units';
import asme2015 from '../data/editions/asme-2015.json';
import pre1999 from '../data/editions/pre-1999.json';

interface StressPoint {
  tempF: number;
  stressKsi: number;
}

interface MaterialEntry {
  id: string;
  spec: string;
  grade: string;
  curve: StressPoint[];
}

interface EditionData {
  materials: MaterialEntry[];
}

const editions: Record<string, EditionData> = {
  'asme-2015': asme2015 as EditionData,
  'pre-1999': pre1999 as EditionData,
};

export interface MaterialInfo {
  id: string;
  spec: string;
  grade: string;
}

export function getMaterials(edition: 'pre-1999' | 'asme-2015'): MaterialInfo[] {
  const data = editions[edition];
  if (!data) return [];
  return data.materials
    .filter((m) => m.curve.length > 0)
    .map(({ id, spec, grade }) => ({ id, spec, grade }));
}

export interface StressQuery {
  materialId: string;
  edition: 'pre-1999' | 'asme-2015';
  tempF: number;
  unitSystem: UnitSystem;
}

export function lookupStress(query: StressQuery): CalcResult {
  const { materialId, edition, tempF, unitSystem } = query;

  const editionData = editions[edition];
  if (!editionData) return { ok: false, error: `unknown edition: ${edition}` };

  const material = editionData.materials.find((m) => m.id === materialId);
  if (!material) return { ok: false, error: `${materialId} not found in ${edition}` };

  const curve = material.curve;
  if (curve.length === 0) return { ok: false, error: `${materialId} has no tabulated stress data` };

  const sorted = [...curve].sort((a, b) => a.tempF - b.tempF);
  const tmin = sorted[0].tempF;
  const tmax = sorted[sorted.length - 1].tempF;

  if (tempF < tmin || tempF > tmax) {
    return {
      ok: false,
      error: `${tempF}°F is outside the tabulated range [${tmin}, ${tmax}]°F for ${materialId}`,
    };
  }

  const exact = sorted.find((p) => p.tempF === tempF);
  if (exact) {
    const valuePsi = exact.stressKsi * 1000;
    const value = unitSystem === 'US' ? valuePsi : valuePsi / PSI_PER_MPA;
    return { ok: true, value, steps: { tempF, stressKsi: exact.stressKsi }, notes: [] };
  }

  let lo = sorted[0];
  let hi = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].tempF <= tempF && sorted[i + 1].tempF >= tempF) {
      lo = sorted[i];
      hi = sorted[i + 1];
      break;
    }
  }

  const fraction = (tempF - lo.tempF) / (hi.tempF - lo.tempF);
  const stressKsi = lo.stressKsi + fraction * (hi.stressKsi - lo.stressKsi);
  const valuePsi = stressKsi * 1000;
  const value = unitSystem === 'US' ? valuePsi : valuePsi / PSI_PER_MPA;

  return {
    ok: true,
    value,
    steps: {
      tempLow: lo.tempF,
      tempHigh: hi.tempF,
      stressLow: lo.stressKsi,
      stressHigh: hi.stressKsi,
      fraction,
      stressKsi,
    },
    notes: [],
  };
}
