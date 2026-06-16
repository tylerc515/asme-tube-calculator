import type { UnitSystem } from '../engine/units';

export interface LogRow {
  timestamp: string;
  setName: string;
  unitSystem: UnitSystem;
  edition: 'pre-1999' | 'asme-2015';
  materialId: string;
  tempF: number;
  S: number;
  sSource: 'table' | 'override';
  solveMode: 'thickness' | 'mawp';
  P: number;
  t: number;
  D: number;
  w: number;
  e: number;
}

export interface LogStore {
  add(row: LogRow): void;
  getAll(): readonly LogRow[];
  clear(): void;
  setName(name: string): void;
  getName(): string;
}
